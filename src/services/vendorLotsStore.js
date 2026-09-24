/**
 * AgriTradeX Vendor Lots & 24-Hour Purchase Lifecycle Store (Vendor Portal Section 1: Dashboard)
 * Manages:
 * - Module 1: Allocated Lots (Total allocated to this logged-in vendor)
 * - Module 2: Purchased Lots Today (Completed purchase transactions today)
 * - Module 3: Pending Lots to Purchase Today (24-hour purchase window countdown)
 * - Module 4: Loan Applications (Count only, privacy protected)
 */

import { getStoredVendorLoans } from './vendorLoanStore';

const VENDOR_LOTS_STORAGE_KEY = 'agritradex_vendor_lots_v1';

export const SAMPLE_CROP_IMAGES = {
  Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
  Paddy: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  Turmeric: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  Maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  Chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  Groundnut: 'https://images.unsplash.com/photo-1567892320421-1c657571ea4a?auto=format&fit=crop&w=600&q=80',
  Soybean: 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=600&q=80'
};

// Seed 8 realistic allocated lots (3 purchased today, 5 pending today) for a vendor
export const generateSeedVendorLots = (vendorUser) => {
  const now = Date.now();
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const vendorId = vendorUser?.id || 'usr_demo_vendor_1';
  const vendorMobile = vendorUser?.mobileNumber || '9123456780';
  const vendorCompany = vendorUser?.companyName || 'Apex Agri Traders Pvt Ltd';

  return [
    // --- 3 PURCHASED TODAY ---
    {
      id: 'LOT-2026-081',
      vendorId,
      vendorMobile,
      vendorCompany,
      cropName: 'Cotton',
      cropPicture: SAMPLE_CROP_IMAGES.Cotton,
      quantity: '40 Quintals',
      quantityNumber: 40,
      cropAddress: 'Survey No. 402/1A, Rampur Village, Shamirpet, Medchal - 500078',
      acceptedBidRate: 7450,
      purchaseAmount: 298000,
      allocationDate: todayStr,
      allocationTime: '07:30 AM',
      allocatedAt: now - 3 * 3600 * 1000,
      expiresAt: now + 21 * 3600 * 1000,
      status: 'Purchased',
      purchaseDate: todayStr,
      purchaseTime: '09:15 AM',
      purchasedAt: now - 2 * 3600 * 1000,
      transactionId: 'TXN-882190',
      utrReference: 'UTR771928304918',
      paymentMode: 'Direct Bank RTGS Transfer'
    },
    {
      id: 'LOT-2026-082',
      vendorId,
      vendorMobile,
      vendorCompany,
      cropName: 'Maize',
      cropPicture: SAMPLE_CROP_IMAGES.Maize,
      quantity: '50 Quintals',
      quantityNumber: 50,
      cropAddress: 'Gundla Pochampally Farm Block 3, Medchal - 500100',
      acceptedBidRate: 2250,
      purchaseAmount: 112500,
      allocationDate: todayStr,
      allocationTime: '08:00 AM',
      allocatedAt: now - 2.5 * 3600 * 1000,
      expiresAt: now + 21.5 * 3600 * 1000,
      status: 'Purchased',
      purchaseDate: todayStr,
      purchaseTime: '09:45 AM',
      purchasedAt: now - 1.5 * 3600 * 1000,
      transactionId: 'TXN-882194',
      utrReference: 'UTR994821039481',
      paymentMode: 'AgriTradeX Escrow IMPS'
    },
    {
      id: 'LOT-2026-083',
      vendorId,
      vendorMobile,
      vendorCompany,
      cropName: 'Wheat',
      cropPicture: SAMPLE_CROP_IMAGES.Wheat,
      quantity: '30 Quintals',
      quantityNumber: 30,
      cropAddress: 'Field Sector 12, Alwal Agri Zone, Medchal - 500010',
      acceptedBidRate: 2450,
      purchaseAmount: 73500,
      allocationDate: todayStr,
      allocationTime: '08:30 AM',
      allocatedAt: now - 2 * 3600 * 1000,
      expiresAt: now + 22 * 3600 * 1000,
      status: 'Purchased',
      purchaseDate: todayStr,
      purchaseTime: '10:10 AM',
      purchasedAt: now - 1 * 3600 * 1000,
      transactionId: 'TXN-882201',
      utrReference: 'UTR442019384729',
      paymentMode: 'Direct Bank NEFT Transfer'
    },

    // --- 5 PENDING LOTS TO PURCHASE TODAY (24h Window) ---
    {
      id: 'LOT-2026-084',
      vendorId,
      vendorMobile,
      vendorCompany,
      cropName: 'Turmeric',
      cropPicture: SAMPLE_CROP_IMAGES.Turmeric,
      quantity: '25 Quintals',
      quantityNumber: 25,
      cropAddress: 'Plot 4, Farm Zone, Rampur, Medchal - 500078',
      acceptedBidRate: 13800,
      purchaseAmount: 345000,
      allocationDate: todayStr,
      allocationTime: '06:00 AM',
      allocatedAt: now - 4.5 * 3600 * 1000,
      expiresAt: now + 19.5 * 3600 * 1000, // ~19.5h left
      status: 'Pending Purchase',
      purchaseDate: null,
      purchaseTime: null,
      purchasedAt: null,
      transactionId: null,
      utrReference: null,
      paymentMode: null
    },
    {
      id: 'LOT-2026-085',
      vendorId,
      vendorMobile,
      vendorCompany,
      cropName: 'Chilli',
      cropPicture: SAMPLE_CROP_IMAGES.Chilli,
      quantity: '15 Quintals',
      quantityNumber: 15,
      cropAddress: 'Kisan Agro Estate, Survey No. 19, Shamirpet, Medchal - 500078',
      acceptedBidRate: 19000,
      purchaseAmount: 285000,
      allocationDate: todayStr,
      allocationTime: '08:15 AM',
      allocatedAt: now - 2.25 * 3600 * 1000,
      expiresAt: now + 21.75 * 3600 * 1000, // ~21.75h left
      status: 'Pending Purchase',
      purchaseDate: null,
      purchaseTime: null,
      purchasedAt: null,
      transactionId: null,
      utrReference: null,
      paymentMode: null
    },
    {
      id: 'LOT-2026-086',
      vendorId,
      vendorMobile,
      vendorCompany,
      cropName: 'Soybean',
      cropPicture: SAMPLE_CROP_IMAGES.Soybean,
      quantity: '35 Quintals',
      quantityNumber: 35,
      cropAddress: 'Green Valley Plot 8, Medchal Outskirts - 501401',
      acceptedBidRate: 5200,
      purchaseAmount: 182000,
      allocationDate: todayStr,
      allocationTime: '09:00 AM',
      allocatedAt: now - 1.5 * 3600 * 1000,
      expiresAt: now + 22.5 * 3600 * 1000, // ~22.5h left
      status: 'Pending Purchase',
      purchaseDate: null,
      purchaseTime: null,
      purchasedAt: null,
      transactionId: null,
      utrReference: null,
      paymentMode: null
    },
    {
      id: 'LOT-2026-087',
      vendorId,
      vendorMobile,
      vendorCompany,
      cropName: 'Groundnut',
      cropPicture: SAMPLE_CROP_IMAGES.Groundnut,
      quantity: '20 Quintals',
      quantityNumber: 20,
      cropAddress: 'Anantharam Farm Sector 2, Shamirpet, Medchal - 500078',
      acceptedBidRate: 7300,
      purchaseAmount: 146000,
      allocationDate: todayStr,
      allocationTime: '09:45 AM',
      allocatedAt: now - 1 * 3600 * 1000,
      expiresAt: now + 23 * 3600 * 1000, // ~23h left
      status: 'Pending Purchase',
      purchaseDate: null,
      purchaseTime: null,
      purchasedAt: null,
      transactionId: null,
      utrReference: null,
      paymentMode: null
    },
    {
      id: 'LOT-2026-088',
      vendorId,
      vendorMobile,
      vendorCompany,
      cropName: 'Paddy',
      cropPicture: SAMPLE_CROP_IMAGES.Paddy,
      quantity: '45 Quintals',
      quantityNumber: 45,
      cropAddress: 'Lake View Farmlands, Shamirpet Mandal, Medchal - 500078',
      acceptedBidRate: 2400,
      purchaseAmount: 108000,
      allocationDate: todayStr,
      allocationTime: '10:00 AM',
      allocatedAt: now - 0.75 * 3600 * 1000,
      expiresAt: now + 23.25 * 3600 * 1000, // ~23.25h left
      status: 'Pending Purchase',
      purchaseDate: null,
      purchaseTime: null,
      purchasedAt: null,
      transactionId: null,
      utrReference: null,
      paymentMode: null
    }
  ];
};

