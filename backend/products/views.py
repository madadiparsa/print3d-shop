# =============================================================
#  products/views.py
# =============================================================

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ProductFilter
from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductWriteSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/products/categories/         — list all active root categories
    GET /api/products/categories/<id>/    — single category detail
    GET /api/products/categories/tree/    — full nested tree (root + children)
    """

    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        """Return only active root-level categories by default."""
        return (
            Category.objects.filter(is_active=True, parent=None)
            .prefetch_related("children")
            .order_by("order", "name")
        )

    @action(detail=False, methods=["get"], url_path="tree")
    def tree(self, request):
        """
        Returns the full category tree:
        each root category with its children nested inside.
        Used by the storefront sidebar.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    """
    Public read endpoints (no auth required):
      GET  /api/products/                  — paginated product list
      GET  /api/products/<slug>/           — product detail

    Admin-only write endpoints (is_staff required):
      POST   /api/products/                — create product
      PUT    /api/products/<slug>/         — full update
      PATCH  /api/products/<slug>/         — partial update
      DELETE /api/products/<slug>/         — delete product
    """

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ProductFilter

    # Live search — searches name and description fields
    search_fields = ["name", "description"]

    # Allow frontend to sort results
    ordering_fields = ["price", "created_at", "name", "stock"]
    ordering = ["-created_at"]

    lookup_field = "slug"

    def get_queryset(self):
        """
        Public users see only active products.
        Staff users see all products including inactive ones.
        """
        if self.request.user and self.request.user.is_staff:
            return Product.objects.all().select_related("category")
        return (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )

    def get_serializer_class(self):
        """
        Use different serializers for different actions:
        - list       → ProductListSerializer  (compact, fast)
        - retrieve   → ProductDetailSerializer (full, with images)
        - create/update → ProductWriteSerializer (admin only)
        """
        if self.action == "retrieve":
            return ProductDetailSerializer
        if self.action in ["create", "update", "partial_update"]:
            return ProductWriteSerializer
        return ProductListSerializer

    def get_permissions(self):
        """
        Read actions are public.
        Write actions require staff authentication.
        """
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]