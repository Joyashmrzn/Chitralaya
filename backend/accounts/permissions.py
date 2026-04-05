from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allows access only to users with role == 'admin'.
    Use this on any view that should be restricted to the site owner.

    Example usage:
        from accounts.permissions import IsAdminUser

        class ArtworkCreateView(APIView):
            permission_classes = [IsAuthenticated, IsAdminUser]
            ...
    """
    message = "Only the site administrator can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsCustomer(BasePermission):
    """
    Allows access only to authenticated customers.
    """
    message = "This action is restricted to customers."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "customer"
        )