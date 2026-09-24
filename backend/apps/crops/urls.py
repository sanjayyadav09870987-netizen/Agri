from django.urls import path
from .views import (
    FarmerCropsListView,
    FarmerCropDetailView,
    FarmerCropProgressLogView,
    MarketPriceTrendView
)

urlpatterns = [
    path('list/', FarmerCropsListView.as_view(), name='farmer-crops-list'),
    path('<int:pk>/', FarmerCropDetailView.as_view(), name='farmer-crop-detail'),
    path('<int:pk>/progress-log/', FarmerCropProgressLogView.as_view(), name='farmer-crop-progress-log'),
    path('price-trend/', MarketPriceTrendView.as_view(), name='market-price-trend'),
]
