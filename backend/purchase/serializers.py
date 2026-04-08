from rest_framework import serializers
from .models import CartItem

class CartItemSerializer(serializers.ModelSerializer):
    artwork_id  = serializers.IntegerField(source="artwork.id",     read_only=True)
    title       = serializers.CharField(source="artwork.title",     read_only=True)
    price       = serializers.DecimalField(source="artwork.price",
                                           max_digits=10, decimal_places=2, read_only=True)
    status      = serializers.CharField(source="artwork.status",    read_only=True)
    added_at    = serializers.DateTimeField(read_only=True)
    image_url   = serializers.SerializerMethodField()
    artist_name = serializers.SerializerMethodField()  # ← changed from CharField

    class Meta:
        model  = CartItem
        fields = ["id", "artwork_id", "title", "price", "image_url",
                  "artist_name", "status", "quantity", "added_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.artwork.image and request:
            return request.build_absolute_uri(obj.artwork.image.url)
        return None

    def get_artist_name(self, obj):
        # Safe — returns None if the field doesn't exist yet
        return getattr(obj.artwork, "artist_name", None)