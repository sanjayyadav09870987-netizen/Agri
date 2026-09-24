from django.db import models
from apps.authentication.models import UserProfile

class CultivatedCrop(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Cultivating', 'Cultivating'),
        ('Harvested', 'Harvested'),
    )

    farmer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='cultivated_crops')
    crop_name = models.CharField(max_length=80, db_index=True)
    category = models.CharField(max_length=80, blank=True, default='Commercial Crop')
    variety = models.CharField(max_length=100, blank=True, default='Hybrid')
    acres_allocated = models.DecimalField(max_digits=6, decimal_places=2, default=1.0)
    sowing_date = models.DateField(null=True, blank=True)
    expected_harvest_date = models.DateField(null=True, blank=True)
    estimated_yield_quintals = models.DecimalField(max_digits=8, decimal_places=2, default=10.0)
    photo_url = models.TextField(blank=True)
    crop_address = models.TextField(blank=True)
    stage = models.CharField(max_length=100, default='Vegetative Growth')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.crop_name} ({self.farmer.full_name} - {self.status})"


class CropProgressLog(models.Model):
    crop = models.ForeignKey(CultivatedCrop, on_delete=models.CASCADE, related_name='progress_logs')
    stage_title = models.CharField(max_length=120)
    date = models.DateField()
    note = models.TextField(blank=True)
    photo_url = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop.crop_name} Log - {self.stage_title} ({self.date})"


class MarketPriceHistory(models.Model):
    crop_name = models.CharField(max_length=80, db_index=True)
    date = models.DateField(db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=40, default='₹ per Quintal')
    trend = models.CharField(max_length=20, default='stable')

    class Meta:
        ordering = ['date']
        unique_together = ('crop_name', 'date')

    def __str__(self):
        return f"{self.crop_name} ({self.date}): ₹{self.price}"
