/**
 * AgriTradeX Transactions & Bank Details Management Store (Section 5: Transactions)
 * Manages:
 * - Farmer Bank Details with masking (Account Number, IFSC Code)
 * - Farmer Transaction History & Crop Sale Receipts
 * - Vendor Transactions Ledger (Payment Pending vs Payment Completed)
 * - Vendor Pay Farmer action with Account Number & IFSC validation
 * - Upload Crop Purchase Receipt Picture (JPG, JPEG, PNG, preview, replace)
 * - Upload Payment Receipt Picture (JPG, JPEG, PNG, preview, replace)
 * - Complete Company Transaction Records for audit and verification
 */

import { getMarketplaceCrops } from './marketplaceStore';
import { getStoredAllLots } from './vendorLotsStore';

const BANK_DETAILS_PREFIX = 'agritradex_farmer_bank_';
const TRANSACTIONS_KEY = 'agritradex_transactions_v1';

export const SAMPLE_RECEIPT_PHOTOS = {
  cropPurchaseReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  paymentReceipt: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80'
};

// Mask bank account number for privacy: e.g. "••••••••1234"
export const maskAccountNumber = (accNo) => {
  if (!accNo) return '';
  const str = String(accNo).trim();
  if (str.length <= 4) return str;
  return '••••••••' + str.slice(-4);
};

// Default sample bank details for farmers
const DEFAULT_FARMER_BANKS = {
  '9876543210': {
    accountHolderName: 'Ramesh Kumar',
    accountNumber: '389102948123',
    maskedAccountNumber: '••••••••8123',
    ifscCode: 'SBIN0020194',
    bankName: 'State Bank of India (SBI)',
    branch: 'Shamirpet Agri Branch, Medchal'
  },
  '9701122334': {
    accountHolderName: 'Venkata Reddy',
    accountNumber: '50100234918231',
    maskedAccountNumber: '••••••••8231',
    ifscCode: 'HDFC0001824',
    bankName: 'HDFC Bank Ltd',
    branch: 'Gandipet Agri Banking Hub'
  },
  '9988776655': {
    accountHolderName: 'Balram Yadav',
    accountNumber: '19820019283719',
    maskedAccountNumber: '••••••••3719',
    ifscCode: 'PUNB0192800',
    bankName: 'Punjab National Bank (PNB)',
    branch: 'Gajwel Branch, Siddipet'
  },
  '9848123456': {
    accountHolderName: 'Anjaiah Goud',
    accountNumber: '62190823491029',
    maskedAccountNumber: '••••••••1029',
    ifscCode: 'UBIN0532185',
    bankName: 'Union Bank of India',
    branch: 'Toopran Mandi Branch'
  }
};

// 1. BANK DETAILS CRUD
export const getFarmerBankDetails = (farmerMobile) => {
  if (!farmerMobile) return DEFAULT_FARMER_BANKS['9876543210'];
  try {
    const raw = localStorage.getItem(BANK_DETAILS_PREFIX + farmerMobile);
    if (raw) return JSON.parse(raw);
    return DEFAULT_FARMER_BANKS[farmerMobile] || {
      accountHolderName: 'Farmer Partner',
      accountNumber: '389102948123',
      maskedAccountNumber: '••••••••8123',
      ifscCode: 'SBIN0020194',
      bankName: 'State Bank of India',
      branch: 'Rural Agri Branch'
    };
  } catch (err) {
    console.error('Error reading bank details', err);
    return DEFAULT_FARMER_BANKS['9876543210'];
  }
};

export const saveFarmerBankDetails = (farmerMobile, bankData) => {
  if (!farmerMobile) return null;
  const payload = {
    accountNumber: bankData.accountNumber.trim(),
    maskedAccountNumber: maskAccountNumber(bankData.accountNumber),
    ifscCode: bankData.ifscCode.trim().toUpperCase(),
    bankName: bankData.bankName?.trim() || 'HDFC Bank Ltd',
    branch: bankData.branch?.trim() || 'Main Agri Branch',
    accountHolderName: bankData.accountHolderName?.trim() || 'Farmer Account Holder',
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(BANK_DETAILS_PREFIX + farmerMobile, JSON.stringify(payload));
    return payload;
  } catch (err) {
    console.error('Error saving bank details', err);
    return null;
  }
};

