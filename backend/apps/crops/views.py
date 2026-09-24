from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta, date
import random

from apps.authentication.models import UserProfile
from .models import CultivatedCrop, CropProgressLog, MarketPriceHistory
from .serializers import CultivatedCropSerializer, CropProgressLogSerializer, MarketPriceHistorySerializer

# Baseline prices in INR per Quintal
BASE_PRICES = {
    'Paddy': 2200,
    'Cotton': 6900,
    'Wheat': 2350,
    'Turmeric': 12800,
    'Maize': 2150,
    'Chilli': 18500,
    'Tomato': 2800,
    'Groundnut': 6400,
    'Soybean': 4800
}

SAMPLE_CROP_IMAGES = {
    'Paddy': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    'Cotton': 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
    'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    'Turmeric': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    'Maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    'Chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    'Groundnut': 'https://images.unsplash.com/photo-1567892320421-1c657571ea4a?auto=format&fit=crop&w=600&q=80',
    'Soybean': 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=600&q=80'
}

def seed_farmer_initial_crops(farmer):
    """Seed initial demo crops for farmer if none exist"""
    c1 = CultivatedCrop.objects.create(
        farmer=farmer,
        crop_name='Cotton',
        category='Cash Crop / Commercial',
        variety='Bt Cotton Hybrid',
        acres_allocated=3.5,
        sowing_date=date(2026, 6, 15),
        expected_harvest_date=date(2026, 11, 20),
        estimated_yield_quintals=35.0,
        photo_url=SAMPLE_CROP_IMAGES['Cotton'],
        stage='Flowering & Boll Formation',
        status='Cultivating'
    )
    CropProgressLog.objects.create(
        crop=c1,
        stage_title='Sowing & Germination',
        date=date(2026, 6, 15),
        note='High quality hybrid seeds sown with bio-fertilizers.',
        photo_url='https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=500&q=80'
    )
    CropProgressLog.objects.create(
        crop=c1,
        stage_title='Flowering & Boll Formation',
        date=date(2026, 9, 18),
        note='Bolls forming vigorously. Pest protection sprays completed.',
        photo_url=SAMPLE_CROP_IMAGES['Cotton']
    )

    c2 = CultivatedCrop.objects.create(
        farmer=farmer,
        crop_name='Turmeric',
        category='Spices & Medicinal',
        variety='Salem Curcumin Rich',
        acres_allocated=2.0,
        sowing_date=date(2026, 5, 25),
        expected_harvest_date=date(2026, 12, 15),
        estimated_yield_quintals=24.0,
        photo_url=SAMPLE_CROP_IMAGES['Turmeric'],
        stage='Rhizome Development',
        status='Cultivating'
    )
    CropProgressLog.objects.create(
        crop=c2,
        stage_title='Rhizome Planting',
        date=date(2026, 5, 25),
        note='Planted treated rhizomes on raised beds with organic mulch.',
        photo_url='https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=500&q=80'
    )


class FarmerCropsListView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = UserProfile.objects.get(mobile_number=mobile, role='farmer')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)

        crops = CultivatedCrop.objects.filter(farmer=farmer).order_by('-created_at')
        if not crops.exists():
            seed_farmer_initial_crops(farmer)
            crops = CultivatedCrop.objects.filter(farmer=farmer).order_by('-created_at')

        serializer = CultivatedCropSerializer(crops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        mobile = request.data.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = UserProfile.objects.get(mobile_number=mobile, role='farmer')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)

        crop_name = request.data.get('crop_name', 'Cotton')
        photo_url = request.data.get('photo_url') or SAMPLE_CROP_IMAGES.get(crop_name, SAMPLE_CROP_IMAGES['Paddy'])

        crop = CultivatedCrop.objects.create(
            farmer=farmer,
            crop_name=crop_name,
            category=request.data.get('category', 'Commercial Crop'),
            variety=request.data.get('variety', 'Hybrid'),
            acres_allocated=request.data.get('acres_allocated', 1.0),
            sowing_date=request.data.get('sowing_date') or timezone.now().date(),
            expected_harvest_date=request.data.get('expected_harvest_date'),
            estimated_yield_quintals=request.data.get('estimated_yield_quintals', 10.0),
            photo_url=photo_url,
            crop_address=request.data.get('crop_address', f"{farmer.village}, {farmer.district}"),
            stage=request.data.get('stage', 'Sowing & Germination'),
            status=request.data.get('status', 'Active')
        )

        CropProgressLog.objects.create(
            crop=crop,
            stage_title='Initial Crop Sowing Registered',
            date=timezone.now().date(),
            note='Crop cultivation started and registered in AgriTradeX.',
            photo_url=photo_url
        )

        serializer = CultivatedCropSerializer(crop)
        return Response({
            'success': True,
            'message': f"Crop '{crop_name}' registered successfully.",
            'crop': serializer.data
        }, status=status.HTTP_201_CREATED)


