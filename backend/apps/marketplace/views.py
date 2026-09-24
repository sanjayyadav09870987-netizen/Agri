from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import uuid

from apps.authentication.models import UserProfile
from .models import CropLot, VendorBid, AllocatedLot, VendorBuyingPreferences
from .serializers import (
    CropLotSerializer,
    VendorBidSerializer,
    AllocatedLotSerializer,
    VendorBuyingPreferencesSerializer
)
from apps.transactions.models import CropTransaction
from apps.loans.models import LoanApplication

SAMPLE_CROP_IMAGES = {
    'Paddy': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    'Cotton': 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
    'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    'Turmeric': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    'Maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    'Chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
}

# ============================================================================
# FARMER MARKETPLACE APIS
# ============================================================================

class FarmerSellCropListView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = UserProfile.objects.get(mobile_number=mobile, role='farmer')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=status.HTTP_404_NOT_FOUND)

        lots = CropLot.objects.filter(farmer=farmer).order_by('-created_at')
        for lot in lots:
            lot.check_bidding_expiration()

        serializer = CropLotSerializer(lots, many=True)
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
        quantity_str = request.data.get('quantity', '30 Quintals')
        quantity_num = float(request.data.get('quantity_number', 30.0))
        base_price = float(request.data.get('base_price', 7200.0))
        photo = request.data.get('photo_url') or SAMPLE_CROP_IMAGES.get(crop_name, SAMPLE_CROP_IMAGES['Cotton'])
        address = request.data.get('crop_address') or f"{farmer.village}, {farmer.mandal}, {farmer.district}"

        lot = CropLot.objects.create(
            farmer=farmer,
            crop_name=crop_name,
            quantity=quantity_str,
            quantity_quintals=quantity_num,
            crop_picture=photo,
            crop_address=address,
            base_price_per_quintal=base_price,
            current_highest_bid=base_price,
            bidding_end_time=timezone.now() + timedelta(hours=24),
            status='Bidding Active'
        )

        # Create 2 default competitive bids for realistic marketplace interaction
        v1, _ = UserProfile.objects.get_or_create(
            mobile_number='9876543210',
            defaults={'role': 'vendor', 'full_name': 'Kisan Agro Traders', 'company_name': 'Kisan Agro Traders', 'district': 'Warangal Market Hub'}
        )
        v2, _ = UserProfile.objects.get_or_create(
            mobile_number='9876543211',
            defaults={'role': 'vendor', 'full_name': 'Sri Lakshmi Exports', 'company_name': 'Sri Lakshmi Exports', 'district': 'Hyderabad Agri Mandi'}
        )

        bid1_amt = round(base_price * 1.03, 2)
        bid2_amt = round(base_price * 1.07, 2)

        VendorBid.objects.create(
            lot=lot, vendor=v1,
            bid_amount_per_quintal=bid1_amt,
            total_lot_value=bid1_amt * quantity_num,
            status='Outbid'
        )
        VendorBid.objects.create(
            lot=lot, vendor=v2,
            bid_amount_per_quintal=bid2_amt,
            total_lot_value=bid2_amt * quantity_num,
            status='Active'
        )

        lot.current_highest_bid = bid2_amt
        lot.winning_vendor = v2
        lot.save()

        serializer = CropLotSerializer(lot)
        return Response({
            'success': True,
            'message': f"Crop lot for '{crop_name}' pushed to marketplace for 24h bidding.",
            'lot': serializer.data
        }, status=status.HTTP_201_CREATED)


class FarmerAcceptBidView(APIView):
    def post(self, request, lot_id):
        try:
            lot = CropLot.objects.get(lot_id=lot_id)
        except CropLot.DoesNotExist:
            return Response({'error': 'Crop lot not found'}, status=status.HTTP_404_NOT_FOUND)

        if not lot.winning_vendor:
            top_bid = lot.bids.order_by('-bid_amount_per_quintal').first()
            if top_bid:
                lot.winning_vendor = top_bid.vendor
                lot.current_highest_bid = top_bid.bid_amount_per_quintal

        if not lot.winning_vendor:
            return Response({'error': 'No winning vendor found for this lot'}, status=status.HTTP_400_BAD_REQUEST)

        lot.status = 'Bid Accepted'
        lot.save()

        # Update top bid status
        top_bid = lot.bids.filter(vendor=lot.winning_vendor).order_by('-bid_amount_per_quintal').first()
        if top_bid:
            top_bid.status = 'Accepted'
            top_bid.save()

        # Mark other bids rejected
        lot.bids.exclude(pk=top_bid.pk if top_bid else 0).update(status='Rejected')

        # Create AllocatedLot with 24h purchase period for winning vendor
        total_val = lot.current_highest_bid * lot.quantity_quintals
        allocation, _ = AllocatedLot.objects.get_or_create(
            lot=lot,
            defaults={
                'vendor': lot.winning_vendor,
                'farmer': lot.farmer,
                'agreed_price_per_quintal': lot.current_highest_bid,
                'total_purchase_amount': total_val,
                'purchase_deadline': timezone.now() + timedelta(hours=24),
                'status': 'Pending Purchase'
            }
        )

        return Response({
            'success': True,
            'message': f"Bid accepted! Allocated Lot created for vendor '{lot.winning_vendor.company_name or lot.winning_vendor.full_name}'.",
            'lot': CropLotSerializer(lot).data,
            'allocation': AllocatedLotSerializer(allocation).data
        }, status=status.HTTP_200_OK)


