"""
Health check route — used to verify the API and MongoDB connection are up.
"""
from fastapi import APIRouter, Request
from database.mongodb import get_db

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health", summary="API and database health check")
async def health_check(request: Request):
    db_status = "unknown"
    try:
        db = get_db()
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    # Surfaces the outcome of the demo SuperAdmin/SubAdmin/Employee account
    # seeding that runs on every startup (see server.py's lifespan). A
    # process can report "started" while one of these seed steps silently
    # failed -- e.g. a transient Mongo hiccup at boot -- which then shows up
    # downstream as every login for that role returning "Invalid email or
    # password" with nothing in the response to explain why. Exposing it
    # here means a failed seed is visible on the same endpoint already used
    # to check the deployment, not only in scrollback logs.
    seed_status = getattr(request.app.state, "seed_status", {})
    seed_ok = all(v == "ok" for v in seed_status.values()) if seed_status else None

    return {
        "status": "ok",
        "service": "Strivenest Technologies SuperAdmin API",
        "database": db_status,
        "seed_status": seed_status,
        "seed_ok": seed_ok,
    }
