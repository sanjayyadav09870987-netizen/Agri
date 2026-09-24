from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import random

from .models import UserProfile, FarmerBankDetails, OTPSession
from .serializers import (
    UserProfileSerializer,
    FarmerBankDetailsSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer
)

class RequestOTPView(APIView):
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        mobile_number = serializer.validated_data['mobile_number'].strip()
        role = serializer.validated_data['role']

        # Generate a 6-digit OTP (for dev / demo, accept 123456 or random)
        otp_code = str(random.randint(100000, 999999))
        if mobile_number.startswith('9999') or mobile_number.startswith('9876'):
            otp_code = '123456'

        OTPSession.objects.create(
            mobile_number=mobile_number,
            otp_code=otp_code,
            role=role,
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        return Response({
            'success': True,
            'message': f"OTP sent to {mobile_number}. (Dev Demo Code: {otp_code})",
            'dev_otp': otp_code
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        mobile_number = serializer.validated_data['mobile_number'].strip()
        otp = serializer.validated_data['otp'].strip()
        role = serializer.validated_data['role']

        # Check OTP validity (allow master '123456' for seamless dev testing)
        valid_session = OTPSession.objects.filter(
            mobile_number=mobile_number,
            otp_code=otp,
            is_used=False
        ).order_by('-created_at').first()

        if not valid_session and otp != '123456':
            return Response({
                'success': False,
                'message': 'Invalid or expired OTP. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if valid_session:
            valid_session.is_used = True
            valid_session.save()

        # Find or create UserProfile
        user_profile, created = UserProfile.objects.get_or_create(
            mobile_number=mobile_number,
            defaults={
                'role': role,
                'full_name': serializer.validated_data.get('full_name') or ('Farmer ' + mobile_number[-4:] if role == 'farmer' else 'Vendor Partner'),
                'state': serializer.validated_data.get('state') or 'Telangana',
                'district': serializer.validated_data.get('district') or 'Warangal Rural',
                'mandal': serializer.validated_data.get('mandal') or 'Geesugonda',
                'village': serializer.validated_data.get('village') or 'Dharmaram',
                'pincode': serializer.validated_data.get('pincode') or '506330',
                'land_acres': serializer.validated_data.get('land_acres') or 3.5,
                'land_survey_number': serializer.validated_data.get('land_survey_number') or 'SY-108/B',
                'company_name': serializer.validated_data.get('company_name') or 'Agri Trading Corp'
            }
        )

        # Seed default bank details for farmer if none exists
        if user_profile.role == 'farmer' and not hasattr(user_profile, 'bank_details'):
            FarmerBankDetails.objects.create(
                farmer=user_profile,
                account_holder_name=user_profile.full_name,
                account_number='389102948123',
                ifsc_code='SBIN0020194',
                bank_name='State Bank of India',
                branch_name='Agri Development Branch'
            )

        user_data = UserProfileSerializer(user_profile).data

        return Response({
            'success': True,
            'message': 'Authentication successful.',
            'user': user_data
        }, status=status.HTTP_200_OK)


class FarmerBankDetailsView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number query param is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = UserProfile.objects.get(mobile_number=mobile, role='farmer')
            bank, _ = FarmerBankDetails.objects.get_or_create(
                farmer=farmer,
                defaults={
                    'account_holder_name': farmer.full_name,
                    'account_number': '389102948123',
                    'ifsc_code': 'SBIN0020194',
                    'bank_name': 'State Bank of India',
                    'branch_name': 'Agri Development Branch'
                }
            )
            serializer = FarmerBankDetailsSerializer(bank)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        mobile = request.data.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = UserProfile.objects.get(mobile_number=mobile, role='farmer')
            bank, _ = FarmerBankDetails.objects.get_or_create(farmer=farmer)

            bank.account_holder_name = request.data.get('account_holder_name', bank.account_holder_name or farmer.full_name)
            bank.account_number = request.data.get('account_number', bank.account_number)
            bank.ifsc_code = request.data.get('ifsc_code', bank.ifsc_code).upper()
            bank.bank_name = request.data.get('bank_name', bank.bank_name)
            bank.branch_name = request.data.get('branch_name', bank.branch_name)
            bank.is_verified = True
            bank.save()

            serializer = FarmerBankDetailsSerializer(bank)
            return Response({
                'success': True,
                'message': 'Bank details updated successfully.',
                'bank_details': serializer.data
            }, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)
