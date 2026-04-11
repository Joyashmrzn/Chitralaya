from django.urls import path
from .views import RegisterView, LoginView, LogoutView, MeView
from . import views   

urlpatterns = [
    path("register/",                         RegisterView.as_view(), name="register"),
    path("login/",                            LoginView.as_view(),    name="login"),
    path("logout/",                           LogoutView.as_view(),   name="logout"),
    path("me/",                               MeView.as_view(),       name="me"),

    # ── new user-management endpoints ──────────────────────────────────
    path("users/",                            views.list_customers,          name="customer-list"),
    path("users/<int:pk>/toggle-active/",     views.toggle_customer_active,  name="customer-toggle"),
    path("users/<int:pk>/",                   views.delete_customer,         name="customer-delete"),
]