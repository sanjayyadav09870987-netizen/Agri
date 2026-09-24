from rest_framework import serializers
from .models import UserProfile, FarmerBankDetails, OTPSession

class FarmerBankDetailsSerializer(serializers.ModelSerializer):
    masked_account_number = serializers.SerializerMethodField()

    class Meta:
        model = FarmerBankDetails
        fields = [
            'id', 'account_holder_name', 'account_number', 'masked_account_number',
            'ifsc_code', 'bank_name', 'branch_name', 'is_verified'
        ]
        extra_kwargs = {
            'account_number': {'write_only': False}
        }

    def get_masked_account_number(self, obj):
        return obj.get_masked_account_number()


class UserProfileSerializer(serializers.ModelSerializer):
    bank_details = FarmerBankDetailsSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'role', 'mobile_number', 'full_name',
            'state', 'district', 'mandal', 'village', 'pincode',
            'land_acres', 'land_survey_number', 'aadhaar_number',
            'company_name', 'company_id', 'gst_number', 'trade_license_number',
            'bank_details', 'created_at', 'updated_at'
        ]


class OTPRequestSerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=15)
    role = serializers.ChoiceField(choices=['farmer', 'vendor'], default='farmer')


class OTPVerifySerializer(serializers.Serializer):
    mobile_number = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)
    role = serializers.ChoiceField(choices=['farmer', 'vendor'], default='farmer')
    full_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    state = serializers.CharField(max_length=80, required=False, allow_blank=True)
    district = serializers.CharField(max_length=80, required=False, allow_blank=True)
    mandal = serializers.CharField(max_length=80, required=False, allow_blank=True)
    village = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    land_acres = serializers.DecimalField(max_digits=6, decimal_places=2, required=False)
    land_survey_number = serializers.CharField(max_length=60, required=False, allow_blank=True)
    company_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
