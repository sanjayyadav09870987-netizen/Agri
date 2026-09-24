/**
 * AgriTradeX Unified Backend API Client
 * Connects frontend to Django REST Framework backend at http://127.0.0.1:8000/api/
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const apiClient = {
  // Authentication & Bank
  async requestOTP(mobileNumber, role = 'farmer') {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobileNumber, role })
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback:', e);
      return { success: true, message: 'OTP sent (Offline mode)', dev_otp: '123456' };
    }
  },

  async verifyOTP(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: payload.mobileNumber,
          otp: payload.otp,
          role: payload.role || 'farmer',
          full_name: payload.fullName,
          state: payload.state,
          district: payload.district,
          mandal: payload.mandal,
          village: payload.village,
          pincode: payload.pincode,
          land_acres: payload.landAcres,
          land_survey_number: payload.landSurveyNumber,
          company_name: payload.companyName
        })
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback:', e);
      return { success: true, user: payload };
    }
  },

  async getFarmerBankDetails(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/bank-details/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch bank');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async updateFarmerBankDetails(mobileNumber, bankData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/bank-details/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          account_holder_name: bankData.accountHolderName,
          account_number: bankData.accountNumber,
          ifsc_code: bankData.ifscCode,
          bank_name: bankData.bankName,
          branch_name: bankData.branchName
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // Farmer Cultivated Crops
  async getFarmerCrops(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/farmer/crops/list/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch crops');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async addFarmerCrop(mobileNumber, cropData) {
    try {
      const res = await fetch(`${API_BASE_URL}/farmer/crops/list/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          crop_name: cropData.cropName,
          category: cropData.category,
          variety: cropData.variety,
          acres_allocated: cropData.acresAllocated,
          sowing_date: cropData.sowingDate,
          expected_harvest_date: cropData.expectedHarvestDate,
          estimated_yield_quintals: cropData.estimatedYieldQuintals,
          photo_url: cropData.photoUrl,
          crop_address: cropData.cropAddress,
          stage: cropData.stage,
          status: cropData.status || 'Active'
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async addCropProgressLog(cropId, logData) {
    try {
      const res = await fetch(`${API_BASE_URL}/farmer/crops/${cropId}/progress-log/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage_title: logData.stage,
          note: logData.note,
          photo_url: logData.photoUrl
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // 30-Day Market Price Trends
  async getMarketPriceTrend(cropName = 'Cotton') {
    try {
      const res = await fetch(`${API_BASE_URL}/farmer/crops/price-trend/?crop_name=${encodeURIComponent(cropName)}&days=30`);
      if (!res.ok) throw new Error('Failed to fetch trend');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Farmer Sell Crop & Bidding
  async getFarmerLots(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/farmer/lots/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch lots');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async pushCropForBidding(mobileNumber, lotData) {
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/farmer/lots/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          crop_name: lotData.cropName,
          quantity: lotData.quantity,
          quantity_number: lotData.quantityNumber,
          base_price: lotData.basePrice,
          photo_url: lotData.cropPhotos?.[0],
          crop_address: lotData.cropAddress
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async acceptBid(lotId) {
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/farmer/lots/${lotId}/accept-bid/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async rejectBid(lotId) {
    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/farmer/lots/${lotId}/reject-bid/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // Farmer Loans
  async getFarmerLoanStatus(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/loans/farmer/status/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch loan status');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async applyFarmerLoan(mobileNumber, loanData) {
    try {
      const res = await fetch(`${API_BASE_URL}/loans/farmer/apply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          land_acres: loanData.landAcres,
          land_survey_number: loanData.landSurveyNumber,
          crop_name: loanData.cropName,
          requested_amount: loanData.requestedAmount,
          pattadar_passbook_doc: loanData.pattadarPassbookDoc,
          adangal_doc: loanData.adangalDoc,
          soil_health_doc: loanData.soilHealthDoc
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async acceptLoanAgreement(applicationId) {
    try {
      const res = await fetch(`${API_BASE_URL}/loans/farmer/${applicationId}/accept-agreement/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // Farmer & Vendor Transactions
  async getFarmerTransactions(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/farmer/list/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch txns');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getVendorTransactions(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/vendor/list/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch txns');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async payFarmer(txnId, paymentDetails) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${txnId}/pay-farmer/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_amount: paymentDetails.paymentAmount,
          utr_reference: paymentDetails.utrReference,
          payment_mode: paymentDetails.paymentMode
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async uploadCropReceipt(txnId, receiptData) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${txnId}/upload-crop-receipt/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: receiptData.imageUrl,
          file_name: receiptData.fileName
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async uploadPaymentReceipt(txnId, receiptData) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${txnId}/upload-payment-receipt/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: receiptData.imageUrl,
          file_name: receiptData.fileName
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // ==========================================================================
  // VENDOR PORTAL APIS (SECTIONS 1, 2, 3, 4, 5)
  // ==========================================================================

  // Section 1: Dashboard
  async getVendorDashboard(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/dashboard/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch vendor dashboard');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Section 2: Buying Preferences
  async getVendorPreferences(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/preferences/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch vendor preferences');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async saveVendorPreferences(mobileNumber, prefsData) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/preferences/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          max_distance_km: prefsData.maxDistanceKm,
          selected_crops: prefsData.selectedCrops,
          min_quantity_quintals: prefsData.minQuantityQuintals,
          max_quantity_quintals: prefsData.maxQuantityQuintals
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // Section 3: Bidding
  async getVendorMatchingBiddingLots(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/bidding/matching-lots/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch matching lots');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async placeVendorBid(mobileNumber, lotId, bidAmount) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/bidding/place-bid/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          lot_id: lotId,
          bid_amount: bidAmount
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async completeVendorPurchase(lotId, payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/lots/${lotId}/purchase/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // Section 4: Crop Finance Hub
  async getVendorLoanApplications(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/loans/applications/?mobile_number=${mobileNumber}`);
      if (!res.ok) throw new Error('Failed to fetch vendor loan applications');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async verifyVendorLoanDocuments(applicationId, verificationStatus) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/loans/${applicationId}/verify-documents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_status: verificationStatus
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async reviewVendorLoan(applicationId, payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/loans/${applicationId}/review/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async disburseVendorLoan(applicationId, utr) {
    try {
      const res = await fetch(`${API_BASE_URL}/vendor/loans/${applicationId}/disburse/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disbursal_utr: utr
        })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }
};