class FarmerRejectBidView(APIView):
    def post(self, request, lot_id):
        try:
            lot = CropLot.objects.get(lot_id=lot_id)
        except CropLot.DoesNotExist:
            return Response({'error': 'Crop lot not found'}, status=status.HTTP_404_NOT_FOUND)

        lot.status = 'Bid Rejected'
        lot.save()
        lot.bids.update(status='Rejected')

        return Response({
            'success': True,
            'message': 'Bid rejected. Your private details were not shared with any vendor.',
            'lot': CropLotSerializer(lot).data
        }, status=status.HTTP_200_OK)


# ============================================================================
# VENDOR PORTAL APIS (SECTIONS 1, 2, 3)
# ============================================================================

class VendorDashboardView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendor = UserProfile.objects.get(mobile_number=mobile, role='vendor')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Enforce Server-Side 24-hour Expiration on Allocated Lots
        allocated_qs = AllocatedLot.objects.filter(vendor=vendor)
        for alloc in allocated_qs:
            alloc.check_expiration()

        # Active allocated lots (Pending Purchase or Purchased today)
        active_allocations = allocated_qs.exclude(status='Expired').order_by('-allocated_at')
        purchased_allocations = allocated_qs.filter(status='Purchased').order_by('-purchased_at')
        pending_allocations = allocated_qs.filter(status='Pending Purchase').order_by('purchase_deadline')

        # Convert to serialized structures
        allocated_lots_data = []
        for a in active_allocations:
            allocated_lots_data.append({
                'id': a.lot.lot_id,
                'cropName': a.lot.crop_name,
                'cropPicture': a.lot.crop_picture,
                'quantity': a.lot.quantity,
                'cropAddress': a.lot.crop_address,
                'purchaseAmount': float(a.total_purchase_amount),
                'purchaseDeadline': int(a.purchase_deadline.timestamp() * 1000),
                'status': 'Purchased' if a.status == 'Purchased' else 'Pending Purchase',
                'allocatedAt': int(a.allocated_at.timestamp() * 1000),
                'farmerDetails': {
                    'fullName': a.farmer.full_name,
                    'mobileNumber': a.farmer.mobile_number,
                    'village': a.farmer.village,
                    'district': a.farmer.district
                }
            })

        purchased_lots_data = []
        for p in purchased_allocations:
            purchased_lots_data.append({
                'id': p.lot.lot_id,
                'cropName': p.lot.crop_name,
                'cropPicture': p.lot.crop_picture,
                'quantity': p.lot.quantity,
                'purchaseAmount': float(p.total_purchase_amount),
                'purchaseDate': p.purchased_at.strftime('%Y-%m-%d') if p.purchased_at else timezone.now().strftime('%Y-%m-%d'),
                'purchaseTime': p.purchased_at.strftime('%I:%M %p') if p.purchased_at else '11:00 AM',
                'utrReference': p.utr_reference or 'UTR-COMPLETED',
                'paymentMode': p.payment_mode or 'AgriTradeX Escrow RTGS Transfer',
                'farmerName': p.farmer.full_name,
                'farmerMobile': p.farmer.mobile_number
            })

        pending_lots_data = []
        for p in pending_allocations:
            pending_lots_data.append({
                'id': p.lot.lot_id,
                'cropName': p.lot.crop_name,
                'cropPicture': p.lot.crop_picture,
                'quantity': p.lot.quantity,
                'cropAddress': p.lot.crop_address,
                'purchaseAmount': float(p.total_purchase_amount),
                'purchaseDeadline': int(p.purchase_deadline.timestamp() * 1000),
                'allocatedAt': int(p.allocated_at.timestamp() * 1000),
                'farmerDetails': {
                    'fullName': p.farmer.full_name,
                    'mobileNumber': p.farmer.mobile_number,
                    'village': p.farmer.village,
                    'district': p.farmer.district
                }
            })

        # Count of loan applications available for this vendor
        loans_count = LoanApplication.objects.filter(
            status__in=['Loan Application Submitted', 'Under Vendor Review', 'Agreement Pending']
        ).count()

        return Response({
            'allocatedLots': allocated_lots_data,
            'purchasedTodayLots': purchased_lots_data,
            'pendingTodayLots': pending_lots_data,
            'allocatedCount': len(allocated_lots_data),
            'purchasedTodayCount': len(purchased_lots_data),
            'pendingTodayCount': len(pending_lots_data),
            'loanApplicationsCount': loans_count
        }, status=status.HTTP_200_OK)