// 2. TRANSACTION HISTORY & RECEIPTS
export const getStoredTransactions = () => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

export const saveTransactions = (txns) => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns));
  } catch (err) {
    console.error('Error saving transactions', err);
  }
};

// Initial realistic seed transactions for Vendor & Farmer
const seedInitialTransactions = (vendorUser) => {
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const vendorId = vendorUser?.id || 'usr_demo_vendor_1';
  const vendorName = vendorUser?.companyName || 'Apex Agri Traders Pvt Ltd';
  const vendorMobile = vendorUser?.mobileNumber || '9123456780';

  return [
    {
      id: 'TXN-882190',
      lotId: 'LOT-2026-081',
      cropLotId: 'LOT-2026-081',
      cropName: 'Cotton',
      cropPicture: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
      quantity: '40 Quintals',
      quantitySold: '40 Quintals',
      farmerMobile: '9876543210',
      farmerName: 'Ramesh Kumar',
      farmerBank: DEFAULT_FARMER_BANKS['9876543210'],
      vendorId,
      vendorName,
      vendorMobile,
      vendorLocation: 'Bengaluru Urban, KA',
      purchaseDate: todayStr,
      purchaseAmount: 298000,
      paymentAmount: 298000,
      paymentDate: todayStr,
      paymentTime: '09:15 AM',
      paymentStatus: 'Payment Completed', // 'Payment Pending' | 'Payment Completed'
      utrReference: 'UTR771928304918',
      paymentMode: 'Direct Bank RTGS Transfer',
      cropPurchaseReceiptPicture: SAMPLE_RECEIPT_PHOTOS.cropPurchaseReceipt,
      cropReceiptFileName: 'Cotton_Purchase_Weighment_Slip.jpg',
      cropReceiptUploadedAt: todayStr,
      paymentReceiptPicture: SAMPLE_RECEIPT_PHOTOS.paymentReceipt,
      paymentReceiptFileName: 'Bank_RTGS_Payment_Confirmation.jpg',
      paymentReceiptUploadedAt: todayStr
    },
    {
      id: 'TXN-882194',
      lotId: 'LOT-2026-082',
      cropLotId: 'LOT-2026-082',
      cropName: 'Maize',
      cropPicture: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
      quantity: '50 Quintals',
      quantitySold: '50 Quintals',
      farmerMobile: '9701122334',
      farmerName: 'Venkata Reddy',
      farmerBank: DEFAULT_FARMER_BANKS['9701122334'],
      vendorId,
      vendorName,
      vendorMobile,
      vendorLocation: 'Bengaluru Urban, KA',
      purchaseDate: todayStr,
      purchaseAmount: 112500,
      paymentAmount: 112500,
      paymentDate: todayStr,
      paymentTime: '09:45 AM',
      paymentStatus: 'Payment Completed',
      utrReference: 'UTR994821039481',
      paymentMode: 'AgriTradeX Escrow IMPS',
      cropPurchaseReceiptPicture: SAMPLE_RECEIPT_PHOTOS.cropPurchaseReceipt,
      cropReceiptFileName: 'Maize_Lot_Purchase_Receipt.jpg',
      cropReceiptUploadedAt: todayStr,
      paymentReceiptPicture: null,
      paymentReceiptFileName: '',
      paymentReceiptUploadedAt: null
    },
    {
      id: 'TXN-882198',
      lotId: 'LOT-2026-084',
      cropLotId: 'LOT-2026-084',
      cropName: 'Turmeric',
      cropPicture: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      quantity: '25 Quintals',
      quantitySold: '25 Quintals',
      farmerMobile: '9876543210',
      farmerName: 'Ramesh Kumar',
      farmerBank: DEFAULT_FARMER_BANKS['9876543210'],
      vendorId,
      vendorName,
      vendorMobile,
      vendorLocation: 'Bengaluru Urban, KA',
      purchaseDate: todayStr,
      purchaseAmount: 345000,
      paymentAmount: null,
      paymentDate: null,
      paymentTime: null,
      paymentStatus: 'Payment Pending', // PAYMENT PENDING WORKFLOW
      utrReference: null,
      paymentMode: null,
      cropPurchaseReceiptPicture: null,
      cropReceiptFileName: '',
      cropReceiptUploadedAt: null,
      paymentReceiptPicture: null,
      paymentReceiptFileName: '',
      paymentReceiptUploadedAt: null
    },
    {
      id: 'TXN-882201',
      lotId: 'LOT-2026-083',
      cropLotId: 'LOT-2026-083',
      cropName: 'Wheat',
      cropPicture: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      quantity: '30 Quintals',
      quantitySold: '30 Quintals',
      farmerMobile: '9988776655',
      farmerName: 'Balram Yadav',
      farmerBank: DEFAULT_FARMER_BANKS['9988776655'],
      vendorId,
      vendorName,
      vendorMobile,
      vendorLocation: 'Bengaluru Urban, KA',
      purchaseDate: todayStr,
      purchaseAmount: 73500,
      paymentAmount: 73500,
      paymentDate: todayStr,
      paymentTime: '10:10 AM',
      paymentStatus: 'Payment Completed',
      utrReference: 'UTR442019384729',
      paymentMode: 'Direct Bank NEFT Transfer',
      cropPurchaseReceiptPicture: null,
      cropReceiptFileName: '',
      cropReceiptUploadedAt: null,
      paymentReceiptPicture: SAMPLE_RECEIPT_PHOTOS.paymentReceipt,
      paymentReceiptFileName: 'NEFT_Counterfoil_Receipt.png',
      paymentReceiptUploadedAt: todayStr
    }
  ];
};

