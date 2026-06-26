# =============================================================
#  orders/models.py
# =============================================================

from django.conf import settings
from django.db import models

from products.models import Product


class Cart(models.Model):
    """
    Shopping cart linked to a logged-in user.
    Anonymous cart items are stored in localStorage on the frontend
    and merged into this cart upon login.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        verbose_name="کاربر",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "سبد خرید"
        verbose_name_plural = "سبدهای خرید"

    def __str__(self):
        return f"سبد خرید — {self.user.phone}"

    @property
    def total_price(self):
        """Sum of all line totals in the cart."""
        return sum(item.line_total for item in self.items.all())

    @property
    def total_items(self):
        """Total quantity of all items in the cart."""
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """A single product line inside a cart."""

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="سبد خرید",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items",
        verbose_name="محصول",
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name="تعداد",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "آیتم سبد"
        verbose_name_plural = "آیتم‌های سبد"
        unique_together = ("cart", "product")

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def line_total(self):
        """Price of this line (unit price × quantity)."""
        return self.product.price * self.quantity


class Order(models.Model):
    """
    A submitted order.
    No payment gateway is used — the customer contacts the store
    via Telegram or Instagram to finalize payment and shipping.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار تایید"
        CONFIRMED = "confirmed", "تایید شده"
        IN_PRODUCTION = "in_production", "در حال تولید"
        SHIPPED = "shipped", "ارسال شده"
        DELIVERED = "delivered", "تحویل داده شده"
        CANCELLED = "cancelled", "لغو شده"

    class ContactMethod(models.TextChoices):
        TELEGRAM = "telegram", "تلگرام"
        INSTAGRAM = "instagram", "اینستاگرام"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="orders",
        verbose_name="کاربر",
    )

    # Contact info for manual payment/shipping coordination
    contact_method = models.CharField(
        max_length=20,
        choices=ContactMethod.choices,
        verbose_name="روش تماس",
    )
    contact_id = models.CharField(
        max_length=100,
        verbose_name="شناسه تماس",
        help_text="آیدی تلگرام یا اینستاگرام کاربر",
    )

    # Snapshot of delivery address at time of order
    delivery_address = models.TextField(
        blank=True,
        verbose_name="آدرس تحویل",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="وضعیت سفارش",
    )

    notes = models.TextField(
        blank=True,
        verbose_name="یادداشت مشتری",
    )
    admin_notes = models.TextField(
        blank=True,
        verbose_name="یادداشت ادمین",
    )

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        verbose_name="مبلغ کل (تومان)",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "سفارش"
        verbose_name_plural = "سفارش‌ها"
        ordering = ["-created_at"]

    def __str__(self):
        return f"سفارش #{self.pk} — {self.user}"

    def calculate_total(self):
        """Recalculate and save the order total from its items."""
        self.total_price = sum(item.line_total for item in self.items.all())
        self.save(update_fields=["total_price"])


class OrderItem(models.Model):
    """
    A snapshot of a product at the time the order was placed.
    Stores product name and price so the order stays accurate
    even if the product is later edited or deleted.
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="سفارش",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_items",
        verbose_name="محصول",
    )

    # Snapshot fields
    product_name = models.CharField(
        max_length=200,
        verbose_name="نام محصول",
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        verbose_name="قیمت واحد (تومان)",
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name="تعداد",
    )

    class Meta:
        verbose_name = "آیتم سفارش"
        verbose_name_plural = "آیتم‌های سفارش"

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    @property
    def line_total(self):
        """Price of this line (unit price × quantity)."""
        return self.unit_price * self.quantity


class ContactMessage(models.Model):
    """
    Support messages submitted from the storefront contact form.
    Visible and manageable in the admin panel.
    """

    full_name = models.CharField(
        max_length=150,
        verbose_name="نام کامل",
    )
    phone = models.CharField(
        max_length=15,
        verbose_name="شماره تماس",
    )
    message = models.TextField(
        verbose_name="پیام",
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name="خوانده شده",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "پیام تماس"
        verbose_name_plural = "پیام‌های تماس"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} — {self.phone}"