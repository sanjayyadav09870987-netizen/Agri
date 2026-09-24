from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.marketplace.views import (
    VendorDashboardView,
    VendorBuyingPreferencesView,
    VendorMatchingBiddingLotsView,
    VendorPlaceBidView,
    VendorCompletePurchaseView
)
from apps.loans.views import (
    VendorLoanApplicationsListView,
    VendorVerifyDocumentsView,
    VendorReviewLoanView,
    VendorDisburseLoanView
)
from apps.transactions.views import (
    VendorTransactionsListView,
    VendorPayFarmerView,
    UploadCropPurchaseReceiptView,
    UploadPaymentReceiptView
)

class ApiRootView(APIView):
    def get(self, request):
        return Response({
            'message': 'AgriTradeX Agricultural Marketplace Unified Backend API',
            'version': '1.0.0',
            'status': 'online',
            'endpoints': {
                'auth': '/api/auth/',
                'farmer_crops': '/api/farmer/crops/',
                'farmer_sell_crop': '/api/marketplace/farmer/lots/',
                'farmer_loans': '/api/loans/farmer/',
                'farmer_transactions': '/api/transactions/farmer/list/',
                'vendor_dashboard': '/api/vendor/dashboard/',
                'vendor_preferences': '/api/vendor/preferences/',
                'vendor_bidding': '/api/vendor/bidding/matching-lots/',
                'vendor_loans': '/api/vendor/loans/applications/',
                'vendor_transactions': '/api/vendor/transactions/list/',
            }
        })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', ApiRootView.as_view(), name='api-root'),

    # Shared Auth
    path('api/auth/', include('apps.authentication.urls')),

    # Farmer APIs
    path('api/farmer/crops/', include('apps.crops.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/loans/', include('apps.loans.urls')),
    path('api/transactions/', include('apps.transactions.urls')),

    # Dedicated Vendor Portal APIs (Sections 1, 2, 3, 4, 5)
    path('api/vendor/dashboard/', VendorDashboardView.as_view(), name='vendor-dashboard-api'),
    path('api/vendor/preferences/', VendorBuyingPreferencesView.as_view(), name='vendor-preferences-api'),
    path('api/vendor/bidding/matching-lots/', VendorMatchingBiddingLotsView.as_view(), name='vendor-matching-lots-api'),
    path('api/vendor/bidding/place-bid/', VendorPlaceBidView.as_view(), name='vendor-place-bid-api'),
    path('api/vendor/lots/<str:lot_id>/purchase/', VendorCompletePurchaseView.as_view(), name='vendor-purchase-lot-api'),

    path('api/vendor/loans/applications/', VendorLoanApplicationsListView.as_view(), name='vendor-loans-api'),
    path('api/vendor/loans/<str:application_id>/verify-documents/', VendorVerifyDocumentsView.as_view(), name='vendor-verify-docs-api'),
    path('api/vendor/loans/<str:application_id>/review/', VendorReviewLoanView.as_view(), name='vendor-review-loan-api'),
    path('api/vendor/loans/<str:application_id>/disburse/', VendorDisburseLoanView.as_view(), name='vendor-disburse-loan-api'),

    path('api/vendor/transactions/list/', VendorTransactionsListView.as_view(), name='vendor-transactions-api'),
    path('api/vendor/transactions/<str:txn_id>/pay-farmer/', VendorPayFarmerView.as_view(), name='vendor-pay-farmer-api'),
    path('api/vendor/transactions/<str:txn_id>/upload-crop-receipt/', UploadCropPurchaseReceiptView.as_view(), name='vendor-crop-receipt-api'),
    path('api/vendor/transactions/<str:txn_id>/upload-payment-receipt/', UploadPaymentReceiptView.as_view(), name='vendor-payment-receipt-api'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
