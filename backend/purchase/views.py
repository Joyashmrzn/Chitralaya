from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import CartItem
from .serializers import CartItemSerializer
from artworks.models import Artwork

def serialize(items, request, many=True):
    return CartItemSerializer(items, many=many, context={"request": request}).data

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_cart(request):
    items = CartItem.objects.filter(user=request.user).select_related("artwork")
    return Response(serialize(items, request))

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    artwork_id = request.data.get("artwork_id")
    quantity   = int(request.data.get("quantity", 1))
    try:
        artwork = Artwork.objects.get(id=artwork_id)
    except Artwork.DoesNotExist:
        return Response({"error": "Artwork not found"}, status=404)

    item, created = CartItem.objects.get_or_create(
        user=request.user, artwork=artwork,
        defaults={"quantity": quantity}
    )
    if not created:
        item.quantity += quantity
        item.save()

    return Response(
        serialize(item, request, many=False),
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    try:
        item = CartItem.objects.get(id=item_id, user=request.user)
    except CartItem.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    quantity = int(request.data.get("quantity", 1))
    if quantity < 1:
        return Response({"error": "Quantity must be at least 1"}, status=400)
    item.quantity = quantity
    item.save()
    return Response(serialize(item, request, many=False))

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, item_id):
    try:
        item = CartItem.objects.get(id=item_id, user=request.user)
    except CartItem.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)