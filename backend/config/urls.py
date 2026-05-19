from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def debug_storage(request):
    return JsonResponse({
        'storage': settings.DEFAULT_FILE_STORAGE,
        'cloud_name': settings.CLOUDINARY_STORAGE.get('CLOUD_NAME', 'MISSING'),
        'api_key': settings.CLOUDINARY_STORAGE.get('API_KEY', 'MISSING'),
    })

urlpatterns = [
    path("admin/",        admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/artworks/",  include("artworks.urls")),
    path("api/payment/",    include("payment.urls")),
    path("api/purchase/",  include("purchase.urls")),
    path("debug/",        debug_storage),  # ✅ temporary
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)