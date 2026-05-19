from django.urls import path
from . import views

urlpatterns = [
    path('esewa/initiate/',  views.initiate_esewa,  name='esewa-initiate'),
    path('esewa/verify/',    views.verify_esewa,     name='esewa-verify'),
    path('khalti/initiate/', views.initiate_khalti,  name='khalti-initiate'),
    path('khalti/verify/',   views.verify_khalti,    name='khalti-verify'),
    path('cod/',             views.place_cod_order,  name='cod-order'),
    path("my-purchases/", views.my_purchases, name="my-purchases"),
    path("admin/orders/", views.admin_all_orders, name="admin-orders"),
    path("admin/orders/<int:order_id>/update-status/", views.admin_update_order_status, name="admin-order-update-status"),
]