class VendorBuyingPreferencesView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendor = UserProfile.objects.get(mobile_number=mobile, role='vendor')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

        prefs, created = VendorBuyingPreferences.objects.get_or_create(
            vendor=vendor,
            defaults={
                'max_distance_km': 50,
                'selected_crops': ['Cotton', 'Paddy', 'Wheat', 'Turmeric', 'Chilli', 'Maize'],
                'min_quantity_quintals': 10.0,
                'max_quantity_quintals': 500.0
            }
        )

        return Response({
            'maxDistanceKm': prefs.max_distance_km,
            'selectedCrops': prefs.selected_crops,
            'minQuantityQuintals': float(prefs.min_quantity_quintals),
            'maxQuantityQuintals': float(prefs.max_quantity_quintals),
            'isConfigured': True,
            'updatedAt': prefs.updated_at
        }, status=status.HTTP_200_OK)

    def post(self, request):
        mobile = request.data.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendor = UserProfile.objects.get(mobile_number=mobile, role='vendor')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

        max_distance = int(request.data.get('max_distance_km', 50))
        selected_crops = request.data.get('selected_crops', [])
        min_qty = float(request.data.get('min_quantity_quintals', 10.0))
        max_qty = float(request.data.get('max_quantity_quintals', 500.0))

        # Validations
        if min_qty <= 0:
            return Response({'error': 'Minimum quantity must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)
        if max_qty <= min_qty:
            return Response({'error': 'Maximum quantity must be greater than minimum quantity.'}, status=status.HTTP_400_BAD_REQUEST)
        if max_distance < 0 or max_distance > 100:
            return Response({'error': 'Distance must be between 0 and 100 km.'}, status=status.HTTP_400_BAD_REQUEST)

        prefs, _ = VendorBuyingPreferences.objects.get_or_create(vendor=vendor)
        prefs.max_distance_km = max_distance
        prefs.selected_crops = selected_crops
        prefs.min_quantity_quintals = min_qty
        prefs.max_quantity_quintals = max_qty
        prefs.save()

        return Response({
            'success': True,
            'message': 'Buying preferences saved successfully. Matching crops are ready for bidding.',
            'preferences': {
                'maxDistanceKm': prefs.max_distance_km,
                'selectedCrops': prefs.selected_crops,
                'minQuantityQuintals': float(prefs.min_quantity_quintals),
                'maxQuantityQuintals': float(prefs.max_quantity_quintals)
            }
        }, status=status.HTTP_200_OK)


class VendorMatchingBiddingLotsView(APIView):
    def get(self, request):
        mobile = request.query_params.get('mobile_number')
        if not mobile:
            return Response({'error': 'mobile_number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendor = UserProfile.objects.get(mobile_number=mobile, role='vendor')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

        prefs, _ = VendorBuyingPreferences.objects.get_or_create(vendor=vendor)

        # 1. Update 24h bidding status on all active lots
        open_lots = CropLot.objects.filter(status='Bidding Active')
        for lot in open_lots:
            lot.check_bidding_expiration()

        # 2. Filter matching lots based on vendor preferences
        matching_lots_data = []
        for lot in CropLot.objects.filter(status='Bidding Active').order_by('-created_at'):
            # Estimated simulated distance based on district / hash
            dist_km = (abs(hash(lot.lot_id + vendor.mobile_number)) % 65) + 5

            if prefs.is_crop_eligible(lot, estimated_distance_km=dist_km):
                bids = VendorBid.objects.filter(lot=lot).order_by('-bid_amount_per_quintal')
                bids_serialized = []
                for b in bids:
                    bids_serialized.append({
                        'id': b.bid_id,
                        'vendorCompany': b.vendor.company_name or b.vendor.full_name,
                        'vendorLocation': f"{b.vendor.district or 'Market Hub'}",
                        'bidAmountPerQuintal': float(b.bid_amount_per_quintal),
                        'bidTime': int(b.bid_time.timestamp() * 1000)
                    })

                vendor_current_bid = bids.filter(vendor=vendor).first()

                matching_lots_data.append({
                    'id': lot.lot_id,
                    'cropName': lot.crop_name,
                    'cropPicture': lot.crop_picture or SAMPLE_CROP_IMAGES.get(lot.crop_name, SAMPLE_CROP_IMAGES['Cotton']),
                    'quantity': lot.quantity,
                    'quantityNumber': float(lot.quantity_quintals),
                    'cropAddress': lot.crop_address,
                    'distanceKm': dist_km,
                    'basePrice': float(lot.base_price_per_quintal),
                    'currentHighestBid': float(lot.current_highest_bid),
                    'myCurrentBid': float(vendor_current_bid.bid_amount_per_quintal) if vendor_current_bid else None,
                    'expiresAt': int(lot.bidding_end_time.timestamp() * 1000),
                    'status': 'Bidding Active',
                    'bidsList': bids_serialized
                })

        return Response({
            'matchingLots': matching_lots_data,
            'count': len(matching_lots_data),
            'preferencesApplied': {
                'maxDistanceKm': prefs.max_distance_km,
                'selectedCrops': prefs.selected_crops,
                'minQuantityQuintals': float(prefs.min_quantity_quintals),
                'maxQuantityQuintals': float(prefs.max_quantity_quintals)
            }
        }, status=status.HTTP_200_OK)


class VendorPlaceBidView(APIView):
    def post(self, request):
        mobile = request.data.get('mobile_number')
        lot_id = request.data.get('lot_id')
        bid_amount = request.data.get('bid_amount')

        if not mobile or not lot_id or not bid_amount:
            return Response({'error': 'mobile_number, lot_id, and bid_amount are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendor = UserProfile.objects.get(mobile_number=mobile, role='vendor')
        except UserProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            lot = CropLot.objects.get(lot_id=lot_id)
        except CropLot.DoesNotExist:
            return Response({'error': 'Crop lot not found'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Enforce 24h bidding period
        if not lot.is_bidding_open():
            lot.check_bidding_expiration()
            return Response({'error': '24-hour bidding period has expired for this crop lot.'}, status=status.HTTP_400_BAD_REQUEST)

        bid_val = float(bid_amount)
        if bid_val <= float(lot.current_highest_bid):
            return Response({
                'error': f'Bid amount must be higher than current highest bid (₹{lot.current_highest_bid:,.2f}).'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Mark previous active bids as outbid
        lot.bids.filter(status='Active').update(status='Outbid')

        # Create new highest bid
        bid = VendorBid.objects.create(
            lot=lot,
            vendor=vendor,
            bid_amount_per_quintal=bid_val,
            total_lot_value=bid_val * float(lot.quantity_quintals),
            status='Active'
        )

        lot.current_highest_bid = bid_val
        lot.winning_vendor = vendor
        lot.save()

        return Response({
            'success': True,
            'message': f"Bid of ₹{bid_val:,.2f} / Quintal successfully placed on Lot {lot.lot_id} ({lot.crop_name}).",
            'bid': VendorBidSerializer(bid).data,
            'currentHighestBid': bid_val
        }, status=status.HTTP_201_CREATED)


class VendorCompletePurchaseView(APIView):
    def post(self, request, lot_id):
        try:
            lot = CropLot.objects.get(lot_id=lot_id)
        except CropLot.DoesNotExist:
            return Response({'error': 'Crop lot not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            allocation = lot.allocation
        except AllocatedLot.DoesNotExist:
            return Response({'error': 'No allocation record found for this lot'}, status=status.HTTP_400_BAD_REQUEST)

        purchase_amount = float(request.data.get('purchase_amount', allocation.total_purchase_amount))
        utr = request.data.get('utr_reference', f"UTR{uuid.uuid4().hex[:12].upper()}")
        mode = request.data.get('payment_mode', 'AgriTradeX Escrow RTGS Transfer')

        allocation.status = 'Purchased'
        allocation.purchased_at = timezone.now()
        allocation.utr_reference = utr
        allocation.payment_mode = mode
        allocation.save()

        lot.status = 'Purchased'
        lot.save()

        # Create or update CropTransaction record
        txn, _ = CropTransaction.objects.get_or_create(
            lot=lot,
            defaults={
                'farmer': lot.farmer,
                'vendor': allocation.vendor,
                'crop_name': lot.crop_name,
                'quantity': lot.quantity,
                'crop_picture': lot.crop_picture,
                'purchase_amount': purchase_amount,
                'payment_status': 'Payment Completed',
                'payment_date': timezone.now().date(),
                'payment_time': timezone.now().strftime('%I:%M %p'),
                'payment_amount': purchase_amount,
                'utr_reference': utr,
                'payment_mode': mode
            }
        )

        return Response({
            'success': True,
            'message': f"Purchase recorded for lot {lot.lot_id}. Moved to Transactions & Purchased Lots Today.",
            'transaction_id': txn.transaction_id
        }, status=status.HTTP_200_OK)
