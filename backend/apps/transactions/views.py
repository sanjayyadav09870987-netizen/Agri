from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import date
import uuid

from apps.authentication.models import UserProfile
from .models import CropTransaction
from .serializers import CropTransactionSerializer

SAMPLE_RECEIPTS = {
    'cropPurchase': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    'paymentReceipt': 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80'
}

def seed_farmer_initial_transactions(farmer):
    vendor, _ = UserProfile.objects.get_or_create(
        mobile_number='9876543210',
        defaults={'role': 'vendor', 'full_name': 'Kisan Agro Traders', 'company_name': 'Kisan Agro Traders'}
    )

    CropTransaction.objects.create(
        farmer=farmer,
        vendor=vendor,
        crop_name='Cotton (Hybrid Shankar-6)',
        quantity='25 Quintals',
        crop_picture='https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
        purchase_amount=182500.0,
        payment_status='Payment Completed',
        payment_date=timezone.now().date(),
        payment_time='11:30 AM',
        payment_amount=182500.0,
        utr_reference='UTR998811223344',
        payment_mode='AgriTradeX Escrow RTGS Transfer',
        crop_purchase_receipt_picture=SAMPLE_RECEIPTS['cropPurchase'],
        crop_receipt_file_name='Cotton_APMC_Weight_Receipt.jpg',
        crop_receipt_uploaded_at=timezone.now(),
        payment_receipt_picture=SAMPLE_RECEIPTS['paymentReceipt'],
        payment_receipt_file_name='RTGS_Bank_Transfer_Voucher.jpg',
        payment_receipt_uploaded_at=timezone.now()
    )


class FarmerTransactionsListView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = UserProfile.objects.get(mobile_number=mobile, role='farmer')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)

        txns = CropTransaction.objects.filter(farmer=farmer).order_by('-created_at')
        if not txns.exists():
            seed_farmer_initial_transactions(farmer)
            txns = CropTransaction.objects.filter(farmer=farmer).order_by('-created_at')

        serializer = CropTransactionSerializer(txns, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VendorTransactionsListView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendor = UserProfile.objects.get(mobile_number=mobile, role='vendor')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

        txns = CropTransaction.objects.filter(vendor=vendor).order_by('-created_at')
        serializer = CropTransactionSerializer(txns, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VendorPayFarmerView(APIView):
    def post(self, request, txn_id):
        try:
            txn = CropTransaction.objects.get(transaction_id=txn_id)
        except CropTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        amount = float(request.data.get('payment_amount', txn.purchase_amount))
        utr = request.data.get('utr_reference') or f"UTR{uuid.uuid4().hex[:12].upper()}"
        mode = request.data.get('payment_mode', 'Direct Bank NEFT / RTGS Transfer')

        txn.payment_status = 'Payment Completed'
        txn.payment_date = timezone.now().date()
        txn.payment_time = timezone.now().strftime('%I:%M %p')
        txn.payment_amount = amount
        txn.utr_reference = utr
        txn.payment_mode = mode
        txn.save()

        return Response({
            'success': True,
            'message': f"Payment of ₹{amount:,.2f} recorded successfully to {txn.farmer.full_name}.",
            'transaction': CropTransactionSerializer(txn).data
        }, status=status.HTTP_200_OK)


class UploadCropPurchaseReceiptView(APIView):
    def post(self, request, txn_id):
        try:
            txn = CropTransaction.objects.get(transaction_id=txn_id)
        except CropTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        image_url = request.data.get('image_url') or SAMPLE_RECEIPTS['cropPurchase']
        file_name = request.data.get('file_name', 'Crop_Purchase_Receipt.jpg')

        txn.crop_purchase_receipt_picture = image_url
        txn.crop_receipt_file_name = file_name
        txn.crop_receipt_uploaded_at = timezone.now()
        txn.save()

        return Response({
            'success': True,
            'message': 'Crop Purchase Receipt uploaded and linked to company records.',
            'transaction': CropTransactionSerializer(txn).data
        }, status=status.HTTP_200_OK)


class UploadPaymentReceiptView(APIView):
    def post(self, request, txn_id):
        try:
            txn = CropTransaction.objects.get(transaction_id=txn_id)
        except CropTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        image_url = request.data.get('image_url') or SAMPLE_RECEIPTS['paymentReceipt']
        file_name = request.data.get('file_name', 'Payment_Proof_Receipt.jpg')

        txn.payment_receipt_picture = image_url
        txn.payment_receipt_file_name = file_name
        txn.payment_receipt_uploaded_at = timezone.now()
        txn.save()

        return Response({
            'success': True,
            'message': 'Payment Transfer Receipt uploaded and linked to company records.',
            'transaction': CropTransactionSerializer(txn).data
        }, status=status.HTTP_200_OK)
