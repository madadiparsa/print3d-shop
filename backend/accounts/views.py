# =============================================================
#  accounts/views.py
# =============================================================

import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address
from .serializers import (
    AddressSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from .services import get_or_create_user, send_otp, verify_otp

logger = logging.getLogger(__name__)


# =============================================================
#  OTP Request
# =============================================================

class OTPRequestView(APIView):
    """
    POST /api/auth/otp/request/

    Step 1 of login — submit phone number to receive OTP.

    Request body:
      { "phone": "09123456789" }

    Response (200):
      { "detail": "کد تایید ارسال شد." }

    In demo mode the code is printed to the server console.
    No SMS is sent until a real gateway is configured.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]

        try:
            send_otp(phone)
        except Exception as e:
            logger.error("OTP send failed | phone=%s | error=%s", phone, e)
            return Response(
                {"detail": "ارسال کد تایید با خطا مواجه شد. لطفاً دوباره تلاش کنید."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "کد تایید ارسال شد."},
            status=status.HTTP_200_OK,
        )


# =============================================================
#  OTP Verify
# =============================================================

class OTPVerifyView(APIView):
    """
    POST /api/auth/otp/verify/

    Step 2 of login — submit phone + OTP code to receive JWT tokens.
    Creates a new user automatically if phone is not registered yet.

    Request body:
      { "phone": "09123456789", "code": "483920" }

    Response (200):
      {
        "access":  "<jwt access token>",
        "refresh": "<jwt refresh token>",
        "user": { "id": 1, "phone": "09123456789", ... },
        "created": false
      }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        code = serializer.validated_data["code"]

        # Verify the OTP code
        success, message = verify_otp(phone, code)
        if not success:
            return Response(
                {"detail": message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get or create the user
        user, created = get_or_create_user(phone)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
                "created": created,
            },
            status=status.HTTP_200_OK,
        )


# =============================================================
#  Token Refresh
# =============================================================

class TokenRefreshView(APIView):
    """
    POST /api/auth/token/refresh/

    Submit a valid refresh token to receive a new access token.

    Request body:
      { "refresh": "<refresh token>" }

    Response (200):
      { "access": "<new access token>" }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "توکن رفرش الزامی است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(refresh_token)
            return Response(
                {"access": str(refresh.access_token)},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"detail": "توکن رفرش نامعتبر یا منقضی شده است."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


# =============================================================
#  Profile
# =============================================================

class ProfileView(APIView):
    """
    GET   /api/auth/me/   — retrieve current user profile
    PATCH /api/auth/me/   — update full_name
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


# =============================================================
#  Addresses
# =============================================================

class AddressListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/auth/addresses/   — list all addresses for current user
    POST /api/auth/addresses/   — create a new address
    """

    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/auth/addresses/<id>/   — retrieve single address
    PATCH  /api/auth/addresses/<id>/   — update address
    DELETE /api/auth/addresses/<id>/   — delete address
    """

    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only access their own addresses
        return Address.objects.filter(user=self.request.user)