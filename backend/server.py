<<<<<<< HEAD
"""
Strivenest Technologies — SuperAdmin Backend
ONE FastAPI application. ONE MongoDB database. Serves the SuperAdmin portal
in this phase; SubAdmin and Employee roles/routes can be added later without
creating another backend.
"""
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from config import settings
from database.mongodb import connect_to_mongo, close_mongo_connection, get_db

logger = logging.getLogger("strivenest.startup")

from routes import (
    auth,
    superadmin,
    subadmin,
    applications,
    employees,
    registration_links,
    notifications,
    health,
    employee_applications,
    uploads,
    employee_portal,
    erp,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Hard safety boundary: DEMO_MODE enables a fixed/mock mobile-OTP login
    # (used by both the SuperAdmin and SubAdmin portals) and demo seed
    # accounts with known passwords. Neither has a real SMS provider or
    # production-grade credential behind it, so this refuses to even start
    # the app if someone deploys with ENVIRONMENT=production while
    # DEMO_MODE is still true (or left at its default) -- misconfiguration
    # fails loudly at startup instead of silently shipping a backdoor.
    if settings.ENVIRONMENT == "production" and settings.DEMO_MODE:
        raise RuntimeError(
            "Refusing to start: DEMO_MODE=true while ENVIRONMENT=production. "
            "Set DEMO_MODE=false (and remove/rotate any demo seed accounts) "
            "before deploying to production."
        )
    await connect_to_mongo()
    # Guarantee the demo SuperAdmin, SubAdmin, and demo Employee login
    # accounts exist on every startup, the same way they're meant to exist
    # per RUN_COMMANDS.txt (via `python seed_superadmin.py` /
    # `python seed_subadmin.py` / `python seed_demo_employee.py`) -- those
    # are separate manual steps that are easy to skip (and, on a platform
    # like Render, have no way to run at all unless wired into the start
    # command), and skipping any of them is exactly what makes the
    # corresponding demo credentials shown on that portal's login page fail
    # with "Invalid email or password" (no matching `users` record exists
    # at all, so login_with_email_password's `if not user` branch is hit --
    # this was confirmed happening for SuperAdmin even directly against
    # Swagger in production, i.e. before the request ever reaches password
    # verification). This calls the existing, already-idempotent/
    # self-healing seeding logic (a direct `users` insert for SuperAdmin/
    # SubAdmin, the real application -> SuperAdmin-approval flow for
    # Employee); it changes no authentication behavior.
    #
    # Seed failures must never be silent. A failed seed here means the
    # corresponding login will fail for every user with "Invalid email or
    # password" -- the exact symptom that caused the original production
    # incident -- while the process itself still reports as "started" and
    # every other route keeps working. So each seed step's outcome is
    # recorded on app.state.seed_status (surfaced by GET /api/health, see
    # routes/health.py) AND logged at ERROR level with a greppable
    # "[STARTUP ERROR]" marker, instead of a plain print() that's easy to
    # miss in a scrolling log stream. We still don't let a seed failure
    # crash the whole app -- MongoDB being briefly unreachable at boot
    # shouldn't take down routes that don't depend on these specific demo
    # accounts -- but the failure is now impossible to mistake for success.
    app.state.seed_status = {}

    async def _run_seed(role: str, seed_coro) -> None:
        try:
            await seed_coro
            app.state.seed_status[role] = "ok"
        except Exception as exc:
            app.state.seed_status[role] = f"FAILED: {exc.__class__.__name__}: {exc}"
            logger.error(
                "[STARTUP ERROR] %s account seeding failed -- the %s login "
                "will return 'Invalid email or password' for ALL credentials "
                "until this is fixed and the service is restarted. "
                "Check MONGO_URL/DB_NAME are correct and MongoDB is reachable. "
                "Error: %s: %s",
                role, role, exc.__class__.__name__, exc,
            )

    from seed_superadmin import seed_core as seed_superadmin_core
    from seed_subadmin import seed_core as seed_subadmin_core
    from seed_demo_employee import seed_core as seed_demo_employee_core

    await _run_seed("SuperAdmin", seed_superadmin_core(get_db()))
    await _run_seed("SubAdmin", seed_subadmin_core(get_db()))
    await _run_seed("Employee", seed_demo_employee_core(get_db()))

    if any(v != "ok" for v in app.state.seed_status.values()):
        logger.error(
            "[STARTUP ERROR] One or more demo accounts failed to seed: %s. "
            "See GET /api/health for a machine-readable status, and the "
            "errors above for the root cause.",
            {k: v for k, v in app.state.seed_status.items() if v != "ok"},
        )

    yield
    await close_mongo_connection()


app = FastAPI(
    title="Strivenest Technologies API",
    description=(
        "Single FastAPI backend for the Strivenest Technologies platform. "
        "Currently serves the SuperAdmin portal (auth, employee applications, "
        "employees, registration links, notifications, dashboard). "
        "Designed so SubAdmin and Employee roles can be added later on the "
        "same backend and database."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
=======
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
>>>>>>> 3de8e117fc08455cc745afddfc692d09a26ebff4
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak stack traces, database details or secrets to the client.
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(superadmin.router)
app.include_router(applications.router)
app.include_router(employees.router)
app.include_router(employees.public_router)
app.include_router(registration_links.router)
app.include_router(notifications.router)
app.include_router(employee_applications.router)
app.include_router(uploads.router)
app.include_router(employee_portal.router)
app.include_router(erp.router)

# SubAdmin routers: identical implementations to the SuperAdmin ones above
# (see each module's build_*_router factory), gated by require_subadmin
# instead, sharing the exact same MongoDB collections.
app.include_router(subadmin.router)
app.include_router(applications.subadmin_router)
app.include_router(employees.subadmin_router)
app.include_router(registration_links.subadmin_router)
app.include_router(notifications.subadmin_router)
app.include_router(erp.subadmin_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "Strivenest Technologies API",
        "docs": "/docs",
        "health": "/api/health",
    }
=======
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


@app.on_event("shutdown")
async def shutdown_db():
    client.close()
>>>>>>> 3de8e117fc08455cc745afddfc692d09a26ebff4
