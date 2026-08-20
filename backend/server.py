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
    allow_methods=["*"],
    allow_headers=["*"],
)


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
