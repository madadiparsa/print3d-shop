# =============================================================
#  accounts/serializers.py
# =============================================================

from django.conf import settings
from rest_framework import serializers

from .models import Address, OTPCode, User


class OTPRequestSerializer(serializers.Serializer):
    """
    Step 1 of login — user submits their phone number.
    An OTP code is generated and sent (or printed to console in demo mode).
    """

    phone = serializers.CharField(max_length=15)

    def validate_phone(self, value):
        """
        Basic Iranian phone number validation.
        Accepts formats: 09123456789 or +989123456789
        """
        value = value.strip()
        if value.startswith("+98"):
            value = "0" + value[3:]
        if not value.startswith("09") or not value.isdigit() or len(value) != 11:
            raise serializers.ValidationError(
                "شماره تلفن معتبر نیست. فرمت صحیح: 09123456789"
            )
        return value


class OTPVerifySerializer(serializers.Serializer):
    """
    Step 2 of login — user submits phone + OTP code.
    Returns JWT access and refresh tokens on success.
    """

    phone = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6, min_length=6)

    def validate_phone(self, value):
        value = value.strip()
        if value.startswith("+98"):
            value = "0" + value[3:]
        if not value.startswith("09") or not value.isdigit() or len(value) != 11:
            raise serializers.ValidationError(
                "شماره تلفن معتبر نیست. فرمت صحیح: 09123456789"
            )
        return value

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("کد تایید باید عددی باشد.")
        return value


class UserSerializer(serializers.ModelSerializer):
    """
    Public profile serializer.
    Used for GET /api/auth/me/ endpoint.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "full_name",
            "is_staff",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "phone",
            "is_staff",
            "date_joined",
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Used for PATCH /api/auth/me/ — update profile info.
    Only full_name is editable. Phone cannot be changed.
    """

    class Meta:
        model = User
        fields = ["full_name"]


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for user delivery addresses.
    Used for GET/POST/PATCH/DELETE /api/auth/addresses/
    """

    class Meta:
        model = Address
        fields = [
            "id",
            "title",
            "province",
            "city",
            "address_line",
            "postal_code",
            "is_default",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_postal_code(self, value):
        """Iranian postal codes are exactly 10 digits."""
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError(
                "کد پستی باید ۱۰ رقم باشد."
            )
        return value