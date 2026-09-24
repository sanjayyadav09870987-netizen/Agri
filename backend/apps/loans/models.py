from django.db import models
from apps.authentication.models import UserProfile
import uuid

class LoanApplication(models.Model):
    STATUS_CHOICES = (
        ('No Loan Application', 'No Loan Application'),
        ('Loan Application Submitted', 'Loan Application Submitted'),
        ('Under Vendor Review', 'Under Vendor Review'),
        ('Loan Accepted', 'Loan Accepted'),
        ('Loan Rejected', 'Loan Rejected'),
        ('Agreement Pending', 'Agreement Pending'),
        ('Agreement Accepted', 'Agreement Accepted'),
        ('Loan Amount Disbursed', 'Loan Amount Disbursed'),
    )

    application_id = models.CharField(max_length=60, unique=True, db_index=True)
    farmer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='loan_applications')
    vendor = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_loans')

    land_acres = models.DecimalField(max_digits=6, decimal_places=2, default=2.0)
    land_survey_number = models.CharField(max_length=80)
    crop_name = models.CharField(max_length=80, default='Cotton')
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2, default=50000.0)
    eligible_amount = models.DecimalField(max_digits=12, decimal_places=2, default=50000.0)

    pattadar_passbook_doc = models.TextField(blank=True)
    adangal_doc = models.TextField(blank=True)
    soil_health_doc = models.TextField(blank=True)
    documents_verified = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=40,
        choices=(
            ('Pending Verification', 'Pending Verification'),
            ('Documents Verified', 'Documents Verified'),
            ('Documents Not Verified', 'Documents Not Verified'),
        ),
        default='Pending Verification'
    )

    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='Loan Application Submitted', db_index=True)
    rejection_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.application_id:
            self.application_id = f"LN-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.application_id}: {self.farmer.full_name} (₹{self.requested_amount}) - {self.status}"


class LoanAgreement(models.Model):
    STATUS_CHOICES = (
        ('Agreement Pending', 'Agreement Pending'),
        ('Agreement Accepted', 'Agreement Accepted'),
        ('Loan Amount Disbursed', 'Loan Amount Disbursed'),
    )

    agreement_id = models.CharField(max_length=60, unique=True, db_index=True)
    loan_application = models.OneToOneField(LoanApplication, on_delete=models.CASCADE, related_name='agreement')
    farmer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='farmer_agreements')
    vendor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='vendor_agreements')

    approved_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate_percent = models.DecimalField(max_digits=5, decimal_places=2, default=7.0)
    tenure_months = models.IntegerField(default=6)
    terms_text = models.TextField(blank=True)
    repayment_terms = models.TextField(blank=True)

    vendor_accepted = models.BooleanField(default=True)
    vendor_accepted_at = models.DateTimeField(auto_now_add=True)

    farmer_accepted = models.BooleanField(default=False)
    farmer_accepted_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='Agreement Pending', db_index=True)
    disbursal_date = models.DateField(null=True, blank=True)
    disbursal_utr = models.CharField(max_length=80, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.agreement_id:
            self.agreement_id = f"AGR-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Agreement {self.agreement_id} ({self.status}) for {self.farmer.full_name}"
