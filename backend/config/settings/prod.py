# =============================================================
#  print3d-shop — production settings
#  All secrets must come from environment variables.
#  See .env.example (created in Phase 14) for required keys.
# =============================================================

import os

from .base import *  # noqa: F401, F403

# -------------------------------------------------------------
# Security
# -------------------------------------------------------------

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

DEBUG = False

ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",")

# -------------------------------------------------------------
# Database — PostgreSQL
# -------------------------------------------------------------

import dj_database_url

DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL",
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# -------------------------------------------------------------
# CORS
# -------------------------------------------------------------

CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",")
CORS_ALLOW_CREDENTIALS = True

# -------------------------------------------------------------
# Security headers
# -------------------------------------------------------------

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "True") == "True"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# -------------------------------------------------------------
# OTP — production SMS gateway (plug in Phase 14)
# -------------------------------------------------------------

OTP_MOCK_MODE = False
OTP_EXPIRY_MINUTES = 5
OTP_CODE_LENGTH = 6
SMS_PROVIDER = os.environ.get("SMS_PROVIDER", "kavenegar")
SMS_API_KEY = os.environ.get("SMS_API_KEY", "")

# -------------------------------------------------------------
# Static & media
# -------------------------------------------------------------

STATIC_ROOT = BASE_DIR / "staticfiles"

# ArvanCloud / S3-compatible object storage (configured in Phase 14)
# DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"