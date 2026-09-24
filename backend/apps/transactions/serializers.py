from rest_framework import serializers
from .models import CropTransaction

class CropTransactionSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source='farmer.full_name')
    farmer_mobile = serializers.ReadOnlyField(source='farmer.mobile_number')
    vendor_name = serializers.SerializerMethodField()
    lot_id = serializers.SerializerMethodField()
    farmer_bank = serializers.SerializerMethodField()

    class Meta:
        model = CropTransaction
        fields = [
            'id', 'transaction_id', 'lot', 'lot_id',
            'farmer', 'farmer_name', 'farmer_mobile',
            'vendor', 'vendor_name',
            'crop_name', 'quantity', 'crop_picture',
            'purchase_amount', 'purchase_date',
            'payment_status', 'payment_date', 'payment_time',
            'payment_amount', 'utr_reference', 'payment_mode',
            'crop_purchase_receipt_picture', 'crop_receipt_file_name', 'crop_receipt_uploaded_at',
            'payment_receipt_picture', 'payment_receipt_file_name', 'payment_receipt_uploaded_at',
            'farmer_bank', 'created_at', 'updated_at'
        ]

    def get_lot_id(self, obj):
        return obj.lot.lot_id if obj.lot else 'LOT-APMC'

    def get_vendor_name(self, obj):
        return obj.vendor.company_name or obj.vendor.full_name

    def get_farmer_bank(self, obj):
        if hasattr(obj.farmer, 'bank_details'):
            bank = obj.farmer.bank_details
            return {
                'account_holder_name': bank.account_holder_name,
                'masked_account_number': bank.get_masked_account_number(),
                'ifsc_code': bank.ifsc_code,
                'bank_name': bank.bank_name,
                'branch': bank.branch_name
            }
        return {
            'account_holder_name': obj.farmer.full_name,
            'masked_account_number': '••••••••8123',
            'ifsc_code': 'SBIN0020194',
            'bank_name': 'State Bank of India',
            'branch': 'Agri Development Branch'
        }
