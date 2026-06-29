# =============================================================
#  orders/urls.py
# =============================================================

from django.urls import path

from .views import (
    CartClearView,
    CartItemAddView,
    CartItemUpdateView,
    CartView,
    ContactMessageMarkReadView,
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
    path("cart/",              CartView.as_view(),          name="cart"),
    path("cart/items/",        CartItemAddView.as_view(),   name="cart-item-add"),
    path("cart/items/<int:pk>/", CartItemUpdateView.as_view(), name="cart-item-update"),
    path("cart/clear/",        CartClearView.as_view(),     name="cart-clear"),

    # ----------------------------------------------------------
    # Orders
    # ----------------------------------------------------------
    path("",                   OrderListView.as_view(),     name="order-list"),
    path("create/",            OrderCreateView.as_view(),   name="order-create"),
    path("<int:pk>/",          OrderDetailView.as_view(),   name="order-detail"),
    path("<int:pk>/status/",   OrderStatusUpdateView.as_view(), name="order-status-update"),

    # ----------------------------------------------------------
    # Contact messages
    # ----------------------------------------------------------
    # GET (admin list) + POST (public submit)
    path("contact/",           ContactMessageView.as_view(),       name="contact-message"),
    # PATCH — toggle read/unread
    path("contact/<int:pk>/read/", ContactMessageMarkReadView.as_view(), name="contact-mark-read"),
]