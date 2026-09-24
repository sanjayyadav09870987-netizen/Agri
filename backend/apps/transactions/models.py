from django.db import models
from apps.authentication.models import UserProfile
from apps.marketplace.models import CropLot
import uuid

class CropTransaction(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('Payment Pending', 'Payment Pending'),
        ('Payment Completed', 'Payment Completed'),
    )

    transaction_id = models.CharField(max_length=60, unique=True, db_index=True)
    lot = models.ForeignKey(CropLot, null=True, blank=True, on_delete=models.SET_NULL, related_name='transactions')
    farmer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='farmer_transactions')
    vendor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='vendor_transactions')

    crop_name = models.CharField(max_length=80)
    quantity = models.CharField(max_length=60)
    crop_picture = models.TextField(blank=True)
    purchase_amount = models.DecimalField(max_digits=12, decimal_places=2)
    purchase_date = models.DateField(auto_now_add=True)

    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='Payment Pending', db_index=True)
    payment_date = models.DateField(null=True, blank=True)
    payment_time = models.CharField(max_length=30, blank=True)
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    utr_reference = models.CharField(max_length=80, blank=True)
    payment_mode = models.CharField(max_length=80, blank=True, default='Direct Bank NEFT / RTGS Transfer')

    # Receipt Documents
    crop_purchase_receipt_picture = models.TextField(blank=True)
    crop_receipt_file_name = models.CharField(max_length=150, blank=True)
    crop_receipt_uploaded_at = models.DateTimeField(null=True, blank=True)

    payment_receipt_picture = models.TextField(blank=True)
    payment_receipt_file_name = models.CharField(max_length=150, blank=True)
    payment_receipt_uploaded_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_id}: {self.crop_name} (₹{self.purchase_amount}) - {self.payment_status}"
