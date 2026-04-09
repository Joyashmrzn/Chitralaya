from django.db import models
from accounts.models import User
from artworks.models import Artwork


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('completed', 'Completed'),
        ('failed',    'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total      = models.DecimalField(max_digits=10, decimal_places=2)
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.email}"


class OrderItem(models.Model):
    order   = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='order_items')
    price   = models.DecimalField(max_digits=10, decimal_places=2)  # snapshot price at purchase time

    def __str__(self):
        return f"{self.artwork.title} — Order #{self.order.id}"


class Payment(models.Model):
    METHOD_CHOICES = [
        ('esewa',  'eSewa'),
        ('khalti', 'Khalti'),
        ('cod',    'Cash on Delivery'),
    ]
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('completed', 'Completed'),
        ('failed',    'Failed'),
    ]

    order          = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    method         = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=200, blank=True, null=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method} payment for Order #{self.order.id} — {self.status}"