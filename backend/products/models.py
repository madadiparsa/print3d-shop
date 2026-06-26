# =============================================================
#  products/models.py
# =============================================================

from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """
    Product category.
    Supports one level of nesting via the parent field (parent/child).
    """

    name = models.CharField(
        max_length=100,
        verbose_name="نام دسته‌بندی",
    )
    slug = models.SlugField(
        max_length=120,
        unique=True,
        allow_unicode=True,
    )
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="children",
        verbose_name="دسته‌بندی والد",
    )
    icon = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="آیکون",
        help_text="نام کلاس آیکون یا SVG slug",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="فعال",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="ترتیب نمایش",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"
        ordering = ["order", "name"]

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} ← {self.name}"
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Product(models.Model):
    """
    A product listed in the store.
    Can be either a ready-made item or a custom 3D print order.
    """

    class ProductType(models.TextChoices):
        READY_MADE = "ready", "آماده"
        CUSTOM = "custom", "سفارشی"

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
        verbose_name="دسته‌بندی",
    )
    name = models.CharField(
        max_length=200,
        verbose_name="نام محصول",
    )
    slug = models.SlugField(
        max_length=220,
        unique=True,
        allow_unicode=True,
    )
    description = models.TextField(
        blank=True,
        verbose_name="توضیحات",
    )
    product_type = models.CharField(
        max_length=10,
        choices=ProductType.choices,
        default=ProductType.READY_MADE,
        verbose_name="نوع محصول",
    )
    price = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        verbose_name="قیمت (تومان)",
    )
    stock = models.PositiveIntegerField(
        default=0,
        verbose_name="موجودی",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="فعال",
    )
    thumbnail = models.ImageField(
        upload_to="products/thumbnails/",
        null=True,
        blank=True,
        verbose_name="تصویر اصلی",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    @property
    def in_stock(self):
        """Returns True if product has available stock."""
        return self.stock > 0


class ProductImage(models.Model):
    """
    Additional gallery images for a product.
    The main image is stored on the Product model as thumbnail.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="محصول",
    )
    image = models.ImageField(
        upload_to="products/gallery/",
        verbose_name="تصویر",
    )
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="متن جایگزین",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="ترتیب نمایش",
    )

    class Meta:
        verbose_name = "تصویر محصول"
        verbose_name_plural = "تصاویر محصول"
        ordering = ["order"]

    def __str__(self):
        return f"{self.product.name} — تصویر {self.order}"