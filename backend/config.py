"""
Centralized application configuration.
Reads values from environment variables (loaded from .env via python-dotenv).
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "strivenest")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "change_this_secret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://localhost:3002,"
            "http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002",
        ).split(",")
        if origin.strip()
    ]

    EMPLOYEE_PORTAL_URL: str = os.getenv("EMPLOYEE_PORTAL_URL", "http://localhost:3002")

    # Deployment environment: "development" (default) or "production".
    # Controls whether DEMO_MODE (fixed/mock OTP + demo seed accounts) is
    # allowed to run at all -- see the DEMO_MODE check just below and the
    # startup guard in server.py's lifespan.
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").strip().lower()

    # Demo mode gates every fixed/mock-credential mechanism in this codebase
    # (the shared SuperAdmin/SubAdmin mobile-OTP demo flow in
    # services/auth_service.py, and the SEED_SUBADMIN_* demo account below).
    # It defaults to on for local development, but server.py refuses to
    # start if ENVIRONMENT=production and DEMO_MODE is still true -- a
    # fixed OTP / seeded demo password must never be reachable in a real
    # deployment, so misconfiguration fails loudly at startup instead of
    # silently shipping a backdoor.
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").strip().lower() in ("1", "true", "yes", "on")

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "5"))

    # --- SuperAdmin seed credentials ----------------------------------------
    # SEED_SUPERADMIN_EMAIL/PASSWORD are used by seed_superadmin.py (and its
    # automatic call from server.py's startup lifespan) to guarantee a real,
    # usable SuperAdmin account exists -- this is the fix for the original
    # production 401/"Invalid email or password" incident, and it must stay.
    #
    # SECURITY: there is no safe default password in production. The old
    # behavior fell back to the well-known, publicly documented default
    # "SuperAdmin@123" (see .env.example / RUN_COMMANDS.txt) whenever
    # SEED_SUPERADMIN_PASSWORD wasn't set -- so a production deployment that
    # simply forgot to set that one environment variable would silently seed
    # (or self-heal) a real, production SuperAdmin account with a password
    # anyone can find in this repo. Email/password login
    # (services/auth_service.py::login_with_email_password) is NOT gated by
    # DEMO_MODE, so that account would be immediately usable.
    #
    # So: in production (ENVIRONMENT=production), SEED_SUPERADMIN_EMAIL and
    # SEED_SUPERADMIN_PASSWORD are now REQUIRED to be set explicitly via
    # environment variables -- if either is missing, the app refuses to
    # start with a clear error instead of silently falling back to the
    # known default. In development, the existing convenience defaults are
    # kept exactly as before, so local setup and the test suite (which never
    # sets ENVIRONMENT=production) are unaffected.
    _raw_superadmin_email = os.getenv("SEED_SUPERADMIN_EMAIL")
    _raw_superadmin_password = os.getenv("SEED_SUPERADMIN_PASSWORD")

    if ENVIRONMENT == "production":
        _missing_superadmin_vars = [
            var_name
            for var_name, var_value in (
                ("SEED_SUPERADMIN_EMAIL", _raw_superadmin_email),
                ("SEED_SUPERADMIN_PASSWORD", _raw_superadmin_password),
            )
            if not var_value
        ]
        if _missing_superadmin_vars:
            # Fail loudly at startup, before any Mongo connection or seed
            # attempt -- never fall back to a known default password in
            # production. The message intentionally names only which
            # variables are missing; it never includes a password value.
            raise RuntimeError(
                "Refusing to start: ENVIRONMENT=production but the following "
                "required environment variable(s) are not set: "
                + ", ".join(_missing_superadmin_vars)
                + ". There is no safe default SuperAdmin password in "
                "production. Set SEED_SUPERADMIN_EMAIL and "
                "SEED_SUPERADMIN_PASSWORD (e.g. as Render environment "
                "variables) to a real, private email/password before "
                "deploying. See .env.example and RUN_COMMANDS.txt for the "
                "full list of required production environment variables."
            )
        SEED_SUPERADMIN_EMAIL: str = _raw_superadmin_email
        SEED_SUPERADMIN_PASSWORD: str = _raw_superadmin_password
    else:
        # Development-only convenience defaults -- publicly documented,
        # never used unless ENVIRONMENT is left at its "development" default.
        SEED_SUPERADMIN_EMAIL: str = _raw_superadmin_email or "superadmin@strivenest.com"
        SEED_SUPERADMIN_PASSWORD: str = _raw_superadmin_password or "SuperAdmin@123"

    del _raw_superadmin_email, _raw_superadmin_password
    if ENVIRONMENT == "production":
        del _missing_superadmin_vars

    SEED_SUPERADMIN_MOBILE: str = os.getenv("SEED_SUPERADMIN_MOBILE", "9876543210")
    SEED_SUPERADMIN_NAME: str = os.getenv("SEED_SUPERADMIN_NAME", "Super Admin")

    # DEMO_OTP itself is not a secret risk in production: verify_demo_otp /
    # send_demo_otp both call _require_demo_mode() first (see
    # services/auth_service.py), and DEMO_MODE is force-disabled in
    # production by the server.py startup guard above. So this fixed value
    # is simply unreachable once DEMO_MODE=false, regardless of what it's
    # set to.
    DEMO_OTP: str = os.getenv("DEMO_OTP", "123456")

    # Demo SubAdmin seed account (used only by seed_subadmin.py), following
    # the exact same seeding pattern as SEED_SUPERADMIN_* above.
    # Deliberately a different email/mobile/password from the SuperAdmin
    # demo account so the two roles never share credentials.
    #
    # NOTE (production risk, left unchanged here -- see FIXES_APPLIED.md):
    # unlike the mobile-OTP flow, seed_subadmin.py's own guard only skips
    # seeding when DEMO_MODE=true; it does NOT skip when
    # ENVIRONMENT=production with DEMO_MODE=false (the required production
    # setting), and SubAdmin email/password login is not gated by DEMO_MODE
    # either. So this default password (like SEED_SUPERADMIN_PASSWORD
    # before this fix) COULD still be seeded/self-healed in production if
    # SEED_SUBADMIN_PASSWORD is left unset. This account is explicitly a
    # demo/testing account, not a real admin identity needed for production
    # access the way SuperAdmin is, so it was intentionally left out of
    # scope for this fix per the request that added the SuperAdmin
    # production guard above -- but the same risk applies here, and setting
    # SEED_SUBADMIN_PASSWORD to a private value (or disabling this seed) is
    # recommended before any production deployment.
    SEED_SUBADMIN_EMAIL: str = os.getenv("SEED_SUBADMIN_EMAIL", "subadmin@gmail.com")
    SEED_SUBADMIN_PASSWORD: str = os.getenv("SEED_SUBADMIN_PASSWORD", "Subadmin@12")
    SEED_SUBADMIN_MOBILE: str = os.getenv("SEED_SUBADMIN_MOBILE", "9876543212")
    SEED_SUBADMIN_NAME: str = os.getenv("SEED_SUBADMIN_NAME", "Sub Admin")

    # Demo Employee seed account (used only by seed_demo_employee.py). Created
    # via the real application -> SuperAdmin-approval flow so it is gated
    # exactly like any other employee account.
    #
    # NOTE (production risk, left unchanged here -- see FIXES_APPLIED.md):
    # seed_demo_employee.py has no ENVIRONMENT/DEMO_MODE guard at all, and
    # Employee email/password login is not gated by DEMO_MODE either, so
    # the same class of risk described above for SEED_SUBADMIN_PASSWORD
    # applies to SEED_EMPLOYEE_PASSWORD if left unset in production.
    SEED_EMPLOYEE_EMAIL: str = os.getenv("SEED_EMPLOYEE_EMAIL", "employee.demo@strivenest.com")
    SEED_EMPLOYEE_PASSWORD: str = os.getenv("SEED_EMPLOYEE_PASSWORD", "Employee@123")
    SEED_EMPLOYEE_MOBILE: str = os.getenv("SEED_EMPLOYEE_MOBILE", "9876543211")
    SEED_EMPLOYEE_NAME: str = os.getenv("SEED_EMPLOYEE_NAME", "Demo Employee")


settings = Settings()