class FarmerCropDetailView(APIView):
    def get(self, request, pk):
        try:
            crop = CultivatedCrop.objects.get(pk=pk)
            return Response(CultivatedCropSerializer(crop).data, status=status.HTTP_200_OK)
        except CultivatedCrop.DoesNotExist:
            return Response({'error': 'Crop not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            crop = CultivatedCrop.objects.get(pk=pk)
            if 'stage' in request.data:
                crop.stage = request.data['stage']
            if 'status' in request.data:
                crop.status = request.data['status']
            if 'photo_url' in request.data:
                crop.photo_url = request.data['photo_url']
            if 'estimated_yield_quintals' in request.data:
                crop.estimated_yield_quintals = request.data['estimated_yield_quintals']
            crop.save()

            return Response({
                'success': True,
                'message': 'Crop updated successfully.',
                'crop': CultivatedCropSerializer(crop).data
            }, status=status.HTTP_200_OK)
        except CultivatedCrop.DoesNotExist:
            return Response({'error': 'Crop not found'}, status=status.HTTP_404_NOT_FOUND)


class FarmerCropProgressLogView(APIView):
    def post(self, request, pk):
        try:
            crop = CultivatedCrop.objects.get(pk=pk)
            stage_title = request.data.get('stage_title', 'Growth Update')
            note = request.data.get('note', '')
            photo_url = request.data.get('photo_url', crop.photo_url)

            log = CropProgressLog.objects.create(
                crop=crop,
                stage_title=stage_title,
                date=timezone.now().date(),
                note=note,
                photo_url=photo_url
            )

            if photo_url:
                crop.photo_url = photo_url
            crop.stage = stage_title
            crop.save()

            return Response({
                'success': True,
                'message': 'Progress log added successfully.',
                'crop': CultivatedCropSerializer(crop).data
            }, status=status.HTTP_201_CREATED)
        except CultivatedCrop.DoesNotExist:
            return Response({'error': 'Crop not found'}, status=status.HTTP_404_NOT_FOUND)


class MarketPriceTrendView(APIView):
    def get(self, request):
        crop_name = request.query_params.get('crop_name', 'Cotton')
        days = int(request.query_params.get('days', 30))

        # Check if DB has historical prices
        history = MarketPriceHistory.objects.filter(crop_name=crop_name).order_by('date')
        if not history.exists():
            # Seed 30 days of data for this crop
            base = BASE_PRICES.get(crop_name, 3000)
            today = timezone.now().date()
            seed_items = []
            cur_price = base

            for i in range(days, -1, -1):
                d = today - timedelta(days=i)
                fluctuation = random.uniform(-0.025, 0.035)
                cur_price = round(cur_price * (1 + fluctuation), 2)
                trend = 'up' if fluctuation > 0 else 'down'
                seed_items.append(
                    MarketPriceHistory(
                        crop_name=crop_name,
                        date=d,
                        price=cur_price,
                        unit='₹ per Quintal',
                        trend=trend
                    )
                )
            MarketPriceHistory.objects.bulk_create(seed_items, ignore_conflicts=True)
            history = MarketPriceHistory.objects.filter(crop_name=crop_name).order_by('date')

        serializer = MarketPriceHistorySerializer(history, many=True)
        return Response({
            'crop_name': crop_name,
            'unit': '₹ per Quintal',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
