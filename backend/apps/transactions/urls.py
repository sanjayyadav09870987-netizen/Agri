from django.urls import path
from .views import (
    FarmerTransactionsListView,
    VendorTransactionsListView,
    VendorPayFarmerView,
    UploadCropPurchaseReceiptView,
    UploadPaymentReceiptView
)

urlpatterns = [
    path('farmer/list/', FarmerTransactionsListView.as_view(), name='farmer-transactions-list'),
    path('vendor/list/', VendorTransactionsListView.as_view(), name='vendor-transactions-list'),
    path('<str:txn_id>/pay-farmer/', VendorPayFarmerView.as_view(), name='vendor-pay-farmer'),
    path('<str:txn_id>/upload-crop-receipt/', UploadCropPurchaseReceiptView.as_view(), name='upload-crop-receipt'),
    path('<str:txn_id>/upload-payment-receipt/', UploadPaymentReceiptView.as_view(), name='upload-payment-receipt'),
]
