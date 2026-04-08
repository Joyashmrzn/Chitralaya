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