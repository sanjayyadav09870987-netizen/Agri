import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agritradex_backend.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta, date
from apps.authentication.models import UserProfile, FarmerBankDetails
from apps.crops.models import CultivatedCrop, CropProgressLog, MarketPriceHistory
from apps.marketplace.models import CropLot, VendorBid, AllocatedLot, VendorBuyingPreferences
from apps.loans.models import LoanApplication, LoanAgreement
from apps.transactions.models import CropTransaction

def seed_all():
    print("[AgriTradeX] Seeding initial database records...")

    # 1. Farmer User
    farmer, _ = UserProfile.objects.get_or_create(
        mobile_number='9876543210',
        defaults={
            'role': 'farmer',
            'full_name': 'Ramesh Yadav',
            'state': 'Telangana',
            'district': 'Warangal Rural',
            'mandal': 'Geesugonda',
            'village': 'Dharmaram',
            'pincode': '506330',
            'land_acres': 5.0,
            'land_survey_number': 'SY-108/B',
            'aadhaar_number': '••••••••4812'
        }
    )

    # 2. Farmer Bank Details
    bank, _ = FarmerBankDetails.objects.get_or_create(
        farmer=farmer,
        defaults={
            'account_holder_name': 'Ramesh Yadav',
            'account_number': '389102948123',
            'ifsc_code': 'SBIN0020194',
            'bank_name': 'State Bank of India',
            'branch_name': 'Warangal Agri Branch',
            'is_verified': True
        }
    )

    # 3. Vendor Users
    vendor, _ = UserProfile.objects.get_or_create(
        mobile_number='9999888877',
        defaults={
            'role': 'vendor',
            'full_name': 'Suresh Kumar',
            'company_name': 'Kisan Agro Traders Pvt Ltd',
            'company_id': 'REG-TEL-8891',
            'state': 'Telangana',
            'district': 'Warangal Market Hub',
            'gst_number': '36AABCK1234F1Z5'
        }
    )

    vendor2, _ = UserProfile.objects.get_or_create(
        mobile_number='9123456780',
        defaults={
            'role': 'vendor',
            'full_name': 'Vikram Mehta',
            'company_name': 'Apex Agri Traders Pvt Ltd',
            'company_id': 'REG-TEL-9942',
            'state': 'Telangana',
            'district': 'Hyderabad Trading Zone',
            'gst_number': '36AABCA5566G1Z9'
        }
    )

    # 4. Vendor Buying Preferences
    for v in [vendor, vendor2]:
        VendorBuyingPreferences.objects.get_or_create(
            vendor=v,
            defaults={
                'max_distance_km': 60,
                'selected_crops': ['Cotton', 'Paddy', 'Wheat', 'Turmeric', 'Chilli', 'Maize'],
                'min_quantity_quintals': 10.0,
                'max_quantity_quintals': 500.0
            }
        )

    # 5. Cultivated Crops for Farmer
    c1, _ = CultivatedCrop.objects.get_or_create(
        farmer=farmer,
        crop_name='Cotton',
        defaults={
            'category': 'Cash Crop / Commercial',
            'variety': 'Bt Cotton Hybrid',
            'acres_allocated': 3.5,
            'sowing_date': date(2026, 6, 15),
            'expected_harvest_date': date(2026, 11, 20),
            'estimated_yield_quintals': 35.0,
            'photo_url': 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
            'stage': 'Flowering & Boll Formation',
            'status': 'Cultivating',
            'crop_address': 'Survey No: 108/B, Dharmaram, Warangal'
        }
    )

    c2, _ = CultivatedCrop.objects.get_or_create(
        farmer=farmer,
        crop_name='Turmeric',
        defaults={
            'category': 'Spices & Medicinal',
            'variety': 'Salem Curcumin Rich',
            'acres_allocated': 1.5,
            'sowing_date': date(2026, 5, 25),
            'expected_harvest_date': date(2026, 12, 15),
            'estimated_yield_quintals': 24.0,
            'photo_url': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
            'stage': 'Rhizome Development',
            'status': 'Cultivating',
            'crop_address': 'Survey No: 108/B, Dharmaram, Warangal'
        }
    )

    # 6. Active Crop Lots For Bidding
    lot_cotton, _ = CropLot.objects.get_or_create(
        lot_id='LOT-CTN-201',
        defaults={
            'farmer': farmer,
            'crop_name': 'Cotton',
            'quantity': '40 Quintals',
            'quantity_quintals': 40.0,
            'crop_picture': 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
            'crop_address': 'Survey No: 108/B, Dharmaram, Warangal',
            'base_price_per_quintal': 7200.0,
            'current_highest_bid': 7450.0,
            'bidding_end_time': timezone.now() + timedelta(hours=18),
            'status': 'Bidding Active'
        }
    )

    lot_paddy, _ = CropLot.objects.get_or_create(
        lot_id='LOT-PDY-202',
        defaults={
            'farmer': farmer,
            'crop_name': 'Paddy',
            'quantity': '60 Quintals',
            'quantity_quintals': 60.0,
            'crop_picture': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
            'crop_address': 'Survey No: 112/A, Geesugonda, Warangal',
            'base_price_per_quintal': 2250.0,
            'current_highest_bid': 2380.0,
            'bidding_end_time': timezone.now() + timedelta(hours=22),
            'status': 'Bidding Active'
        }
    )

    # 7. Allocated Lots (Pending Purchase for Vendor)
    lot_turmeric, _ = CropLot.objects.get_or_create(
        lot_id='LOT-TRM-301',
        defaults={
            'farmer': farmer,
            'crop_name': 'Turmeric',
            'quantity': '20 Quintals',
            'quantity_quintals': 20.0,
            'crop_picture': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
            'crop_address': 'Survey No: 108/B, Dharmaram, Warangal',
            'base_price_per_quintal': 12500.0,
            'current_highest_bid': 13200.0,
            'winning_vendor': vendor,
            'status': 'Bid Accepted'
        }
    )

    AllocatedLot.objects.get_or_create(
        lot=lot_turmeric,
        defaults={
            'vendor': vendor2,
            'farmer': farmer,
            'agreed_price_per_quintal': 13200.0,
            'total_purchase_amount': 264000.0,
            'purchase_deadline': timezone.now() + timedelta(hours=21),
            'status': 'Pending Purchase'
        }
    )

    # 8. Loan Application & Agreement
    loan, _ = LoanApplication.objects.get_or_create(
        application_id='LN-AGRI-1001',
        defaults={
            'farmer': farmer,
            'vendor': vendor2,
            'land_acres': 5.0,
            'land_survey_number': 'SY-108/B',
            'crop_name': 'Cotton',
            'requested_amount': 150000.0,
            'eligible_amount': 150000.0,
            'pattadar_passbook_doc': 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80',
            'adangal_doc': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            'soil_health_doc': 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
            'documents_verified': True,
            'verification_status': 'Documents Verified',
            'status': 'Agreement Accepted'
        }
    )

    LoanAgreement.objects.get_or_create(
        agreement_id='AGR-LN-1001',
        defaults={
            'loan_application': loan,
            'farmer': farmer,
            'vendor': vendor2,
            'approved_amount': 150000.0,
            'interest_rate_percent': 7.0,
            'tenure_months': 6,
            'terms_text': 'Advance seasonal cultivation finance against produce pledge at APMC mandi settlement.',
            'repayment_terms': 'Settled directly from harvest sale proceeds.',
            'vendor_accepted': True,
            'farmer_accepted': True,
            'farmer_accepted_at': timezone.now(),
            'status': 'Agreement Accepted'
        }
    )

    # 9. Initial Completed Transaction
    CropTransaction.objects.get_or_create(
        transaction_id='TXN-DEMO-1001',
        defaults={
            'farmer': farmer,
            'vendor': vendor2,
            'crop_name': 'Cotton (Hybrid Shankar-6)',
            'quantity': '25 Quintals',
            'crop_picture': 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
            'purchase_amount': 182500.0,
            'payment_status': 'Payment Pending',
            'payment_date': date(2026, 9, 20),
            'payment_time': '11:30 AM',
            'payment_amount': 182500.0,
            'utr_reference': 'UTR998811223344',
            'payment_mode': 'AgriTradeX Escrow RTGS Transfer',
            'crop_purchase_receipt_picture': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            'crop_receipt_file_name': 'Cotton_APMC_Weight_Receipt.jpg',
            'payment_receipt_picture': 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80',
            'payment_receipt_file_name': 'RTGS_Bank_Transfer_Voucher.jpg'
        }
    )

    print("Successfully seeded complete Farmer and Vendor Portal records!")

if __name__ == '__main__':
    seed_all()
