from django.db import models
from django.utils import timezone
from datetime import timedelta

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('farmer', 'Farmer'),
        ('vendor', 'Vendor'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, db_index=True)
    mobile_number = models.CharField(max_length=15, unique=True, db_index=True)
    full_name = models.CharField(max_length=120)

    # Location Details
    state = models.CharField(max_length=80, default='Telangana')
    district = models.CharField(max_length=80, blank=True)
    mandal = models.CharField(max_length=80, blank=True)
    village = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    # Farmer Specific Details
    land_acres = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, default=0.0)
    land_survey_number = models.CharField(max_length=60, blank=True)
    aadhaar_number = models.CharField(max_length=20, blank=True)

    # Vendor Specific Details
    company_name = models.CharField(max_length=150, blank=True)
    company_id = models.CharField(max_length=60, blank=True)
    gst_number = models.CharField(max_length=30, blank=True)
    trade_license_number = models.CharField(max_length=60, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        role_label = 'Farmer' if self.role == 'farmer' else 'Vendor'
        return f"{self.full_name} ({role_label} - {self.mobile_number})"


class FarmerBankDetails(models.Model):
    farmer = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='bank_details')
    account_holder_name = models.CharField(max_length=120)
    account_number = models.CharField(max_length=30)
    ifsc_code = models.CharField(max_length=20)
    bank_name = models.CharField(max_length=120, default='State Bank of India')
    branch_name = models.CharField(max_length=120, default='Agricultural Development Branch')
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_masked_account_number(self):
        if not self.account_number:
            return '••••••••'
        visible_digits = self.account_number[-4:] if len(self.account_number) >= 4 else self.account_number
        return f"••••••••{visible_digits}"

    def __str__(self):
        return f"Bank for {self.farmer.full_name} ({self.get_masked_account_number()})"


class OTPSession(models.Model):
    mobile_number = models.CharField(max_length=15, db_index=True)
    otp_code = models.CharField(max_length=6)
    role = models.CharField(max_length=20, default='farmer')
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return (not self.is_used) and (timezone.now() <= self.expires_at)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"OTP for {self.mobile_number} ({self.otp_code})"
