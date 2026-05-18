from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from .models import ShippingAddress


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(min_length=2, max_length=255)

    class Meta:
        model  = User
        fields = ["full_name", "email", "password"]

    def validate_full_name(self, value):
        value = value.strip()
        if not re.match(r"^[a-zA-Z\s.'-]+$", value):
            raise serializers.ValidationError(
                "Full name can only contain letters, spaces, dots, hyphens, and apostrophes."
            )
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email     = validated_data["email"],
            password  = validated_data["password"],
            full_name = validated_data.get("full_name", ""),
            role      = "customer",
        )
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, data):
        email    = data.get("email")
        password = data.get("password")

        # Check if user exists first for a more specific error
        try:
            user_exists = User.objects.filter(email=email).exists()
        except Exception:
            raise serializers.ValidationError("Something went wrong. Please try again.")

        if not user_exists:
            raise serializers.ValidationError("No account found with this email.")

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Incorrect password.")
        if not user.is_active:
            raise serializers.ValidationError("Your account has been disabled. Please contact support.")

        data["user"] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ["id", "email", "full_name", "role", "created_at"]


class ShippingAddressSerializer(serializers.ModelSerializer):

    NEPAL_PROVINCES = [
        "Koshi",
        "Madhesh",
        "Bagmati",
        "Gandaki",
        "Lumbini",
        "Karnali",
        "Sudurpashchim",
    ]

    class Meta:
        model = ShippingAddress
        fields = [
            'id', 'full_name', 'phone_number', 'email',
            'province', 'district', 'city', 'street_address',
            'landmark', 'postal_code', 'is_default',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_full_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Full name must be at least 3 characters.")
        if not re.match(r"^[a-zA-Z\s.'-]+$", value):
            raise serializers.ValidationError("Full name can only contain letters, spaces, dots, hyphens, and apostrophes.")
        return value

    def validate_phone_number(self, value):
        value = value.strip()
        # Nepal mobile: starts with 98 or 97, 10 digits
        if not re.match(r'^(98|97)\d{8}$', value):
            raise serializers.ValidationError("Enter a valid Nepali phone number (e.g. 9812345678).")
        return value

    def validate_postal_code(self, value):
        value = value.strip()
        # Nepal postal codes are 5 digits
        if not re.match(r'^\d{5}$', value):
            raise serializers.ValidationError("Postal code must be exactly 5 digits (e.g. 44600).")
        return value

    def validate_province(self, value):
        value = value.strip()
        if value not in self.NEPAL_PROVINCES:
            raise serializers.ValidationError(
                f"Invalid province. Choose from: {', '.join(self.NEPAL_PROVINCES)}."
            )
        return value

    def validate_street_address(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError("Street address must be at least 5 characters.")
        return value

    def validate_landmark(self, value):
        if value:
            value = value.strip()
            if len(value) < 3:
                raise serializers.ValidationError("Landmark must be at least 3 characters if provided.")
        return value

    def validate(self, attrs):
        """Cross-field validation"""
        # Limit addresses per user to 5
        request = self.context.get('request')
        if request and not self.instance:  # only on create
            user = request.user
            if ShippingAddress.objects.filter(user=user).count() >= 5:
                raise serializers.ValidationError(
                    "You can save a maximum of 5 shipping addresses."
                )
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        # Auto-set as default if it's the user's first address
        if not ShippingAddress.objects.filter(user=user).exists():
            validated_data['is_default'] = True
        return super().create(validated_data)