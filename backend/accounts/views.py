from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User


class RegisterView(APIView):
    """
    POST /api/accounts/register/
    Public endpoint — creates a customer account.
    Admin accounts must be created via Django management commands only.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/accounts/login/
    Returns a token + user info (including role).
    Frontend uses role to redirect: admin → /admin/dashboard, customer → /
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user  = serializer.validated_data["user"]
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"detail": serializer.errors.get("non_field_errors", ["Login failed."])[0]},
            status=status.HTTP_400_BAD_REQUEST,
        )


class LogoutView(APIView):
    """
    POST /api/accounts/logout/
    Invalidates the user's auth token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    GET /api/accounts/me/
    Returns the authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_customers(request):
    """GET /api/accounts/users/ — admin only"""
    if not request.user.is_staff and request.user.role != 'admin':
        from rest_framework.response import Response
        return Response({'error': 'Forbidden'}, status=403)
 
    users = (
        User.objects
        .filter(is_staff=False, role='customer')
        .annotate(orders_count=Count('orders'))
        .order_by('-created_at')
    )
    data = [
        {
            'id':           u.id,
            'full_name':    u.full_name,
            'email':        u.email,
            'is_active':    u.is_active,
            'orders_count': u.orders_count,
            'created_at':   u.created_at,
        }
        for u in users
    ]
    from rest_framework.response import Response
    return Response(data)
 
 
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_customer_active(request, pk):
    """PATCH /api/accounts/users/<pk>/toggle-active/"""
    if not request.user.is_staff and request.user.role != 'admin':
        from rest_framework.response import Response
        return Response({'error': 'Forbidden'}, status=403)
    try:
        user = User.objects.get(pk=pk, is_staff=False, role='customer')
    except User.DoesNotExist:
        from rest_framework.response import Response
        return Response({'error': 'Not found'}, status=404)
 
    user.is_active = not user.is_active
    user.save(update_fields=['is_active'])
    from rest_framework.response import Response
    return Response({'id': user.id, 'is_active': user.is_active})
 
 
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_customer(request, pk):
    """DELETE /api/accounts/users/<pk>/"""
    if not request.user.is_staff and request.user.role != 'admin':
        from rest_framework.response import Response
        return Response({'error': 'Forbidden'}, status=403)
    try:
        user = User.objects.get(pk=pk, is_staff=False, role='customer')
    except User.DoesNotExist:
        from rest_framework.response import Response
        return Response({'error': 'Not found'}, status=404)
 
    user.delete()
    from rest_framework.response import Response
    return Response(status=204)