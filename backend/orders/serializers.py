# =============================================================
#  orders/serializers.py
# =============================================================

from rest_framework import serializers

from products.models import Product
from products.serializers import ProductListSerializer

from .models import Cart, CartItem, ContactMessage, Order, OrderItem


# =============================================================
#  Cart Serializers
# =============================================================

class CartItemProductSerializer(serializers.ModelSerializer):
    """
    Compact product info embedded inside a cart item.
    Only returns what the cart UI needs.
    """

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "price",
            "stock",
            "thumbnail",
        ]


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for a single cart item.
    Includes full product info and calculated line total.
    """

    product = CartItemProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source="product",
        write_only=True,
    )
    line_total = serializers.DecimalField(
        max_digits=12,
        decimal_places=0,
        read_only=True,
    )

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_id",
            "quantity",
            "line_total",
            "added_at",
        ]
        read_only_fields = ["id", "line_total", "added_at"]

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("تعداد باید حداقل ۱ باشد.")
        if value > 100:
            raise serializers.ValidationError("تعداد نمی‌تواند بیشتر از ۱۰۰ باشد.")
        return value


class CartSerializer(serializers.ModelSerializer):
    """
    Full cart serializer — includes all items, total price and item count.
    Used for GET /api/orders/cart/
    """

    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=0,
        read_only=True,
    )
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_price",
            "total_items",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


# =============================================================
#  Order Serializers
# =============================================================

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for a single order item snapshot.
    All fields are read-only — order items are never edited.
    """

    line_total = serializers.DecimalField(
        max_digits=12,
        decimal_places=0,
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "unit_price",
            "quantity",
            "line_total",
        ]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    """
    Full order serializer — used for order detail and list.
    """

    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )
    contact_method_display = serializers.CharField(
        source="get_contact_method_display",
        read_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "contact_method",
            "contact_method_display",
            "contact_id",
            "delivery_address",
            "status",
            "status_display",
            "notes",
            "total_price",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "status_display",
            "total_price",
            "items",
            "created_at",
            "updated_at",
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for submitting a new order from the cart.
    Customer provides contact method and ID for manual coordination.
    """

    class Meta:
        model = Order
        fields = [
            "contact_method",
            "contact_id",
            "delivery_address",
            "notes",
        ]

    def validate_contact_id(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "شناسه تماس نمی‌تواند خالی باشد."
            )
        if len(value) < 3:
            raise serializers.ValidationError(
                "شناسه تماس باید حداقل ۳ کاراکتر باشد."
            )
        return value


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Admin-only serializer for updating order status and admin notes.
    Used for PATCH /api/orders/<id>/status/
    """

    class Meta:
        model = Order
        fields = ["status", "admin_notes"]


# =============================================================
#  Contact Message Serializer
# =============================================================

class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for storefront contact form submissions.
    POST /api/orders/contact/
    """

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "full_name",
            "phone",
            "message",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_phone(self, value):
        value = value.strip()
        if value.startswith("+98"):
            value = "0" + value[3:]
        if not value.startswith("09") or not value.isdigit() or len(value) != 11:
            raise serializers.ValidationError(
                "شماره تلفن معتبر نیست. فرمت صحیح: 09123456789"
            )
        return value