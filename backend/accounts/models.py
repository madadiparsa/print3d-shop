# =============================================================
#  accounts/models.py
# =============================================================

import random
import string

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager for phone-based authentication."""

    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("شماره تلفن الزامی است.")
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model.
    Phone number is the unique identifier instead of username/email.
    """

    phone = models.CharField(
        max_length=15,
        unique=True,
        verbose_name="شماره تلفن",
    )
    full_name = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="نام کامل",
    )
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    is_staff = models.BooleanField(default=False, verbose_name="کارمند")
    date_joined = models.DateTimeField(
        default=timezone.now,
        verbose_name="تاریخ عضویت",
    )

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.phone

    def get_full_name(self):
        return self.full_name or self.phone


class Address(models.Model):
    """Saved delivery addresses for a user."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses",
        verbose_name="کاربر",
    )
    title = models.CharField(
        max_length=100,
        verbose_name="عنوان آدرس",
    )
    province = models.CharField(
        max_length=100,
        verbose_name="استان",
    )
    city = models.CharField(
        max_length=100,
        verbose_name="شهر",
    )
    address_line = models.TextField(
        verbose_name="آدرس کامل",
    )
    postal_code = models.CharField(
        max_length=10,
        verbose_name="کد پستی",
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name="آدرس پیش‌فرض",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "آدرس"
        verbose_name_plural = "آدرس‌ها"
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.user.phone} — {self.title}"

    def save(self, *args, **kwargs):
        # If this address is set as default, unset all others for this user
        if self.is_default:
            Address.objects.filter(
                user=self.user,
                is_default=True,
            ).update(is_default=False)
        super().save(*args, **kwargs)


class OTPCode(models.Model):
    """
    One-time password codes for phone authentication.
    In demo/dev mode the code is printed to the console.
    No SMS is sent until a real gateway is connected in production.
    """

    phone = models.CharField(
        max_length=15,
        verbose_name="شماره تلفن",
    )
    code = models.CharField(
        max_length=6,
        verbose_name="کد تایید",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(
        default=False,
        verbose_name="استفاده شده",
    )

    class Meta:
        verbose_name = "کد تایید"
        verbose_name_plural = "کدهای تایید"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.phone} — {self.code}"

    @staticmethod
    def generate_code(length=6):
        """Generate a random numeric OTP code."""
        return "".join(random.choices(string.digits, k=length))

    def is_expired(self, expiry_minutes=10):
        """Return True if the OTP is older than expiry_minutes."""
        delta = timezone.now() - self.created_at
        return delta.total_seconds() > expiry_minutes * 60