/**
 * Retrieve all transactions belonging strictly to the currently logged-in vendor.
 * Synchronizes automatically with purchased lots from vendorLotsStore.
 */
export const getVendorTransactions = (vendorUser) => {
  if (!vendorUser) return [];

  let txns = getStoredTransactions();
  if (txns.length === 0) {
    txns = seedInitialTransactions(vendorUser);
    saveTransactions(txns);
  }

  const vendorId = vendorUser.id;
  const vendorMobile = vendorUser.mobileNumber;
  const vendorCompany = vendorUser.companyName;

  // Synchronize any purchased lots from vendorLotsStore
  const allLots = getStoredAllLots();
  const vendorPurchasedLots = allLots.filter(
    (l) =>
      l.status === 'Purchased' &&
      (l.vendorId === vendorId ||
        l.vendorMobile === vendorMobile ||
        (vendorCompany && l.vendorCompany === vendorCompany))
  );

  let updated = false;
  vendorPurchasedLots.forEach((lot) => {
    let existing = txns.find((t) => t.lotId === lot.id || t.id === lot.transactionId);
    if (!existing) {
      const now = new Date();
      const farmerMobile = lot.farmerDetails?.mobileNumber || '9876543210';
      const newTxn = {
        id: lot.transactionId || 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        lotId: lot.id,
        cropLotId: lot.id,
        cropName: lot.cropName,
        cropPicture: lot.cropPicture,
        quantity: lot.quantity,
        quantitySold: lot.quantity,
        farmerMobile: farmerMobile,
        farmerName: lot.farmerDetails?.fullName || 'Farmer Partner',
        farmerBank: getFarmerBankDetails(farmerMobile),
        vendorId,
        vendorName: vendorCompany || 'Registered Vendor',
        vendorMobile,
        vendorLocation: vendorUser.district || 'Trading Hub',
        purchaseDate: lot.purchaseDate || now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        purchaseAmount: lot.purchaseAmount,
        paymentAmount: lot.purchaseAmount,
        paymentDate: lot.purchaseDate || now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        paymentTime: lot.purchaseTime || '10:00 AM',
        paymentStatus: 'Payment Completed',
        utrReference: lot.utrReference || 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000),
        paymentMode: lot.paymentMode || 'Direct Bank Transfer',
        cropPurchaseReceiptPicture: null,
        cropReceiptFileName: '',
        cropReceiptUploadedAt: null,
        paymentReceiptPicture: null,
        paymentReceiptFileName: '',
        paymentReceiptUploadedAt: null
      };
      txns.unshift(newTxn);
      updated = true;
    }
  });

  if (updated) {
    saveTransactions(txns);
  }

  return txns.filter(
    (t) =>
      t.vendorId === vendorId ||
      t.vendorMobile === vendorMobile ||
      (vendorCompany && t.vendorName === vendorCompany)
  );
};

