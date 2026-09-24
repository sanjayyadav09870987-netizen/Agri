from rest_framework import serializers
from .models import CropLot, VendorBid, AllocatedLot, VendorBuyingPreferences

class VendorBidSerializer(serializers.ModelSerializer):
    vendor_company = serializers.CharField(source='vendor.company_name', read_only=True)
    vendor_location = serializers.SerializerMethodField()

    class Meta:
        model = VendorBid
        fields = [
            'id', 'bid_id', 'lot', 'vendor', 'vendor_company', 'vendor_location',
            'bid_amount_per_quintal', 'total_lot_value', 'bid_time', 'status'
        ]

    def get_vendor_location(self, obj):
        return f"{obj.vendor.district or 'Hub'}, {obj.vendor.state or 'Telangana'}"


class CropLotSerializer(serializers.ModelSerializer):
    bids_list = VendorBidSerializer(source='bids', many=True, read_only=True)
    winning_vendor_details = serializers.SerializerMethodField()
    farmer_name = serializers.ReadOnlyField(source='farmer.full_name')
    farmer_mobile = serializers.ReadOnlyField(source='farmer.mobile_number')
    is_open = serializers.SerializerMethodField()

    class Meta:
        model = CropLot
        fields = [
            'id', 'lot_id', 'farmer', 'farmer_name', 'farmer_mobile',
            'crop_name', 'quantity', 'quantity_quintals',
            'crop_picture', 'crop_address', 'base_price_per_quintal',
            'current_highest_bid', 'winning_vendor', 'winning_vendor_details',
            'bidding_start_time', 'bidding_end_time', 'status',
            'is_open', 'bids_list', 'created_at', 'updated_at'
        ]

    def get_is_open(self, obj):
        return obj.is_bidding_open()

    def get_winning_vendor_details(self, obj):
        if obj.winning_vendor:
            return {
                'id': obj.winning_vendor.id,
                'company_name': obj.winning_vendor.company_name or obj.winning_vendor.full_name,
                'district': obj.winning_vendor.district,
                'mobile_number': obj.winning_vendor.mobile_number
            }
        return None


class AllocatedLotSerializer(serializers.ModelSerializer):
    lot_details = CropLotSerializer(source='lot', read_only=True)
    farmer_name = serializers.ReadOnlyField(source='farmer.full_name')
    farmer_mobile = serializers.ReadOnlyField(source='farmer.mobile_number')
    vendor_company = serializers.ReadOnlyField(source='vendor.company_name')

    class Meta:
        model = AllocatedLot
        fields = [
            'id', 'lot', 'lot_details', 'vendor', 'vendor_company',
            'farmer', 'farmer_name', 'farmer_mobile',
            'agreed_price_per_quintal', 'total_purchase_amount',
            'allocated_at', 'purchase_deadline', 'status',
            'purchased_at', 'utr_reference', 'payment_mode'
        ]


class VendorBuyingPreferencesSerializer(serializers.ModelSerializer):
    vendor_company = serializers.ReadOnlyField(source='vendor.company_name')
    vendor_mobile = serializers.ReadOnlyField(source='vendor.mobile_number')

    class Meta:
        model = VendorBuyingPreferences
        fields = [
            'id', 'vendor', 'vendor_company', 'vendor_mobile',
            'max_distance_km', 'selected_crops',
            'min_quantity_quintals', 'max_quantity_quintals',
            'updated_at'
        ]

