from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Category, Medium, Artwork
from .serializers import (
    CategorySerializer, MediumSerializer,
    ArtworkListSerializer, ArtworkDetailSerializer,
)


def is_admin(user):
    return user.is_authenticated and user.role == "admin"


# ── Categories ────────────────────────────────────────────────────────────────

class CategoryListCreateView(APIView):
    """
    GET  /api/artworks/categories/       → list all (public)
    POST /api/artworks/categories/       → create new (admin only)
    """
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        categories = Category.objects.all()
        return Response(CategorySerializer(categories, many=True).data)

    def post(self, request):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    """
    GET    /api/artworks/categories/<id>/  → retrieve
    PUT    /api/artworks/categories/<id>/  → update (admin)
    DELETE /api/artworks/categories/<id>/  → delete (admin)
    """
    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, pk):
        cat = get_object_or_404(Category, pk=pk)
        return Response(CategorySerializer(cat).data)

    def put(self, request, pk):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        cat = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(cat, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        cat = get_object_or_404(Category, pk=pk)
        cat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Mediums ───────────────────────────────────────────────────────────────────

class MediumListCreateView(APIView):
    """
    GET  /api/artworks/mediums/   → list all (public)
    POST /api/artworks/mediums/   → create (admin)
    """
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        mediums = Medium.objects.all()
        return Response(MediumSerializer(mediums, many=True).data)

    def post(self, request):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        serializer = MediumSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class MediumDetailView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, pk):
        medium = get_object_or_404(Medium, pk=pk)
        return Response(MediumSerializer(medium).data)

    def put(self, request, pk):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        medium = get_object_or_404(Medium, pk=pk)
        serializer = MediumSerializer(medium, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        medium = get_object_or_404(Medium, pk=pk)
        medium.delete()
        return Response(status=204)


# ── Artworks ──────────────────────────────────────────────────────────────────

class ArtworkListCreateView(APIView):
    """
    GET  /api/artworks/           → list (public, filterable)
    POST /api/artworks/           → create (admin only, supports image upload)

    Query params for GET:
      ?search=<str>     → title, description
      ?category=<id>
      ?medium=<id>
      ?status=<str>     → published | draft | sold_out | archived
      ?min_price=<num>
      ?max_price=<num>
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        qs = Artwork.objects.select_related("category", "medium").all()

        # Customers only see published artworks
        if not (request.user.is_authenticated and request.user.role == "admin"):
            qs = qs.filter(status="published")

        search   = request.query_params.get("search")
        category = request.query_params.get("category")
        medium   = request.query_params.get("medium")
        art_status = request.query_params.get("status")
        min_price  = request.query_params.get("min_price")
        max_price  = request.query_params.get("max_price")

        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        if category:
            qs = qs.filter(category_id=category)
        if medium:
            qs = qs.filter(medium_id=medium)
        if art_status and request.user.is_authenticated and request.user.role == "admin":
            qs = qs.filter(status=art_status)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        orientation = request.query_params.get("orientation")
        if orientation:
            qs = qs.filter(orientation__in=orientation.split(","))

        serializer = ArtworkListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        serializer = ArtworkDetailSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ArtworkDetailView(APIView):
    """
    GET    /api/artworks/<id>/   → retrieve (public if published)
    PUT    /api/artworks/<id>/   → update (admin, supports image upload)
    DELETE /api/artworks/<id>/   → delete (admin)
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, pk):
        artwork = get_object_or_404(Artwork, pk=pk)
        if artwork.status != "published":
            if not (request.user.is_authenticated and request.user.role == "admin"):
                return Response({"detail": "Not found."}, status=404)
        return Response(
            ArtworkDetailSerializer(artwork, context={"request": request}).data
        )

    def put(self, request, pk):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        artwork = get_object_or_404(Artwork, pk=pk)
        serializer = ArtworkDetailSerializer(
            artwork, data=request.data, partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({"detail": "Admin only."}, status=403)
        artwork = get_object_or_404(Artwork, pk=pk)
        artwork.delete()
        return Response(status=204)