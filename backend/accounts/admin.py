# =============================================================
#  accounts/admin.py
# =============================================================

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Address, OTPCode, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-date_joined"]
    list_display = ["phone", "full_name", "is_active", "is_staff", "date_joined"]
    list_filter = ["is_active", "is_staff"]
    search_fields = ["phone", "full_name"]

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("اطلاعات شخصی", {"fields": ("full_name",)}),
        (
            "دسترسی‌ها",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("تاریخ‌ها", {"fields": ("date_joined", "last_login")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "phone",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    readonly_fields = ["date_joined", "last_login"]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["user", "title", "city", "province", "is_default"]
    list_filter = ["province", "is_default"]
    search_fields = ["user__phone", "city", "postal_code"]


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ["phone", "code", "created_at", "is_used"]
    list_filter = ["is_used"]
    search_fields = ["phone"]
    readonly_fields = ["created_at"]