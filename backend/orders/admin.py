# =============================================================
#  orders/admin.py
# =============================================================

from django.contrib import admin

from .models import Cart, CartItem, ContactMessage, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ["line_total"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["user", "total_items", "total_price", "updated_at"]
    search_fields = ["user__phone"]
    inlines = [CartItemInline]
    readonly_fields = ["created_at", "updated_at"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["line_total"]
    fields = ["product", "product_name", "unit_price", "quantity", "line_total"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "contact_method",
        "contact_id",
        "status",
        "total_price",
        "created_at",
    ]
    list_filter = ["status", "contact_method"]
    search_fields = ["user__phone", "contact_id"]
    readonly_fields = ["created_at", "updated_at", "total_price"]
    inlines = [OrderItemInline]
    fieldsets = (
        (None, {"fields": ("user", "status", "total_price")}),
        ("تماس", {"fields": ("contact_method", "contact_id")}),
        ("آدرس", {"fields": ("delivery_address",)}),
        ("یادداشت‌ها", {"fields": ("notes", "admin_notes")}),
        ("تاریخ‌ها", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["full_name", "phone", "is_read", "created_at"]
    list_filter = ["is_read"]
    search_fields = ["full_name", "phone"]
    readonly_fields = ["created_at"]