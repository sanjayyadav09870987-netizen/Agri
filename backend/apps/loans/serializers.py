from rest_framework import serializers
from .models import LoanApplication, LoanAgreement

class LoanAgreementSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source='farmer.full_name')
    vendor_company = serializers.ReadOnlyField(source='vendor.company_name')

    class Meta:
        model = LoanAgreement
        fields = [
            'id', 'agreement_id', 'loan_application',
            'farmer', 'farmer_name', 'vendor', 'vendor_company',
            'approved_amount', 'interest_rate_percent', 'tenure_months',
            'terms_text', 'repayment_terms',
            'vendor_accepted', 'vendor_accepted_at',
            'farmer_accepted', 'farmer_accepted_at',
            'status', 'disbursal_date', 'disbursal_utr',
            'created_at', 'updated_at'
        ]


class LoanApplicationSerializer(serializers.ModelSerializer):
    agreement = LoanAgreementSerializer(read_only=True)
    farmer_name = serializers.ReadOnlyField(source='farmer.full_name')
    farmer_mobile = serializers.ReadOnlyField(source='farmer.mobile_number')
    vendor_company = serializers.SerializerMethodField()

    class Meta:
        model = LoanApplication
        fields = [
            'id', 'application_id', 'farmer', 'farmer_name', 'farmer_mobile',
            'vendor', 'vendor_company',
            'land_acres', 'land_survey_number', 'crop_name',
            'requested_amount', 'eligible_amount',
            'pattadar_passbook_doc', 'adangal_doc', 'soil_health_doc',
            'documents_verified', 'status', 'rejection_reason',
            'agreement', 'created_at', 'updated_at'
        ]

    def get_vendor_company(self, obj):
        if obj.vendor:
            return obj.vendor.company_name or obj.vendor.full_name
        return None
