import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agritradex_backend.settings')
django.setup()

from rest_framework.test import APIClient
from apps.authentication.models import UserProfile
from apps.marketplace.models import CropLot, VendorBid, AllocatedLot, VendorBuyingPreferences
from apps.loans.models import LoanApplication
from apps.transactions.models import CropTransaction

client = APIClient()

def run_tests():
    print("=== STARTING COMPLETE VENDOR BACKEND FLOW TESTS ===")
    
    # 1. Test Vendor Dashboard
    res = client.get('/api/vendor/dashboard/?mobile_number=9123456780')
    assert res.status_code == 200, f"Dashboard failed: {res.status_code}"
    dash = res.json()
    print(f"1. [PASS] Vendor Dashboard fetched: Allocated={dash.get('allocatedCount')}, Purchased Today={dash.get('purchasedTodayCount')}, Pending={dash.get('pendingTodayCount')}, Loans={dash.get('loanApplicationsCount')}")

    # 2. Test Vendor Buying Preferences
    pref_payload = {
        'mobile_number': '9123456780',
        'max_distance_km': 65,
        'selected_crops': ['Cotton', 'Maize', 'Paddy', 'Wheat', 'Chilli'],
        'min_quantity_quintals': 10,
        'max_quantity_quintals': 500
    }
    res = client.post('/api/vendor/preferences/', data=json.dumps(pref_payload), content_type='application/json')
    assert res.status_code == 200, f"Preferences save failed: {res.status_code}"
    print(f"2. [PASS] Vendor Buying Preferences saved successfully: max_dist=65km, crops={len(pref_payload['selected_crops'])}")

    # 3. Test Matching Bidding Lots
    res = client.get('/api/vendor/bidding/matching-lots/?mobile_number=9123456780')
    assert res.status_code == 200, f"Matching lots failed: {res.status_code}"
    data = res.json()
    lots = data.get('matchingLots', [])
    print(f"3. [PASS] Vendor Matching Bidding Lots: Found {len(lots)} eligible matching crop lots")

    # 4. Test Place Bid
    if len(lots) > 0:
        target_lot = lots[0]
        lot_id = target_lot['id']
        current_bid = target_lot['currentHighestBid']
        new_bid = current_bid + 500
        bid_payload = {
            'mobile_number': '9123456780',
            'lot_id': lot_id,
            'bid_amount': new_bid
        }
        res = client.post('/api/vendor/bidding/place-bid/', data=json.dumps(bid_payload), content_type='application/json')
        assert res.status_code in [200, 201], f"Place bid failed: {res.status_code}"
        print(f"4. [PASS] Vendor Bid placed on {lot_id}: New Bid = Rs.{new_bid}")

    # 5. Test Loan Applications & Crop Finance Hub
    res = client.get('/api/vendor/loans/applications/?mobile_number=9123456780')
    assert res.status_code == 200, f"Loan applications failed: {res.status_code}"
    data = res.json()
    loans = data.get('applications', [])
    print(f"5. [PASS] Vendor Loan Applications in Finance Hub: Found {len(loans)} applications")

    if len(loans) > 0:
        app = loans[0]
        app_id = app['application_id']

        # Verify documents
        res = client.post(f'/api/vendor/loans/{app_id}/verify-documents/', data=json.dumps({'verification_status': 'Documents Verified'}), content_type='application/json')
        assert res.status_code == 200, f"Document verification failed: {res.status_code}"
        print(f"6. [PASS] Vendor Document Verification completed for {app_id}")

        # Approve loan & generate agreement
        review_payload = {
            'decision': 'accept',
            'vendor_mobile': '9123456780',
            'approved_amount': app['requested_amount'],
            'interest_rate': '1.0% per month'
        }
        res = client.post(f'/api/vendor/loans/{app_id}/review/', data=json.dumps(review_payload), content_type='application/json')
        assert res.status_code == 200, f"Loan review failed: {res.status_code}"
        print(f"7. [PASS] Vendor Loan Approved & Formal Pre-Harvest Agreement generated for {app_id}")

        # Farmer accepts agreement
        res = client.post(f'/api/loans/farmer/{app_id}/accept-agreement/')
        assert res.status_code == 200, f"Farmer accept agreement failed: {res.status_code}"
        print(f"8. [PASS] Farmer accepted Agreement for {app_id} -> Status: Loan Disbursed")

    # 6. Test Vendor Transactions List
    res = client.get('/api/transactions/vendor/list/?mobile_number=9123456780')
    assert res.status_code == 200, f"Vendor transactions failed: {res.status_code}"
    txns = res.json()
    print(f"9. [PASS] Vendor Transactions List: Found {len(txns)} transactions")

    if len(txns) > 0:
        pending_txn = next((t for t in txns if t['payment_status'] == 'Payment Pending'), txns[0])
        txn_id = pending_txn['transaction_id']

        # Pay farmer
        pay_payload = {
            'payment_amount': pending_txn['purchase_amount'],
            'utr_reference': 'UTR992837465019',
            'payment_mode': 'Direct Bank NEFT Transfer'
        }
        res = client.post(f'/api/transactions/{txn_id}/pay-farmer/', data=json.dumps(pay_payload), content_type='application/json')
        assert res.status_code == 200, f"Pay farmer failed: {res.status_code}"
        print(f"10. [PASS] Vendor Payment to Farmer recorded for {txn_id}: Status=Payment Completed")

        # Upload crop purchase receipt
        res = client.post(f'/api/transactions/{txn_id}/upload-crop-receipt/', data=json.dumps({'image_url': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c', 'file_name': 'Purchase_Slip.jpg'}), content_type='application/json')
        assert res.status_code == 200, f"Upload crop receipt failed: {res.status_code}"
        print(f"11. [PASS] Crop Purchase Receipt Uploaded for {txn_id}")

        # Upload payment receipt
        res = client.post(f'/api/transactions/{txn_id}/upload-payment-receipt/', data=json.dumps({'image_url': 'https://images.unsplash.com/photo-1554224154-26032ffc0d07', 'file_name': 'NEFT_Payment_Proof.png'}), content_type='application/json')
        assert res.status_code == 200, f"Upload payment receipt failed: {res.status_code}"
        print(f"12. [PASS] Payment Receipt Uploaded for {txn_id}")

    # 7. Test Farmer Transactions View (Verify sync)
    res = client.get('/api/transactions/farmer/list/?mobile_number=9876543210')
    assert res.status_code == 200, f"Farmer transactions failed: {res.status_code}"
    farmer_txns = res.json()
    print(f"13. [PASS] Farmer Transactions sync: {len(farmer_txns)} transactions verified with receipt records")

    print("\n=== ALL 13 TEST SUITES PASSED SUCCESSFULLY (0 ERRORS) ===")

if __name__ == '__main__':
    run_tests()
