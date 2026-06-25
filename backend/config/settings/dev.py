# =============================================================
#  print3d-shop — development settings
# =============================================================

from .base import *  # noqa: F401, F403

# -------------------------------------------------------------
# Security
# -------------------------------------------------------------

SECRET_KEY = "django-insecure-dev-secret-key-change-in-production-!@#$%^&*()"

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# -------------------------------------------------------------
# Database — SQLite for development
# -------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# -------------------------------------------------------------
# CORS — allow both React dev servers
# -------------------------------------------------------------

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",   # storefront
    "http://localhost:5174",   # admin-panel
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

CORS_ALLOW_CREDENTIALS = True

# -------------------------------------------------------------
# Email — print to console in dev
# -------------------------------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# -------------------------------------------------------------
# OTP — mock mode (code printed to console, no SMS sent)
# -------------------------------------------------------------

OTP_MOCK_MODE = True
OTP_EXPIRY_MINUTES = 10
OTP_CODE_LENGTH = 6