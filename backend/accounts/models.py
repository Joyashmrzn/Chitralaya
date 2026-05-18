from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("admin", "Admin"),       # The single artist/owner of Chitralaya
        ("customer", "Customer"), # Buyers / collectors
    ]

    email      = models.EmailField(unique=True)
    full_name  = models.CharField(max_length=255, blank=True)
    role       = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)  # Django admin access
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_admin(self):
        return self.role == "admin"
    
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ShippingAddress(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="shipping_addresses"
    )
    full_name    = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    email        = models.EmailField()
    province     = models.CharField(max_length=100)
    district     = models.CharField(max_length=100)
    city         = models.CharField(max_length=100)
    street_address = models.CharField(max_length=255)
    landmark     = models.CharField(max_length=255, blank=True)
    postal_code  = models.CharField(max_length=20)
    is_default   = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]
        verbose_name = "Shipping Address"
        verbose_name_plural = "Shipping Addresses"

    def save(self, *args, **kwargs):
        # Ensure only one default address per user
        if self.is_default:
            ShippingAddress.objects.filter(
                user=self.user, is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} – {self.city} ({'Default' if self.is_default else 'Secondary'})"