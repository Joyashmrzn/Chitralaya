from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    MediumListCreateView, MediumDetailView,
    ArtworkListCreateView, ArtworkDetailView,
)

urlpatterns = [
    # Categories
    path("categories/",      CategoryListCreateView.as_view(), name="category-list"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(),    name="category-detail"),

    # Mediums
    path("mediums/",         MediumListCreateView.as_view(),   name="medium-list"),
    path("mediums/<int:pk>/",    MediumDetailView.as_view(),       name="medium-detail"),

    # Artworks
    path("",                 ArtworkListCreateView.as_view(),  name="artwork-list"),
    path("<int:pk>/",        ArtworkDetailView.as_view(),      name="artwork-detail"),
]