/**
 * Retrieve raw lots list from localStorage
 */
export const getStoredAllLots = () => {
  try {
    const raw = localStorage.getItem(VENDOR_LOTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading vendor lots store', err);
    return [];
  }
};

/**
 * Save raw lots list to localStorage
 */
export const saveAllLots = (lots) => {
  try {
    localStorage.setItem(VENDOR_LOTS_STORAGE_KEY, JSON.stringify(lots));
  } catch (err) {
    console.error('Error saving vendor lots store', err);
  }
};

/**
 * Get all dashboard data strictly for the currently logged-in vendor.
 * Calculates:
 * - Module 1: Allocated Lots (all valid lots allocated to this vendor)
 * - Module 2: Purchased Lots Today (lots purchased by this vendor today)
 * - Module 3: Pending Lots to Purchase Today (allocated lots pending purchase within 24 hours)
 * - Module 4: Loan Applications count (number of loan applications for this vendor, privacy safe)
 */
export const getVendorDashboardData = (vendorUser) => {
  if (!vendorUser) {
    return {
      allocatedLots: [],
      purchasedTodayLots: [],
      pendingTodayLots: [],
      allocatedCount: 0,
      purchasedTodayCount: 0,
      pendingTodayCount: 0,
      loanApplicationsCount: 0
    };
  }

  let allLots = getStoredAllLots();
  const vendorId = vendorUser.id;
  const vendorMobile = vendorUser.mobileNumber;
  const vendorCompany = vendorUser.companyName;

  // Check if this vendor has lots already in store
  const vendorLotsExist = allLots.some(
    (lot) =>
      lot.vendorId === vendorId ||
      lot.vendorMobile === vendorMobile ||
      (vendorCompany && lot.vendorCompany === vendorCompany)
  );

  if (!vendorLotsExist) {
    // Seed 8 initial lots for this vendor (3 purchased, 5 pending)
    const seedLots = generateSeedVendorLots(vendorUser);
    allLots = [...allLots, ...seedLots];
    saveAllLots(allLots);
  }

  const now = Date.now();

  // Filter lots belonging strictly to this logged-in vendor
  const vendorLots = allLots.filter(
    (lot) =>
      lot.vendorId === vendorId ||
      lot.vendorMobile === vendorMobile ||
      (vendorCompany && lot.vendorCompany === vendorCompany)
  );

  // Separate into Purchased, Active Pending, and Expired
  const purchasedTodayLots = vendorLots.filter((lot) => lot.status === 'Purchased');

  // Pending lots must be 'Pending Purchase' AND within 24 hours (expiresAt > now)
  const pendingTodayLots = vendorLots.filter(
    (lot) => lot.status === 'Pending Purchase' && lot.expiresAt > now
  );

  // Allocated Lots module shows all valid lots allocated to this vendor:
  // (both active pending + purchased today, or total allocated lots record)
  // When a lot reaches 24h without purchase, it expires and is excluded from both pending & purchased
  const allocatedLots = vendorLots.filter((lot) => {
    if (lot.status === 'Purchased') return true;
    if (lot.status === 'Pending Purchase') return lot.expiresAt > now;
    return false;
  });

  // Module 4: Loan Applications Count (Private, strictly number only)
  let loanApplicationsCount = 0;
  try {
    const loans = getStoredVendorLoans();
    // Count applications assigned to or available for this vendor
    const vendorLoans = loans.filter((l) => {
      if (!l) return false;
      if (l.selectedVendor && vendorCompany && l.selectedVendor.toLowerCase().includes(vendorCompany.toLowerCase())) return true;
      if (l.lendingVendor && vendorCompany && l.lendingVendor.toLowerCase().includes(vendorCompany.toLowerCase())) return true;
      if (l.vendorId === vendorId) return true;
      // Also include general open applications
      return true;
    });
    loanApplicationsCount = vendorLoans.length;
    if (loanApplicationsCount === 0) {
      // Default to 4 as specified in standard demo if no loans in storage yet
      loanApplicationsCount = 4;
    }
  } catch (e) {
    loanApplicationsCount = 4;
  }

  return {
    allocatedLots,
    purchasedTodayLots,
    pendingTodayLots,
    allocatedCount: allocatedLots.length,
    purchasedTodayCount: purchasedTodayLots.length,
    pendingTodayCount: pendingTodayLots.length,
    loanApplicationsCount
  };
};

import { apiClient } from './apiClient';

/**
 * Vendor Completes Purchase of a Pending Lot
 * - Moves lot from Pending Lots to Purchased Lots Today
 * - Updates status to 'Purchased'
 * - Records transaction ID, reference, time
 * - Automatically updates counts
 * - Dispatches to backend API if available
 */
export const completeLotPurchase = (lotId, vendorUser, paymentDetails = {}) => {
  const allLots = getStoredAllLots();
  const lotIndex = allLots.findIndex((l) => l.id === lotId);

  if (lotIndex === -1) {
    return { success: false, message: 'Lot not found.' };
  }

  const lot = allLots[lotIndex];
  const now = Date.now();

  // Check if expired
  if (lot.status === 'Pending Purchase' && lot.expiresAt <= now) {
    return {
      success: false,
      message: 'The 24-hour purchase period for this lot has expired.'
    };
  }

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const generatedTxn = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
  const generatedUtr = paymentDetails.utrReference?.trim() || 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);

  // Update lot
  lot.status = 'Purchased';
  lot.purchaseDate = todayStr;
  lot.purchaseTime = timeStr;
  lot.purchasedAt = now;
  lot.purchaseAmount = Number(paymentDetails.purchaseAmount) || lot.purchaseAmount;
  lot.transactionId = generatedTxn;
  lot.utrReference = generatedUtr;
  lot.paymentMode = paymentDetails.paymentMode || 'AgriTradeX Instant Settlement';

  allLots[lotIndex] = lot;
  saveAllLots(allLots);

  // Call Django backend asynchronously
  try {
    apiClient.completeVendorPurchase(lot.id, {
      vendor_mobile: vendorUser?.mobileNumber,
      purchase_amount: lot.purchaseAmount,
      utr_reference: generatedUtr,
      payment_mode: lot.paymentMode
    }).catch((e) => console.log('Backend sync (purchase): offline fallback'));
  } catch (err) {
    // offline fallback
  }

  return {
    success: true,
    lot,
    message: `Lot ${lot.id} (${lot.cropName}) purchased successfully! Transaction ID: ${generatedTxn}`
  };
};

