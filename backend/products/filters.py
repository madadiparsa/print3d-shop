# =============================================================
#  products/filters.py
# =============================================================

import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):
    """
    Filter set for the product listing endpoint.
    Supports filtering by category, price range, stock, and product type.
    All filters are optional and can be combined.

    Usage examples:
      /api/products/?category=1
      /api/products/?min_price=50000&max_price=200000
      /api/products/?in_stock=true
      /api/products/?product_type=custom
      /api/products/?category=2&min_price=10000&in_stock=true
    """

    # Filter by category ID
    category = django_filters.NumberFilter(
        field_name="category__id",
        lookup_expr="exact",
        label="دسته‌بندی",
    )

    # Filter by category slug (useful for frontend URL-based filtering)
    category_slug = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="exact",
        label="اسلاگ دسته‌بندی",
    )

    # Price range filters
    min_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="gte",
        label="حداقل قیمت",
    )
    max_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="lte",
        label="حداکثر قیمت",
    )

    # Stock filter — pass true to show only available products
    in_stock = django_filters.BooleanFilter(
        method="filter_in_stock",
        label="موجود در انبار",
    )

    # Product type filter (ready / custom)
    product_type = django_filters.CharFilter(
        field_name="product_type",
        lookup_expr="exact",
        label="نوع محصول",
    )

    class Meta:
        model = Product
        fields = [
            "category",
            "category_slug",
            "min_price",
            "max_price",
            "in_stock",
            "product_type",
        ]

    def filter_in_stock(self, queryset, name, value):
        """
        If value is True, return only products with stock > 0.
        If value is False, return only out-of-stock products.
        """
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)
    