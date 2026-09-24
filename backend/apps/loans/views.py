from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import uuid

from apps.authentication.models import UserProfile
from .models import LoanApplication, LoanAgreement
from .serializers import LoanApplicationSerializer, LoanAgreementSerializer

# ============================================================================
# FARMER LOAN APIS
# ============================================================================

class FarmerLoanStatusView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = UserProfile.objects.get(mobile_number=mobile, role='farmer')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)

        app = LoanApplication.objects.filter(farmer=farmer).order_by('-created_at').first()
        if not app:
            return Response({
                'has_application': False,
                'status': 'No Loan Application',
                'application': None
            }, status=status.HTTP_200_OK)

        return Response({
            'has_application': True,
            'status': app.status,
            'application': LoanApplicationSerializer(app).data
        }, status=status.HTTP_200_OK)


class FarmerApplyLoanView(APIView):
    def post(self, request):
        mobile = request.data.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = UserProfile.objects.get(mobile_number=mobile, role='farmer')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)

        vendor = UserProfile.objects.filter(role='vendor').first()

        acres = float(request.data.get('land_acres', farmer.land_acres or 3.5))
        eligible_amt = round(acres * 30000.0, 2)
        req_amt = float(request.data.get('requested_amount', eligible_amt))

        app = LoanApplication.objects.create(
            farmer=farmer,
            vendor=vendor,
            land_acres=acres,
            land_survey_number=request.data.get('land_survey_number') or farmer.land_survey_number or 'SY-108/B',
            crop_name=request.data.get('crop_name', 'Cotton'),
            requested_amount=req_amt,
            eligible_amount=eligible_amt,
            pattadar_passbook_doc=request.data.get('pattadar_passbook_doc', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80'),
            adangal_doc=request.data.get('adangal_doc', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'),
            soil_health_doc=request.data.get('soil_health_doc', 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80'),
            documents_verified=False,
            verification_status='Pending Verification',
            status='Loan Application Submitted'
        )

        return Response({
            'success': True,
            'message': 'Loan application submitted successfully to Vendor Finance Hub.',
            'application': LoanApplicationSerializer(app).data
        }, status=status.HTTP_201_CREATED)


class FarmerAcceptAgreementView(APIView):
    def post(self, request, application_id):
        try:
            app = LoanApplication.objects.get(application_id=application_id)
        except LoanApplication.DoesNotExist:
            return Response({'error': 'Loan application not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            agreement = app.agreement
        except LoanAgreement.DoesNotExist:
            return Response({'error': 'No agreement found for this application'}, status=status.HTTP_400_BAD_REQUEST)

        agreement.farmer_accepted = True
        agreement.farmer_accepted_at = timezone.now()
        agreement.status = 'Agreement Accepted'
        agreement.save()

        app.status = 'Agreement Accepted'
        app.save()

        return Response({
            'success': True,
            'message': 'Loan agreement accepted. Awaiting vendor disbursal.',
            'application': LoanApplicationSerializer(app).data,
            'agreement': LoanAgreementSerializer(agreement).data
        }, status=status.HTTP_200_OK)


# ============================================================================
# VENDOR CROP FINANCE HUB APIS (SECTION 4)
# ============================================================================

class VendorLoanApplicationsListView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendor = UserProfile.objects.get(mobile_number=mobile, role='vendor')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Return applications assigned to this vendor or open for review
        apps = LoanApplication.objects.all().order_by('-created_at')
        serializer = LoanApplicationSerializer(apps, many=True)
        return Response({
            'applications': serializer.data,
            'count': apps.count()
        }, status=status.HTTP_200_OK)


class VendorVerifyDocumentsView(APIView):
    def post(self, request, application_id):
        try:
            app = LoanApplication.objects.get(application_id=application_id)
        except LoanApplication.DoesNotExist:
            return Response({'error': 'Loan application not found'}, status=status.HTTP_404_NOT_FOUND)

        status_value = request.data.get('verification_status', 'Documents Verified')
        if status_value not in ['Pending Verification', 'Documents Verified', 'Documents Not Verified']:
            return Response({'error': 'Invalid verification status'}, status=status.HTTP_400_BAD_REQUEST)

        app.verification_status = status_value
        app.documents_verified = (status_value == 'Documents Verified')
        if app.status == 'Loan Application Submitted':
            app.status = 'Under Vendor Review'
        app.save()

        return Response({
            'success': True,
            'message': f"Document status updated to '{status_value}'.",
            'application': LoanApplicationSerializer(app).data
        }, status=status.HTTP_200_OK)


class VendorReviewLoanView(APIView):
    def post(self, request, application_id):
        try:
            app = LoanApplication.objects.get(application_id=application_id)
        except LoanApplication.DoesNotExist:
            return Response({'error': 'Loan application not found'}, status=status.HTTP_404_NOT_FOUND)

        decision = request.data.get('decision', 'accept')  # 'accept' | 'reject'
        vendor_mobile = request.data.get('vendor_mobile')

        if vendor_mobile:
            vendor = UserProfile.objects.filter(mobile_number=vendor_mobile, role='vendor').first()
            if vendor:
                app.vendor = vendor

        if decision == 'accept':
            # Strict validation: Do not approve until documents are verified
            if not app.documents_verified or app.verification_status != 'Documents Verified':
                return Response({
                    'error': 'Please verify and approve submitted land documents before accepting the loan application.'
                }, status=status.HTTP_400_BAD_REQUEST)

            app.status = 'Agreement Pending'
            app.save()

            approved_amt = float(request.data.get('approved_amount', app.eligible_amount))

            agreement, _ = LoanAgreement.objects.get_or_create(
                loan_application=app,
                defaults={
                    'farmer': app.farmer,
                    'vendor': app.vendor or UserProfile.objects.filter(role='vendor').first(),
                    'approved_amount': approved_amt,
                    'interest_rate_percent': 7.0,
                    'tenure_months': 6,
                    'terms_text': f"Advance cultivation financing of ₹{approved_amt:,.2f} against harvest pledge.",
                    'repayment_terms': 'Deducted directly from harvest sale settlement at APMC/AgriTradeX.',
                    'vendor_accepted': True,
                    'vendor_accepted_at': timezone.now(),
                    'status': 'Agreement Pending'
                }
            )

            return Response({
                'success': True,
                'message': 'Loan approved and agreement generated for farmer signature.',
                'application': LoanApplicationSerializer(app).data,
                'agreement': LoanAgreementSerializer(agreement).data
            }, status=status.HTTP_200_OK)
        else:
            app.status = 'Loan Rejected'
            app.rejection_reason = request.data.get('rejection_reason', 'Land documents verification failed.')
            app.save()

            return Response({
                'success': True,
                'message': 'Loan application rejected.',
                'application': LoanApplicationSerializer(app).data
            }, status=status.HTTP_200_OK)


class VendorDisburseLoanView(APIView):
    def post(self, request, application_id):
        try:
            app = LoanApplication.objects.get(application_id=application_id)
        except LoanApplication.DoesNotExist:
            return Response({'error': 'Loan application not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            agreement = app.agreement
        except LoanAgreement.DoesNotExist:
            return Response({'error': 'No agreement found for this application'}, status=status.HTTP_400_BAD_REQUEST)

        if not agreement.farmer_accepted:
            return Response({'error': 'Farmer must accept agreement before disbursal.'}, status=status.HTTP_400_BAD_REQUEST)

        utr = request.data.get('disbursal_utr', f"UTR{uuid.uuid4().hex[:12].upper()}")
        agreement.status = 'Loan Amount Disbursed'
        agreement.disbursal_date = timezone.now().date()
        agreement.disbursal_utr = utr
        agreement.save()

        app.status = 'Loan Amount Disbursed'
        app.save()

        return Response({
            'success': True,
            'message': f"Loan amount of ₹{agreement.approved_amount:,.2f} disbursed successfully (UTR: {utr}).",
            'application': LoanApplicationSerializer(app).data,
            'agreement': LoanAgreementSerializer(agreement).data
        }, status=status.HTTP_200_OK)
