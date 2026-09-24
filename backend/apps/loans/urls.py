from django.urls import path
from .views import (
    FarmerLoanStatusView,
    FarmerApplyLoanView,
    FarmerAcceptAgreementView,
    VendorLoanApplicationsListView,
    VendorVerifyDocumentsView,
    VendorReviewLoanView,
    VendorDisburseLoanView
)

urlpatterns = [
    # Farmer Loan Endpoints
    path('farmer/status/', FarmerLoanStatusView.as_view(), name='farmer-loan-status'),
    path('farmer/apply/', FarmerApplyLoanView.as_view(), name='farmer-apply-loan'),
    path('farmer/<str:application_id>/accept-agreement/', FarmerAcceptAgreementView.as_view(), name='farmer-accept-agreement'),

    # Vendor Crop Finance Hub Endpoints (Section 4)
    path('vendor/applications/', VendorLoanApplicationsListView.as_view(), name='vendor-loan-applications'),
    path('vendor/<str:application_id>/verify-documents/', VendorVerifyDocumentsView.as_view(), name='vendor-verify-documents'),
    path('vendor/<str:application_id>/review/', VendorReviewLoanView.as_view(), name='vendor-review-loan'),
    path('vendor/<str:application_id>/disburse/', VendorDisburseLoanView.as_view(), name='vendor-disburse-loan'),
]
