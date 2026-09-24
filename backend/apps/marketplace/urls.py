from django.urls import path
from .views import (
    FarmerSellCropListView,
    FarmerAcceptBidView,
    FarmerRejectBidView,
    VendorDashboardView,
    VendorBuyingPreferencesView,
    VendorMatchingBiddingLotsView,
    VendorPlaceBidView,
    VendorCompletePurchaseView
)

urlpatterns = [
    # Farmer Endpoints
    path('farmer/lots/', FarmerSellCropListView.as_view(), name='farmer-sell-crops'),
    path('farmer/lots/<str:lot_id>/accept-bid/', FarmerAcceptBidView.as_view(), name='farmer-accept-bid'),
    path('farmer/lots/<str:lot_id>/reject-bid/', FarmerRejectBidView.as_view(), name='farmer-reject-bid'),

    # Vendor Endpoints (Sections 1, 2, 3)
    path('vendor/dashboard/', VendorDashboardView.as_view(), name='vendor-dashboard'),
    path('vendor/preferences/', VendorBuyingPreferencesView.as_view(), name='vendor-preferences'),
    path('vendor/bidding/matching-lots/', VendorMatchingBiddingLotsView.as_view(), name='vendor-matching-lots'),
    path('vendor/bidding/place-bid/', VendorPlaceBidView.as_view(), name='vendor-place-bid'),
    path('vendor/lots/<str:lot_id>/purchase/', VendorCompletePurchaseView.as_view(), name='vendor-complete-purchase'),
]
