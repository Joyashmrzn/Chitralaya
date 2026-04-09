from django.urls import path
from . import views

urlpatterns = [
    path('esewa/initiate/',  views.initiate_esewa,  name='esewa-initiate'),
    path('esewa/verify/',    views.verify_esewa,     name='esewa-verify'),
    path('khalti/initiate/', views.initiate_khalti,  name='khalti-initiate'),
    path('khalti/verify/',   views.verify_khalti,    name='khalti-verify'),
    path('cod/',             views.place_cod_order,  name='cod-order'),
]