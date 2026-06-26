# =============================================================
#  products/admin.py
# =============================================================

from django.contrib import admin

from .models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "parent", "is_active", "order"]
    list_filter = ["is_active", "parent"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["order", "name"]


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["image", "alt_text", "order"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "product_type",
        "price",
        "stock",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "product_type", "category"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        (None, {"fields": ("name", "slug", "category", "product_type")}),
        ("محتوا", {"fields": ("description", "thumbnail")}),
        ("قیمت و موجودی", {"fields": ("price", "stock", "is_active")}),
        ("تاریخ‌ها", {"fields": ("created_at", "updated_at")}),
    )