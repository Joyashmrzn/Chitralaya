from django.urls import path
from .views import RegisterView, LoginView, LogoutView, MeView
from . import views   

urlpatterns = [
    path("register/",                         RegisterView.as_view(), name="register"),
    path("login/",                            LoginView.as_view(),    name="login"),
    path("logout/",                           LogoutView.as_view(),   name="logout"),
    path("me/",                               MeView.as_view(),       name="me"),

    # ── user-management ────────────────────────────────────────────────
    path("users/",                            views.list_customers,          name="customer-list"),
    path("users/<int:pk>/toggle-active/",     views.toggle_customer_active,  name="customer-toggle"),
    path("users/<int:pk>/",                   views.delete_customer,         name="customer-delete"),

    # ── shipping addresses ─────────────────────────────────────────────
    path("shipping-addresses/",              views.ShippingAddressListCreateView.as_view(), name="shipping-address-list"),
    path("shipping-addresses/<int:pk>/",     views.ShippingAddressDetailView.as_view(),     name="shipping-address-detail"),
    path("shipping-addresses/<int:pk>/set-default/", views.SetDefaultAddressView.as_view(), name="shipping-address-set-default"),
]