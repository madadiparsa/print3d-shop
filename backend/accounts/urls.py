# =============================================================
#  accounts/urls.py
# =============================================================

from django.urls import path

from .views import (
    AddressDetailView,
    AddressListCreateView,
    OTPRequestView,
    OTPVerifyView,
    ProfileView,
    TokenRefreshView,
)

urlpatterns = [
    # ----------------------------------------------------------
    # OTP Authentication
    # ----------------------------------------------------------

    # Step 1 — request OTP code
    path(
        "otp/request/",
        OTPRequestView.as_view(),
        name="otp-request",
    ),

    # Step 2 — verify OTP code and receive JWT tokens
    path(
        "otp/verify/",
        OTPVerifyView.as_view(),
        name="otp-verify",
    ),

    # ----------------------------------------------------------
    # JWT Token
    # ----------------------------------------------------------

    # Refresh access token using refresh token
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    # ----------------------------------------------------------
    # Profile
    # ----------------------------------------------------------

    # GET / PATCH current user profile
    path(
        "me/",
        ProfileView.as_view(),
        name="profile",
    ),

    # ----------------------------------------------------------
    # Addresses
    # ----------------------------------------------------------

    # GET list / POST create
    path(
        "addresses/",
        AddressListCreateView.as_view(),
        name="address-list",
    ),

    # GET / PATCH / DELETE single address
    path(
        "addresses/<int:pk>/",
        AddressDetailView.as_view(),
        name="address-detail",
    ),
]