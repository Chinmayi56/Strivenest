from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt as pyjwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------- App / DB ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Strivenest API")
api = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get("JWT_SECRET", "changeme")
JWT_ALG = "HS256"
JWT_EXP_MIN = 60 * 24  # 24h

bearer_scheme = HTTPBearer(auto_error=False)


# ---------- Helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXP_MIN),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class ProjectIn(BaseModel):
    name: str
    tag: str
    description: str = ""
    image_url: str = ""


class ServiceIn(BaseModel):
    title: str
    icon: str = "Sparkles"
    description: str = ""


class IndustryIn(BaseModel):
    name: str
    description: str = ""


class JobIn(BaseModel):
    title: str
    category: str  # IT, Sales, Digital Marketing
    experience: str
    description: str = ""


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    service: str = "Other"
    message: str


# ---------- Auth ----------
@api.post("/auth/login")
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"], user["role"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
    }


@api.get("/auth/me", response_model=UserOut)
async def me(current=Depends(get_current_admin)):
    return current


# ---------- Generic CRUD factory ----------
def make_crud(path: str, collection: str, ModelIn: type):
    @api.get(f"/{path}")
    async def list_items():
        items = await db[collection].find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
        return items

    @api.post(f"/{path}")
    async def create_item(body: ModelIn, _=Depends(get_current_admin)):
        doc = body.model_dump()
        doc["id"] = str(uuid.uuid4())
        doc["created_at"] = now_iso()
        doc["updated_at"] = now_iso()
        await db[collection].insert_one(doc)
        doc.pop("_id", None)
        return doc

    @api.put(f"/{path}/{{item_id}}")
    async def update_item(item_id: str, body: ModelIn, _=Depends(get_current_admin)):
        update = body.model_dump()
        update["updated_at"] = now_iso()
        res = await db[collection].find_one_and_update(
            {"id": item_id}, {"$set": update}, return_document=True, projection={"_id": 0}
        )
        if not res:
            raise HTTPException(status_code=404, detail="Not found")
        return res

    @api.delete(f"/{path}/{{item_id}}")
    async def delete_item(item_id: str, _=Depends(get_current_admin)):
        res = await db[collection].delete_one({"id": item_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"ok": True}


make_crud("projects", "projects", ProjectIn)
make_crud("services", "services", ServiceIn)
make_crud("industries", "industries", IndustryIn)
make_crud("jobs", "jobs", JobIn)


# ---------- Contact submissions ----------
@api.post("/contact")
async def submit_contact(body: ContactIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    doc["status"] = "new"
    await db.contact_submissions.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}


@api.get("/contact")
async def list_contacts(_=Depends(get_current_admin)):
    items = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


@api.delete("/contact/{item_id}")
async def delete_contact(item_id: str, _=Depends(get_current_admin)):
    res = await db.contact_submissions.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api.get("/")
async def root():
    return {"service": "Strivenest API", "status": "ok"}


# ---------- Seed data on startup ----------
DEFAULT_SERVICES = [
    {"title": "Android App Development", "icon": "Smartphone"},
    {"title": "iOS App Development", "icon": "Apple"},
    {"title": "Flutter App Development", "icon": "Layers"},
    {"title": "Web Development", "icon": "Globe"},
    {"title": "UI/UX Design", "icon": "Palette"},
    {"title": "Digital Marketing", "icon": "Megaphone"},
    {"title": "GPS Vehicle Tracking", "icon": "MapPin"},
    {"title": "AI & ML Development", "icon": "Brain"},
    {"title": "Chrome Extension", "icon": "Chrome"},
]
DEFAULT_INDUSTRIES = [
    "E-Commerce App & Web", "Hotel Booking App & Website", "Real Estate Marketplace",
    "Food Delivery App", "Taxi Booking App", "News App", "ERP Development",
    "Security Management App", "Grocery Delivery App", "Laundry App Development",
    "Social Media App", "Logistic App", "Live Streaming App", "CRM Development",
    "IoT Development", "Dr. Consultation App",
]
DEFAULT_PROJECTS = [
    {"name": "Zipck", "tag": "Logistics & Delivery", "description": "On-demand parcel delivery platform."},
    {"name": "Yaarishh", "tag": "Social Network", "description": "Community-first social app for friends."},
    {"name": "Hunger Bites", "tag": "Food Delivery", "description": "Restaurant discovery and delivery app."},
    {"name": "Frugoo", "tag": "Grocery", "description": "Hyperlocal grocery delivery experience."},
    {"name": "Cinepass", "tag": "Entertainment", "description": "Movie ticketing and streaming pass."},
    {"name": "My Flat Info", "tag": "Real Estate", "description": "Apartment management super-app."},
    {"name": "Flythru", "tag": "Travel", "description": "Flight and travel booking platform."},
    {"name": "CakeFactory", "tag": "F&B", "description": "Custom cake ordering platform."},
    {"name": "Care Esteem", "tag": "Healthcare", "description": "Home healthcare booking app."},
    {"name": "Educonnect", "tag": "EdTech", "description": "Online learning and mentorship platform."},
]
DEFAULT_JOBS = [
    {"title": "React Native Developer", "category": "IT", "experience": "4 Years"},
    {"title": "Node.js Developer", "category": "IT", "experience": "5 - 6 Years"},
    {"title": "Flutter Developer", "category": "IT", "experience": "0 - 3 Years"},
    {"title": "PHP Laravel Developer", "category": "IT", "experience": "0 - 3 Years"},
    {"title": "Business Analyst", "category": "IT", "experience": "0 - 3 Years"},
    {"title": "UI/UX Designer", "category": "IT", "experience": "1 - 3 Years"},
    {"title": "Jr. Test Engineer", "category": "IT", "experience": "Freshers"},
    {"title": "BDM", "category": "Sales", "experience": "1 - 3 Years"},
    {"title": "Sales Executive", "category": "Sales", "experience": "Freshers"},
    {"title": "Digital Marketing Executive", "category": "Digital Marketing", "experience": "1 - 3 Years"},
]


@app.on_event("startup")
async def on_startup():
    # Ensure admin exists
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Strivenest Admin",
            "role": "admin",
            "password_hash": hash_password(admin_password),
            "created_at": now_iso(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed default content only if collections empty
    if await db.services.count_documents({}) == 0:
        for s in DEFAULT_SERVICES:
            await db.services.insert_one({**s, "id": str(uuid.uuid4()), "description": "", "created_at": now_iso(), "updated_at": now_iso()})
    if await db.industries.count_documents({}) == 0:
        for name in DEFAULT_INDUSTRIES:
            await db.industries.insert_one({"id": str(uuid.uuid4()), "name": name, "description": "", "created_at": now_iso(), "updated_at": now_iso()})
    if await db.projects.count_documents({}) == 0:
        for p in DEFAULT_PROJECTS:
            await db.projects.insert_one({**p, "id": str(uuid.uuid4()), "image_url": "", "created_at": now_iso(), "updated_at": now_iso()})
    if await db.jobs.count_documents({}) == 0:
        for j in DEFAULT_JOBS:
            await db.jobs.insert_one({**j, "id": str(uuid.uuid4()), "description": "", "created_at": now_iso(), "updated_at": now_iso()})


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


@app.on_event("shutdown")
async def shutdown_db():
    client.close()
