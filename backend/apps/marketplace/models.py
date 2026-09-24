from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
from apps.authentication.models import UserProfile

class CropLot(models.Model):
    STATUS_CHOICES = (
        ('Bidding Active', 'Bidding Active'),
        ('Bidding Completed', 'Bidding Completed'),
        ('Bid Accepted', 'Bid Accepted'),
        ('Bid Rejected', 'Bid Rejected'),
        ('Purchased', 'Purchased'),
        ('Expired', 'Expired'),
    )

    lot_id = models.CharField(max_length=60, unique=True, db_index=True)
    farmer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='crop_lots')
    crop_name = models.CharField(max_length=80, db_index=True)
    quantity = models.CharField(max_length=60)
    quantity_quintals = models.DecimalField(max_digits=8, decimal_places=2, default=10.0)
    crop_picture = models.TextField(blank=True)
    crop_address = models.TextField()
    base_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2, default=2000.0)
    current_highest_bid = models.DecimalField(max_digits=10, decimal_places=2, default=2000.0)
    winning_vendor = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_crop_lots')

    bidding_start_time = models.DateTimeField(auto_now_add=True)
    bidding_end_time = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Bidding Active', db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_bidding_open(self):
        return self.status == 'Bidding Active' and timezone.now() < self.bidding_end_time

    def check_bidding_expiration(self):
        if self.status == 'Bidding Active' and timezone.now() >= self.bidding_end_time:
            self.status = 'Bidding Completed'
            self.save(update_fields=['status', 'updated_at'])
        return self.status

    def save(self, *args, **kwargs):
        if not self.lot_id:
            self.lot_id = f"LOT-{uuid.uuid4().hex[:8].upper()}"
        if not self.bidding_end_time:
            self.bidding_end_time = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.lot_id}: {self.crop_name} ({self.quantity}) - {self.status}"


class VendorBid(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
        ('Outbid', 'Outbid'),
        ('Expired', 'Expired'),
    )

    bid_id = models.CharField(max_length=60, unique=True, db_index=True)
    lot = models.ForeignKey(CropLot, on_delete=models.CASCADE, related_name='bids')
    vendor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='placed_bids')
    bid_amount_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    total_lot_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    bid_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')

    def save(self, *args, **kwargs):
        if not self.bid_id:
            self.bid_id = f"BID-{uuid.uuid4().hex[:8].upper()}"
        if not self.total_lot_value and self.lot:
            self.total_lot_value = self.bid_amount_per_quintal * self.lot.quantity_quintals
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.bid_id}: ₹{self.bid_amount_per_quintal}/Qtl by {self.vendor.company_name or self.vendor.full_name}"


class AllocatedLot(models.Model):
    STATUS_CHOICES = (
        ('Pending Purchase', 'Pending Purchase'),
        ('Purchased', 'Purchased'),
        ('Expired', 'Expired'),
    )

    lot = models.OneToOneField(CropLot, on_delete=models.CASCADE, related_name='allocation')
    vendor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='allocated_lots')
    farmer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='farmer_allocations')
    agreed_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    total_purchase_amount = models.DecimalField(max_digits=12, decimal_places=2)
    allocated_at = models.DateTimeField(auto_now_add=True)
    purchase_deadline = models.DateTimeField(db_index=True)  # 24 Hours
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending Purchase', db_index=True)

    purchased_at = models.DateTimeField(null=True, blank=True)
    utr_reference = models.CharField(max_length=80, blank=True)
    payment_mode = models.CharField(max_length=80, blank=True, default='AgriTradeX Escrow RTGS Transfer')

    def is_expired(self):
        return self.status == 'Pending Purchase' and timezone.now() > self.purchase_deadline

    def check_expiration(self):
        if self.is_expired():
            self.status = 'Expired'
            self.save(update_fields=['status'])
        return self.status

    def save(self, *args, **kwargs):
        if not self.purchase_deadline:
            self.purchase_deadline = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Allocation {self.lot.lot_id} -> {self.vendor.company_name} ({self.status})"


class VendorBuyingPreferences(models.Model):
    vendor = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='buying_preferences')
    max_distance_km = models.IntegerField(default=50)  # 0 to 100 km
    selected_crops = models.JSONField(default=list)    # e.g. ["Cotton", "Paddy", "Chilli", "Wheat"]
    min_quantity_quintals = models.DecimalField(max_digits=8, decimal_places=2, default=10.0)
    max_quantity_quintals = models.DecimalField(max_digits=8, decimal_places=2, default=500.0)
    updated_at = models.DateTimeField(auto_now=True)

    def is_crop_eligible(self, crop_lot, estimated_distance_km=25):
        # 1. Distance Match
        if estimated_distance_km > self.max_distance_km:
            return False

        # 2. Crop Type Match
        if self.selected_crops and crop_lot.crop_name not in self.selected_crops:
            return False

        # 3. Quantity Match
        qty = float(crop_lot.quantity_quintals)
        min_q = float(self.min_quantity_quintals)
        max_q = float(self.max_quantity_quintals)
        if qty < min_q or qty > max_q:
            return False

        return True

    def __str__(self):
        return f"Preferences for {self.vendor.company_name or self.vendor.full_name} ({self.max_distance_km}km, {len(self.selected_crops)} crops)"

