from django.urls import path
from .views import RequestOTPView, VerifyOTPView, FarmerBankDetailsView

urlpatterns = [
    path('otp/request/', RequestOTPView.as_view(), name='request-otp'),
    path('otp/verify/', VerifyOTPView.as_view(), name='verify-otp'),
    path('bank-details/', FarmerBankDetailsView.as_view(), name='farmer-bank-details'),
]
