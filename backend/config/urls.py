# =============================================================
#  config/urls.py — root URL configuration
# =============================================================

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # API routes — each app registers its own urls in Phase 2–4
    path("api/auth/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
    path("api/orders/", include("orders.urls")),
]

# Serve media files in development only
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)