from rest_framework import serializers
from .models import CultivatedCrop, CropProgressLog, MarketPriceHistory

class CropProgressLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropProgressLog
        fields = ['id', 'stage_title', 'date', 'note', 'photo_url', 'created_at']


class CultivatedCropSerializer(serializers.ModelSerializer):
    progress_logs = CropProgressLogSerializer(many=True, read_only=True)
    farmer_mobile = serializers.ReadOnlyField(source='farmer.mobile_number')
    farmer_name = serializers.ReadOnlyField(source='farmer.full_name')

    class Meta:
        model = CultivatedCrop
        fields = [
            'id', 'farmer_mobile', 'farmer_name',
            'crop_name', 'category', 'variety', 'acres_allocated',
            'sowing_date', 'expected_harvest_date', 'estimated_yield_quintals',
            'photo_url', 'crop_address', 'stage', 'status',
            'progress_logs', 'created_at', 'updated_at'
        ]


class MarketPriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketPriceHistory
        fields = ['id', 'crop_name', 'date', 'price', 'unit', 'trend']