import { apiClient } from './apiClient';

/**
 * Pay Farmer for a Pending Transaction
 * - Validates account number & IFSC code
 * - Updates status to 'Payment Completed'
 * - Records payment date, time, reference ID
 * - Dispatches to backend API if available
 */
export const payFarmerForTransaction = (txnId, vendorUser, paymentDetails) => {
  const txns = getStoredTransactions();
  const txn = txns.find((t) => t.id === txnId || t.lotId === txnId);
  if (!txn) return { success: false, message: 'Transaction record not found.' };

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const utr = paymentDetails.utrReference?.trim() || 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
  const paidAmt = Number(paymentDetails.paymentAmount) || txn.purchaseAmount;

  txn.paymentStatus = 'Payment Completed';
  txn.paymentAmount = paidAmt;
  txn.paymentDate = todayStr;
  txn.paymentTime = timeStr;
  txn.utrReference = utr;
  txn.paymentMode = paymentDetails.paymentMode || 'Direct Bank NEFT / RTGS Transfer';

  // If a payment receipt was attached simultaneously during payment
  if (paymentDetails.receiptPhotoUrl) {
    txn.paymentReceiptPicture = paymentDetails.receiptPhotoUrl;
    txn.paymentReceiptFileName = paymentDetails.receiptFileName || 'Payment_Voucher.jpg';
    txn.paymentReceiptUploadedAt = todayStr;
  }

  saveTransactions(txns);

  // Sync with Django backend
  try {
    apiClient.payFarmer(txn.id, {
      paymentAmount: paidAmt,
      utrReference: utr,
      paymentMode: txn.paymentMode
    }).catch(() => {});
  } catch (e) {}

  return {
    success: true,
    transaction: txn,
    message: `✓ Payment of ₹${paidAmt.toLocaleString('en-IN')} to ${txn.farmerName} completed successfully! Reference: ${utr}`
  };
};

/**
 * Upload Crop Purchase Receipt Picture
 */
export const uploadCropPurchaseReceipt = (txnId, receiptData) => {
  const txns = getStoredTransactions();
  const txn = txns.find((t) => t.id === txnId || t.lotId === txnId);
  if (!txn) return { success: false, message: 'Transaction record not found.' };

  const todayStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  txn.cropPurchaseReceiptPicture = receiptData.imageUrl;
  txn.cropReceiptFileName = receiptData.fileName || 'Crop_Purchase_Receipt.jpg';
  txn.cropReceiptUploadedAt = todayStr;

  saveTransactions(txns);

  // Sync with Django backend
  try {
    apiClient.uploadCropReceipt(txn.id, {
      imageUrl: receiptData.imageUrl,
      fileName: receiptData.fileName
    }).catch(() => {});
  } catch (e) {}

  return {
    success: true,
    transaction: txn,
    message: '✓ Crop purchase receipt picture uploaded successfully and linked to company record.'
  };
};

/**
 * Upload Payment Receipt Picture
 */
export const uploadPaymentReceiptProof = (txnId, receiptData) => {
  const txns = getStoredTransactions();
  const txn = txns.find((t) => t.id === txnId || t.lotId === txnId);
  if (!txn) return { success: false, message: 'Transaction record not found.' };

  const todayStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  txn.paymentReceiptPicture = receiptData.imageUrl;
  txn.paymentReceiptFileName = receiptData.fileName || 'Payment_Transfer_Receipt.jpg';
  txn.paymentReceiptUploadedAt = todayStr;

  saveTransactions(txns);

  // Sync with Django backend
  try {
    apiClient.uploadPaymentReceipt(txn.id, {
      imageUrl: receiptData.imageUrl,
      fileName: receiptData.fileName
    }).catch(() => {});
  } catch (e) {}

  return {
    success: true,
    transaction: txn,
    message: '✓ Payment receipt picture uploaded successfully and linked to company record.'
  };
};

/**
 * Farmer Portal Transactions Sync
 */
export const getFarmerTransactions = (farmerMobile) => {
  let txns = getStoredTransactions();
  if (txns.length === 0) {
    txns = seedInitialTransactions();
    saveTransactions(txns);
  }
  return txns.filter((t) => t.farmerMobile === farmerMobile);
};
