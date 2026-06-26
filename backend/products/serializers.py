# =============================================================
#  products/serializers.py
# =============================================================

from rest_framework import serializers

from .models import Category, Product, ProductImage


class CategoryChildSerializer(serializers.ModelSerializer):
    """Lightweight serializer for child categories (used inside CategorySerializer)."""

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon"]


class CategorySerializer(serializers.ModelSerializer):
    """
    Full category serializer.
    Includes children so the sidebar can render a nested tree.
    """

    children = CategoryChildSerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "parent",
            "icon",
            "is_active",
            "order",
            "children",
            "product_count",
        ]

    def get_product_count(self, obj):
        """Return the number of active products in this category."""
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for gallery images."""

    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "order"]


class ProductListSerializer(serializers.ModelSerializer):
    """
    Compact serializer used in catalog listing pages.
    Returns only the fields needed for a product card.
    """

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "category_name",
            "product_type",
            "price",
            "stock",
            "in_stock",
            "is_active",
            "thumbnail",
            "created_at",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer used on the product detail page.
    Includes gallery images and full category info.
    """

    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "product_type",
            "description",
            "price",
            "stock",
            "in_stock",
            "is_active",
            "thumbnail",
            "images",
            "created_at",
            "updated_at",
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating products.
    Used by admin endpoints only.
    """

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "product_type",
            "description",
            "price",
            "stock",
            "is_active",
            "thumbnail",
        ]
        extra_kwargs = {
            "slug": {"required": False},
        }