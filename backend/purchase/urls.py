from django.urls import path
from . import views

urlpatterns = [
    path("cart/",              views.list_cart,        name="cart-list"),
    path("cart/add/",          views.add_to_cart,      name="cart-add"),
    path("cart/<int:item_id>/update/", views.update_cart_item, name="cart-update"),
    path("cart/<int:item_id>/remove/", views.remove_cart_item, name="cart-remove"),
]