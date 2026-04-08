from rest_framework import serializers
from .models import Category, Medium, Artwork


class CategorySerializer(serializers.ModelSerializer):
    artwork_count = serializers.IntegerField(
        source="artworks.count", read_only=True
    )

    class Meta:
        model  = Category
        fields = ["id", "name", "slug", "description", "artwork_count", "created_at"]
        read_only_fields = ["slug", "created_at"]

    def create(self, validated_data):
        from django.utils.text import slugify
        validated_data["slug"] = slugify(validated_data["name"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils.text import slugify
        if "name" in validated_data:
            validated_data["slug"] = slugify(validated_data["name"])
        return super().update(instance, validated_data)


class MediumSerializer(serializers.ModelSerializer):
    artwork_count = serializers.IntegerField(
        source="artworks.count", read_only=True
    )

    class Meta:
        model  = Medium
        fields = ["id", "name", "slug", "description", "artwork_count", "created_at"]
        read_only_fields = ["slug", "created_at"]

    def create(self, validated_data):
        from django.utils.text import slugify
        validated_data["slug"] = slugify(validated_data["name"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils.text import slugify
        if "name" in validated_data:
            validated_data["slug"] = slugify(validated_data["name"])
        return super().update(instance, validated_data)


class ArtworkListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    medium_name   = serializers.CharField(source="medium.name",   read_only=True)
    image_url     = serializers.SerializerMethodField()

    class Meta:
        model  = Artwork
        fields = [
            "id", "title", "slug", "category", "category_name",
            "medium", "medium_name", "price", "stock", "status",
            "image_url", "year_created", "created_at",
            "width", "height", "unit", "orientation", 
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ArtworkDetailSerializer(serializers.ModelSerializer):
    """Full serializer for create / retrieve / update."""
    category_name      = serializers.CharField(source="category.name",  read_only=True)
    medium_name        = serializers.CharField(source="medium.name",     read_only=True)
    dimensions_display = serializers.CharField(read_only=True)
    image_url          = serializers.SerializerMethodField()

    class Meta:
        model  = Artwork
        fields = [
            "id", "title", "slug", "description",
            "category", "category_name", "medium", "medium_name",
            "width", "height", "unit", "dimensions_display",
            "year_created", "price", "stock", "status",
            "image", "image_url", "created_at", "updated_at","orientation",
        ]
        read_only_fields = ["slug", "created_at", "updated_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None