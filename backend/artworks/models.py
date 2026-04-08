from django.db import models


class Category(models.Model):
    """
    What kind of art it is.
    e.g. Abstract, Portrait, Nature, Religious, Cultural, Floral
    """
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Medium(models.Model):
    """
    What the artwork is made with.
    e.g. Acrylic, Oil, Watercolor, Charcoal, Pencil
    """
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Mediums"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Artwork(models.Model):
    ORIENTATION_CHOICES = [
    ("portrait",  "Portrait"),
    ("landscape", "Landscape"),
    ("square",    "Square"),
]
    UNIT_CHOICES = [
        ("cm", "Centimeters"),
        ("in", "Inches"),
    ]

    STATUS_CHOICES = [
        ("draft",     "Draft"),       # saved but not visible to customers
        ("published", "Published"),   # visible and purchasable
        ("sold_out",  "Sold Out"),    # visible but cannot be purchased
        ("archived",  "Archived"),    # hidden, kept for records
    ]
    orientation = models.CharField(
        max_length=10,
        choices=ORIENTATION_CHOICES,
        blank=True,
        null=True,
     )
    # ── Core Info ─────────────────────────────────────────────────────────────
    title       = models.CharField(max_length=255)
    slug        = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)

    # ── Classification ────────────────────────────────────────────────────────
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="artworks"
    )
    medium = models.ForeignKey(
        Medium,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="artworks"
    )

    # ── Physical Details ──────────────────────────────────────────────────────
    width       = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    height      = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    unit        = models.CharField(max_length=2, choices=UNIT_CHOICES, default="cm")
    year_created = models.PositiveIntegerField(null=True, blank=True)

    # ── Pricing & Stock ───────────────────────────────────────────────────────
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    stock       = models.PositiveIntegerField(default=1)

    # ── Media ─────────────────────────────────────────────────────────────────
    image       = models.ImageField(upload_to="artworks/", null=True, blank=True)

    # ── Status ────────────────────────────────────────────────────────────────
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Auto-generate slug from title if not set
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Artwork.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def dimensions_display(self):
        if self.width and self.height:
            return f"{self.width} × {self.height} {self.unit}"
        return "—"

    @property
    def is_available(self):
        return self.status == "published" and self.stock > 0