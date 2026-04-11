from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CartItem(models.Model):
    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart_items")
    artwork   = models.ForeignKey("artworks.Artwork", on_delete=models.CASCADE)
    quantity  = models.PositiveIntegerField(default=1)
    added_at  = models.DateTimeField(auto_now_add=True)  # ← timestamp for sorting

    class Meta:
        unique_together = ("user", "artwork")   # one row per artwork per user
        ordering = ["-added_at"]                # newest first always

    def __str__(self):
        return f"{self.user} → {self.artwork.title} × {self.quantity}"

class Purchase(models.Model):
    STATUS_CHOICES = [
        ("pending",   "Pending"),
        ("paid",      "Paid"),
        ("shipped",   "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]
    PAYMENT_CHOICES = [
        ("cod",    "Cash on Delivery"),
        ("esewa",  "eSewa"),
        ("khalti", "Khalti"),
    ]
    user           = models.ForeignKey(User, on_delete=models.CASCADE, related_name="purchases")
    artwork        = models.ForeignKey("artworks.Artwork", on_delete=models.CASCADE)
    quantity       = models.PositiveIntegerField(default=1)
    total_price    = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Purchase #{self.id} — {self.user} → {self.artwork.title}"