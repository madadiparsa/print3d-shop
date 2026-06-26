# =============================================================
#  orders/urls.py
# =============================================================

from django.urls import path

from .views import (
    CartClearView,
    CartItemAddView,
    CartItemUpdateView,
    CartView,
    ContactMessageView,
    OrderCreateView,
    OrderDetailView,
    OrderListView,
    OrderStatusUpdateView,
)

urlpatterns = [
    # ----------------------------------------------------------
    # Cart
    # ----------------------------------------------------------

    # GET — retrieve current user's cart
    path(
        "cart/",
        CartView.as_view(),
        name="cart",
    ),

    # POST — add item to cart
    path(
        "cart/items/",
        CartItemAddView.as_view(),
        name="cart-item-add",
    ),

    # PATCH / DELETE — update or remove a single cart item
    path(
        "cart/items/<int:pk>/",
        CartItemUpdateView.as_view(),
        name="cart-item-update",
    ),

    # DELETE — clear all items from cart
    path(
        "cart/clear/",
        CartClearView.as_view(),
        name="cart-clear",
    ),

    # ----------------------------------------------------------
    # Orders
    # ----------------------------------------------------------

    # GET — list current user's orders (staff sees all)
    path(
        "",
        OrderListView.as_view(),
        name="order-list",
    ),

    # POST — submit new order from cart
    path(
        "create/",
        OrderCreateView.as_view(),
        name="order-create",
    ),

    # GET — single order detail
    path(
        "<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),

    # PATCH — admin updates order status
    path(
        "<int:pk>/status/",
        OrderStatusUpdateView.as_view(),
        name="order-status-update",
    ),

    # ----------------------------------------------------------
    # Contact
    # ----------------------------------------------------------

    # POST — submit contact/support message
    path(
        "contact/",
        ContactMessageView.as_view(),
        name="contact-message",
    ),
]