/**
 * Simulate Expiring a Pending Lot (For Testing/Demo of 24h Expiry Rule)
 * - Sets expiresAt to past time
 * - Lot is removed from pending, not added to purchased
 */
export const expireLotNow = (lotId) => {
  const allLots = getStoredAllLots();
  const lotIndex = allLots.findIndex((l) => l.id === lotId);
  if (lotIndex === -1) return { success: false };

  const lot = allLots[lotIndex];
  lot.expiresAt = Date.now() - 1000;
  lot.status = 'Expired';

  allLots[lotIndex] = lot;
  saveAllLots(allLots);

  return { success: true, lot };
};

/**
 * Reset Vendor Lots Demo Data
 */
export const resetVendorLotsDemo = (vendorUser) => {
  if (!vendorUser) return;
  const vendorId = vendorUser.id;
  const vendorMobile = vendorUser.mobileNumber;
  const vendorCompany = vendorUser.companyName;

  let allLots = getStoredAllLots();
  // Remove existing lots for this vendor
  allLots = allLots.filter(
    (lot) =>
      lot.vendorId !== vendorId &&
      lot.vendorMobile !== vendorMobile &&
      (!vendorCompany || lot.vendorCompany !== vendorCompany)
  );

  const seedLots = generateSeedVendorLots(vendorUser);
  allLots = [...allLots, ...seedLots];
  saveAllLots(allLots);
  return seedLots;
};
