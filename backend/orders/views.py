# =============================================================
#  orders/views.py
# =============================================================

import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, ContactMessage, Order, OrderItem
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    ContactMessageSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)

logger = logging.getLogger(__name__)


# =============================================================
#  Cart Views
# =============================================================

class CartView(APIView):
    """
    GET /api/orders/cart/
    Returns the current user's cart with all items.
    Creates an empty cart automatically if one doesn't exist yet.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemAddView(APIView):
    """
    POST /api/orders/cart/items/

    Add a product to the cart.
    If the product is already in the cart, increase its quantity.

    Request body:
      { "product_id": 1, "quantity": 2 }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        # Check stock availability
        if product.stock < quantity:
            return Response(
                {
                    "detail": f"موجودی کافی نیست. حداکثر {product.stock} عدد موجود است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)

        # If product already in cart — increase quantity
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            new_quantity = cart_item.quantity + quantity
            if new_quantity > product.stock:
                return Response(
                    {
                        "detail": (
                            f"موجودی کافی نیست. "
                            f"در حال حاضر {cart_item.quantity} عدد در سبد دارید "
                            f"و موجودی انبار {product.stock} عدد است."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = new_quantity
            cart_item.save(update_fields=["quantity"])

        # Return the updated full cart
        cart_serializer = CartSerializer(cart)
        return Response(
            cart_serializer.data,
            status=status.HTTP_200_OK,
        )


class CartItemUpdateView(APIView):
    """
    PATCH  /api/orders/cart/items/<id>/   — update quantity
    DELETE /api/orders/cart/items/<id>/   — remove item from cart
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_cart_item(self, request, pk):
        """Return cart item only if it belongs to the current user's cart."""
        try:
            return CartItem.objects.get(
                pk=pk,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return None

    def patch(self, request, pk):
        cart_item = self.get_cart_item(request, pk)
        if not cart_item:
            return Response(
                {"detail": "آیتم سبد یافت نشد."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quantity = request.data.get("quantity")
        if not quantity:
            return Response(
                {"detail": "تعداد الزامی است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return Response(
                {"detail": "تعداد باید عدد صحیح باشد."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"detail": "تعداد باید حداقل ۱ باشد."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > cart_item.product.stock:
            return Response(
                {
                    "detail": (
                        f"موجودی کافی نیست. "
                        f"حداکثر {cart_item.product.stock} عدد موجود است."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item.quantity = quantity
        cart_item.save(update_fields=["quantity"])

        # Return the updated full cart
        cart_serializer = CartSerializer(cart_item.cart)
        return Response(cart_serializer.data)

    def delete(self, request, pk):
        cart_item = self.get_cart_item(request, pk)
        if not cart_item:
            return Response(
                {"detail": "آیتم سبد یافت نشد."},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart = cart_item.cart
        cart_item.delete()

        # Return the updated full cart
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)


class CartClearView(APIView):
    """
    DELETE /api/orders/cart/clear/
    Removes all items from the current user's cart.
    """

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)


# =============================================================
#  Order Views
# =============================================================

class OrderListView(generics.ListAPIView):
    """
    GET /api/orders/
    Returns a list of all orders for the current user.
    Staff users see all orders.
    """

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related("items")
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related("items")


class OrderCreateView(APIView):
    """
    POST /api/orders/create/

    Submit a new order from the current cart.

    - Cart must not be empty
    - Creates OrderItems as snapshots of current product prices
    - Clears the cart after successful order creation
    - Customer provides Telegram or Instagram ID for manual coordination

    Request body:
      {
        "contact_method": "telegram",
        "contact_id": "@myusername",
        "delivery_address": "تهران، خیابان ولیعصر...",
        "notes": "لطفاً زودتر ارسال شود"
      }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the user's cart
        try:
            cart = Cart.objects.prefetch_related(
                "items__product"
            ).get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {"detail": "سبد خرید یافت نشد."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Cart must not be empty
        if not cart.items.exists():
            return Response(
                {"detail": "سبد خرید خالی است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify all items are still in stock
        for item in cart.items.all():
            if item.product.stock < item.quantity:
                return Response(
                    {
                        "detail": (
                            f"موجودی محصول «{item.product.name}» "
                            f"کافی نیست. "
                            f"موجودی فعلی: {item.product.stock} عدد."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Create the order
        order = Order.objects.create(
            user=request.user,
            contact_method=serializer.validated_data["contact_method"],
            contact_id=serializer.validated_data["contact_id"],
            delivery_address=serializer.validated_data.get("delivery_address", ""),
            notes=serializer.validated_data.get("notes", ""),
        )

        # Create order item snapshots
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                unit_price=item.product.price,
                quantity=item.quantity,
            )

        # Calculate and save the total
        order.calculate_total()

        # Clear the cart
        cart.items.all().delete()

        logger.info(
            "Order created | order_id=%s | user=%s | total=%s",
            order.pk,
            request.user.phone,
            order.total_price,
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/orders/<id>/
    Returns full detail of a single order.
    Users can only view their own orders.
    Staff can view any order.
    """

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all().prefetch_related("items")
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related("items")


class OrderStatusUpdateView(APIView):
    """
    PATCH /api/orders/<id>/status/
    Admin-only — update order status and admin notes.

    Request body:
      { "status": "confirmed", "admin_notes": "پرداخت تایید شد" }
    """

    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {"detail": "سفارش یافت نشد."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderStatusUpdateSerializer(
            order,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(OrderSerializer(order).data)


# =============================================================
#  Contact Message View
# =============================================================

class ContactMessageView(APIView):
    """
    POST /api/orders/contact/
    Submit a support message from the storefront contact form.
    No authentication required.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "پیام شما با موفقیت ارسال شد. به زودی با شما تماس می‌گیریم."},
            status=status.HTTP_201_CREATED,
        )