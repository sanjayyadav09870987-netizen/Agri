/**
 * AgriTradeX Vendor Buying Preferences & Bidding Matching Service
 * Manages:
 * - Section 2: Buying Preferences (Distance Range 0-100km, Crop Types, Quantity Range Min-Max)
 * - Section 3: Bidding (Matching eligible farmer lots based on saved preferences)
 * - Bid placement & Farmer Accept/Reject lifecycle
 * - Privacy protection for farmer credentials
 * - In-app Notifications
 */

import { getMarketplaceCrops, saveMarketplaceCrops, SAMPLE_CROP_IMAGES } from './marketplaceStore';
import { getStoredAllLots, saveAllLots } from './vendorLotsStore';
import { apiClient } from './apiClient';

const PREFERENCES_STORAGE_PREFIX = 'agritradex_vendor_prefs_';
const NOTIFICATIONS_STORAGE_PREFIX = 'agritradex_vendor_notifs_';

export const AVAILABLE_CROP_TYPES = [
  { id: 'Rice', name: 'Rice / Paddy', synonyms: ['Rice', 'Paddy'], icon: '🌾' },
  { id: 'Cotton', name: 'Cotton', synonyms: ['Cotton'], icon: '☁️' },
  { id: 'Maize', name: 'Maize / Corn', synonyms: ['Maize', 'Corn'], icon: '🌽' },
  { id: 'Wheat', name: 'Wheat', synonyms: ['Wheat'], icon: '🌾' },
  { id: 'Chilli', name: 'Chilli', synonyms: ['Chilli', 'Red Chilli'], icon: '🌶️' },
  { id: 'Groundnut', name: 'Groundnut / Peanut', synonyms: ['Groundnut', 'Peanut'], icon: '🥜' },
  { id: 'Sugarcane', name: 'Sugarcane', synonyms: ['Sugarcane'], icon: '🎋' },
  { id: 'Turmeric', name: 'Turmeric', synonyms: ['Turmeric'], icon: '🟡' },
  { id: 'Soybean', name: 'Soybean', synonyms: ['Soybean', 'Soya'], icon: '🌱' },
  { id: 'Tomato', name: 'Tomato', synonyms: ['Tomato'], icon: '🍅' }
];

// Rich set of seed crops with diverse distances, crops, and quantities for matching
export const SEED_BIDDING_CROPS = [
  {
    id: 'LOT-CROP-101',
    farmerMobile: '9876543210',
    farmerDetails: {
      fullName: 'Ramesh Kumar',
      mobileNumber: '9876543210',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      landSurveyNumber: 'SY-402/1A',
      village: 'Rampur',
      mandal: 'Shamirpet',
      district: 'Medchal',
      pincode: '500078'
    },
    cropName: 'Cotton',
    quantity: '40 Quintals (4,000 kg)',
    quantityKg: 4000,
    quantityNumber: 40,
    cropPhotos: [SAMPLE_CROP_IMAGES.Cotton],
    cropAddress: 'Survey No. 402/1A, Rampur Village, Shamirpet, Medchal - 500078',
    distanceKm: 18,
    basePrice: 7000,
    currentHighestBid: 7450,
    createdAt: Date.now() - (5 * 3600 * 1000),
    expiresAt: Date.now() + (19 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  },
  {
    id: 'LOT-CROP-102',
    farmerMobile: '9876543210',
    farmerDetails: {
      fullName: 'Ramesh Kumar',
      mobileNumber: '9876543210',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
      landSurveyNumber: 'SY-402/1B',
      village: 'Rampur',
      mandal: 'Shamirpet',
      district: 'Medchal',
      pincode: '500078'
    },
    cropName: 'Turmeric',
    quantity: '25 Quintals (2,500 kg)',
    quantityKg: 2500,
    quantityNumber: 25,
    cropPhotos: [SAMPLE_CROP_IMAGES.Turmeric],
    cropAddress: 'Plot 4, Farm Zone, Rampur, Medchal - 500078',
    distanceKm: 22,
    basePrice: 12500,
    currentHighestBid: 13800,
    createdAt: Date.now() - (3 * 3600 * 1000),
    expiresAt: Date.now() + (21 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  },
  {
    id: 'LOT-CROP-103',
    farmerMobile: '9999999999',
    farmerDetails: {
      fullName: 'Kisan Demo Farmer',
      mobileNumber: '9999999999',
      aadhaarNumber: '987654321098',
      panNumber: 'FGHIJ5678K',
      landSurveyNumber: 'SY-108/3C',
      village: 'Kazipet',
      mandal: 'Hanamkonda',
      district: 'Warangal',
      pincode: '506004'
    },
    cropName: 'Rice',
    quantity: '50 Quintals (5,000 kg)',
    quantityKg: 5000,
    quantityNumber: 50,
    cropPhotos: [SAMPLE_CROP_IMAGES.Paddy],
    cropAddress: 'Farm Gate 3, Kazipet Village, Warangal - 506004',
    distanceKm: 35,
    basePrice: 2200,
    currentHighestBid: 2450,
    createdAt: Date.now() - (2 * 3600 * 1000),
    expiresAt: Date.now() + (22 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  },
  {
    id: 'LOT-CROP-104',
    farmerMobile: '9701122334',
    farmerDetails: {
      fullName: 'Venkata Reddy',
      mobileNumber: '9701122334',
      aadhaarNumber: '334455667788',
      panNumber: 'JKLMN9012P',
      landSurveyNumber: 'SY-204/B',
      village: 'Narsingi',
      mandal: 'Gandipet',
      district: 'Rangareddy',
      pincode: '500075'
    },
    cropName: 'Maize',
    quantity: '30 Quintals (3,000 kg)',
    quantityKg: 3000,
    quantityNumber: 30,
    cropPhotos: [SAMPLE_CROP_IMAGES.Maize],
    cropAddress: 'Survey 204/B, Narsingi Farm Belt, Rangareddy - 500075',
    distanceKm: 28,
    basePrice: 2100,
    currentHighestBid: 2300,
    createdAt: Date.now() - (4 * 3600 * 1000),
    expiresAt: Date.now() + (20 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  },
  {
    id: 'LOT-CROP-105',
    farmerMobile: '9848123456',
    farmerDetails: {
      fullName: 'Anjaiah Goud',
      mobileNumber: '9848123456',
      aadhaarNumber: '556677889900',
      panNumber: 'MNOPQ3456R',
      landSurveyNumber: 'SY-88/2',
      village: 'Toopran',
      mandal: 'Toopran',
      district: 'Medak',
      pincode: '502334'
    },
    cropName: 'Chilli',
    quantity: '15 Quintals (1,500 kg)',
    quantityKg: 1500,
    quantityNumber: 15,
    cropPhotos: [SAMPLE_CROP_IMAGES.Chilli],
    cropAddress: 'Plot 12, Agro Hub, Toopran, Medak - 502334',
    distanceKm: 48,
    basePrice: 18500,
    currentHighestBid: 19400,
    createdAt: Date.now() - (6 * 3600 * 1000),
    expiresAt: Date.now() + (18 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  },
  {
    id: 'LOT-CROP-106',
    farmerMobile: '9988776655',
    farmerDetails: {
      fullName: 'Balram Yadav',
      mobileNumber: '9988776655',
      aadhaarNumber: '778899001122',
      panNumber: 'QRSTU7890S',
      landSurveyNumber: 'SY-315/1',
      village: 'Gajwel',
      mandal: 'Gajwel',
      district: 'Siddipet',
      pincode: '502278'
    },
    cropName: 'Wheat',
    quantity: '35 Quintals (3,500 kg)',
    quantityKg: 3500,
    quantityNumber: 35,
    cropPhotos: [SAMPLE_CROP_IMAGES.Wheat],
    cropAddress: 'Field 9, Gajwel Agri Center, Siddipet - 502278',
    distanceKm: 62,
    basePrice: 2400,
    currentHighestBid: 2550,
    createdAt: Date.now() - (7 * 3600 * 1000),
    expiresAt: Date.now() + (17 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  },
  {
    id: 'LOT-CROP-107',
    farmerMobile: '9677889900',
    farmerDetails: {
      fullName: 'Srinivas Rao',
      mobileNumber: '9677889900',
      aadhaarNumber: '889900112233',
      panNumber: 'UVWXY1234T',
      landSurveyNumber: 'SY-51/A',
      village: 'Kothur',
      mandal: 'Shadnagar',
      district: 'Rangareddy',
      pincode: '509228'
    },
    cropName: 'Groundnut',
    quantity: '20 Quintals (2,000 kg)',
    quantityKg: 2000,
    quantityNumber: 20,
    cropPhotos: [SAMPLE_CROP_IMAGES.Groundnut],
    cropAddress: 'Kothur Farmland Block 5, Rangareddy - 509228',
    distanceKm: 42,
    basePrice: 7100,
    currentHighestBid: 7350,
    createdAt: Date.now() - (8 * 3600 * 1000),
    expiresAt: Date.now() + (16 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  },
  {
    id: 'LOT-CROP-108',
    farmerMobile: '9122334455',
    farmerDetails: {
      fullName: 'Gopal Reddy',
      mobileNumber: '9122334455',
      aadhaarNumber: '990011223344',
      panNumber: 'WXYZ12345U',
      landSurveyNumber: 'SY-112/3',
      village: 'Zaheerabad',
      mandal: 'Zaheerabad',
      district: 'Sangareddy',
      pincode: '502220'
    },
    cropName: 'Sugarcane',
    quantity: '80 Quintals (8,000 kg)',
    quantityKg: 8000,
    quantityNumber: 80,
    cropPhotos: ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80'],
    cropAddress: 'Sugar Valley Plot 7, Zaheerabad, Sangareddy - 502220',
    distanceKm: 82,
    basePrice: 3200,
    currentHighestBid: 3400,
    createdAt: Date.now() - (9 * 3600 * 1000),
    expiresAt: Date.now() + (15 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  },
  {
    id: 'LOT-CROP-109',
    farmerMobile: '9344556677',
    farmerDetails: {
      fullName: 'Laxman Nayak',
      mobileNumber: '9344556677',
      aadhaarNumber: '112233445566',
      panNumber: 'XYZAB5678V',
      landSurveyNumber: 'SY-77/4',
      village: 'Narsapur',
      mandal: 'Narsapur',
      district: 'Medak',
      pincode: '502313'
    },
    cropName: 'Soybean',
    quantity: '30 Quintals (3,000 kg)',
    quantityKg: 3000,
    quantityNumber: 30,
    cropPhotos: [SAMPLE_CROP_IMAGES.Soybean],
    cropAddress: 'Forest Agro Belt, Narsapur, Medak - 502313',
    distanceKm: 55,
    basePrice: 5100,
    currentHighestBid: 5300,
    createdAt: Date.now() - (10 * 3600 * 1000),
    expiresAt: Date.now() + (14 * 3600 * 1000),
    status: 'Bidding Active',
    bidsList: []
  }
];

/**
 * Get vendor preferences key
 */
const getPrefKey = (vendorUser) => {
  const id = vendorUser?.id || vendorUser?.mobileNumber || 'default_vendor';
  return PREFERENCES_STORAGE_PREFIX + id;
};

const getNotifKey = (vendorUser) => {
  const id = vendorUser?.id || vendorUser?.mobileNumber || 'default_vendor';
  return NOTIFICATIONS_STORAGE_PREFIX + id;
};

/**
 * Get stored buying preferences for logged-in vendor
 */
export const getVendorBuyingPreferences = (vendorUser) => {
  if (!vendorUser) return null;
  try {
    const raw = localStorage.getItem(getPrefKey(vendorUser));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error reading vendor preferences', e);
    return null;
  }
};

/**
 * Check if vendor has already saved preferences
 */
export const hasVendorSetPreferences = (vendorUser) => {
  const prefs = getVendorBuyingPreferences(vendorUser);
  if (!prefs) return false;
  return (
    Number(prefs.maxDistanceKm) > 0 &&
    Array.isArray(prefs.selectedCropTypes) &&
    prefs.selectedCropTypes.length > 0 &&
    Number(prefs.minQuantityKg) > 0 &&
    Number(prefs.maxQuantityKg) > Number(prefs.minQuantityKg)
  );
};

/**
 * Save buying preferences for logged-in vendor
 */
export const saveVendorBuyingPreferences = (vendorUser, preferences) => {
  if (!vendorUser) return { success: false, message: 'Vendor session not found.' };

  const maxDistance = Number(preferences.maxDistanceKm);
  const selectedCrops = Array.isArray(preferences.selectedCropTypes) ? preferences.selectedCropTypes : [];
  const minQty = Number(preferences.minQuantityKg);
  const maxQty = Number(preferences.maxQuantityKg);

  // Validation
  if (isNaN(maxDistance) || maxDistance <= 0 || maxDistance > 100) {
    return {
      success: false,
      message: 'Please select a valid maximum buying distance between 1 km and 100 km.'
    };
  }

  if (selectedCrops.length === 0) {
    return {
      success: false,
      message: 'Please select at least one crop type preference.'
    };
  }

  if (isNaN(minQty) || minQty <= 0) {
    return {
      success: false,
      message: 'Minimum quantity must be greater than 0 kg.'
    };
  }

  if (isNaN(maxQty) || maxQty <= minQty) {
    return {
      success: false,
      message: `Maximum quantity (${maxQty} kg) must be strictly greater than minimum quantity (${minQty} kg).`
    };
  }

  const payload = {
    maxDistanceKm: maxDistance,
    selectedCropTypes: selectedCrops,
    minQuantityKg: minQty,
    maxQuantityKg: maxQty,
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(getPrefKey(vendorUser), JSON.stringify(payload));
    
    // Background sync to Django Backend
    if (vendorUser.mobileNumber) {
      apiClient.saveVendorPreferences(vendorUser.mobileNumber, {
        maxDistanceKm: maxDistance,
        selectedCrops: selectedCrops,
        minQuantityQuintals: minQty / 100,
        maxQuantityQuintals: maxQty / 100
      }).catch((err) => console.warn('Backend preferences sync notice:', err));
    }

    return { success: true, preferences: payload };
  } catch (e) {
    return { success: false, message: 'Failed to save preferences to local storage.' };
  }
};

/**
 * Helper to normalize crop name matching
 */
const cropMatches = (cropName, selectedCropTypes) => {
  if (!cropName || !Array.isArray(selectedCropTypes)) return false;
  const cn = cropName.toLowerCase().trim();

  return selectedCropTypes.some((selected) => {
    const s = selected.toLowerCase().trim();
    if (cn === s) return true;
    if (cn.includes(s) || s.includes(cn)) return true;
    // Rice / Paddy synonym
    if ((cn === 'rice' || cn === 'paddy') && (s === 'rice' || s === 'paddy')) return true;
    // Maize / Corn synonym
    if ((cn === 'maize' || cn === 'corn') && (s === 'maize' || s === 'corn')) return true;
    return false;
  });
};

/**
 * Retrieve eligible crop lots matching vendor's saved preferences
 * Strictly hides sensitive farmer details (Aadhaar, PAN, Bank, Mobile) before bid acceptance!
 */
export const getMatchingBiddingLots = (vendorUser, preferences) => {
  if (!preferences) return [];

  // Sync / get crops from marketplaceStore
  let marketplaceCrops = getMarketplaceCrops();

  // Merge seed bidding crops if marketplace crops don't have enough diverse demo items
  const now = Date.now();
  let merged = [...marketplaceCrops];
  SEED_BIDDING_CROPS.forEach((seed) => {
    if (!merged.some((c) => c.id === seed.id || c.cropName === seed.cropName)) {
      merged.push(seed);
    }
  });

  const { maxDistanceKm, selectedCropTypes, minQuantityKg, maxQuantityKg } = preferences;

  const vendorId = vendorUser?.id;
  const vendorCompany = vendorUser?.companyName;
  const vendorMobile = vendorUser?.mobileNumber;

  const eligibleLots = [];

  merged.forEach((crop) => {
    // 1. Distance filter: crop distance <= maxDistanceKm
    const dist = crop.distanceKm !== undefined ? crop.distanceKm : 25;
    if (dist > maxDistanceKm) return;

    // 2. Crop Type filter: cropName in selectedCropTypes
    if (!cropMatches(crop.cropName, selectedCropTypes)) return;

    // 3. Quantity filter: quantityKg between minQuantityKg and maxQuantityKg
    const qtyKg = crop.quantityKg || (crop.quantityNumber ? crop.quantityNumber * 100 : 1000);
    if (qtyKg < minQuantityKg || qtyKg > maxQuantityKg) return;

    // Check if this vendor has placed a bid on this lot
    const myBid = crop.bidsList?.find(
      (b) =>
        b.vendorId === vendorId ||
        b.vendorMobile === vendorMobile ||
        (vendorCompany && b.vendorCompany === vendorCompany)
    );

    const isWinningVendorAndAccepted =
      crop.status === 'Bid Accepted' &&
      crop.winningVendor &&
      (crop.winningVendor.vendorId === vendorId ||
        crop.winningVendor.vendorMobile === vendorMobile ||
        crop.winningVendor.vendorCompany === vendorCompany);

    const isRejectedForMe =
      crop.status === 'Bid Rejected' &&
      crop.rejectedVendorId === vendorId;

    // Create privacy-protected crop lot object
    const lotObj = {
      id: crop.id,
      cropName: crop.cropName,
      cropPicture: crop.cropPhotos?.[0] || crop.cropPicture || SAMPLE_CROP_IMAGES[crop.cropName] || SAMPLE_CROP_IMAGES.Paddy,
      quantity: crop.quantity || `${crop.quantityNumber || 10} Quintals (${qtyKg.toLocaleString('en-IN')} kg)`,
      quantityKg: qtyKg,
      quantityNumber: crop.quantityNumber || Math.round(qtyKg / 100),
      cropAddress: crop.cropAddress || 'Agri Farmland, Shamirpet, Medchal',
      distanceKm: dist,
      basePrice: crop.basePrice || 2500,
      currentHighestBid: crop.currentHighestBid || crop.basePrice || 2500,
      status: crop.status || 'Bidding Active',
      expiresAt: crop.expiresAt || (now + 18 * 3600 * 1000),
      durationMs: crop.durationMs || (24 * 3600 * 1000),
      totalBidsCount: crop.bidsList?.length || 0,
      myBid: myBid || null,
      isMyBidAccepted: isWinningVendorAndAccepted,
      isMyBidRejected: isRejectedForMe,
      // PRIVACY RULE: Before farmer accepts vendor bid, protect sensitive details
      hasFarmerDetailsAccess: Boolean(isWinningVendorAndAccepted),
      farmerDetails: isWinningVendorAndAccepted ? crop.farmerDetails : null,
      farmerMobile: isWinningVendorAndAccepted ? crop.farmerMobile : null
    };

    eligibleLots.push(lotObj);
  });

  return eligibleLots;
};

/**
 * Place a Vendor Bid on a Lot
 */
export const placeBidOnMatchingLot = (cropId, vendorUser, bidAmountPerQuintal) => {
  let marketplaceCrops = getMarketplaceCrops();
  let crop = marketplaceCrops.find((c) => c.id === cropId);

  // If not found in marketplace, check seed list
  if (!crop) {
    const seed = SEED_BIDDING_CROPS.find((s) => s.id === cropId);
    if (seed) {
      crop = { ...seed };
      marketplaceCrops.push(crop);
    }
  }

  if (!crop) {
    return { success: false, message: 'Crop lot not found.' };
  }

  const bidAmt = Number(bidAmountPerQuintal);
  if (isNaN(bidAmt) || bidAmt <= (crop.currentHighestBid || crop.basePrice || 0)) {
    return {
      success: false,
      message: `Your bid must be strictly higher than current highest bid of ₹${(crop.currentHighestBid || crop.basePrice).toLocaleString('en-IN')}/Qtl.`
    };
  }

  const now = Date.now();
  const newBid = {
    id: 'bid_' + now + '_' + Math.random().toString(36).substring(2, 6),
    vendorId: vendorUser?.id || 'usr_vendor_1',
    vendorCompany: vendorUser?.companyName || vendorUser?.fullName || 'Apex Agri Traders Pvt Ltd',
    vendorContact: vendorUser?.fullName || 'Vendor Partner',
    vendorMobile: vendorUser?.mobileNumber || '',
    vendorLocation: `${vendorUser?.district || 'Trading Hub'}`,
    bidAmountPerQuintal: bidAmt,
    totalBidValue: bidAmt * (crop.quantityNumber || 10),
    timestamp: now
  };

  if (!crop.bidsList) crop.bidsList = [];
  crop.bidsList.push(newBid);
  crop.currentHighestBid = bidAmt;
  crop.winningVendor = newBid;
  crop.status = 'Bidding Active';

  saveMarketplaceCrops(marketplaceCrops);

  return {
    success: true,
    crop,
    newBid,
    message: `🎉 Your bid of ₹${bidAmt.toLocaleString('en-IN')}/Qtl has been successfully placed on Lot ${crop.id}!`
  };
};

/**
 * Farmer Accepts Vendor Bid
 * - Marks status as 'Bid Accepted'
 * - Allocates lot into vendor's Allocated Lots (Dashboard Module 1)
 * - Starts 24-hour purchase countdown
 * - Unlocks required farmer details only to the accepted vendor
 * - Emits in-app Notification
 */
export const farmerAcceptsVendorBid = (cropId, vendorUser) => {
  let marketplaceCrops = getMarketplaceCrops();
  let crop = marketplaceCrops.find((c) => c.id === cropId);

  if (!crop) {
    const seed = SEED_BIDDING_CROPS.find((s) => s.id === cropId);
    if (seed) {
      crop = { ...seed };
      marketplaceCrops.push(crop);
    }
  }

  if (!crop) return { success: false, message: 'Crop not found.' };

  const now = Date.now();
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

  const vendorId = vendorUser?.id || 'usr_demo_vendor_1';
  const vendorCompany = vendorUser?.companyName || 'Apex Agri Traders Pvt Ltd';
  const vendorMobile = vendorUser?.mobileNumber || '9123456780';

  crop.status = 'Bid Accepted';
  crop.acceptedAt = new Date().toISOString();
  crop.winningVendor = {
    vendorId,
    vendorCompany,
    vendorMobile,
    bidAmountPerQuintal: crop.currentHighestBid,
    totalBidValue: crop.currentHighestBid * (crop.quantityNumber || 10)
  };

  saveMarketplaceCrops(marketplaceCrops);

  // Add into Vendor's Allocated Lots store (Dashboard Module 1)
  const allLots = getStoredAllLots();
  const totalPurchaseAmt = crop.currentHighestBid * (crop.quantityNumber || 10);

  const newAllocatedLot = {
    id: crop.id.startsWith('LOT-') ? crop.id : 'LOT-' + crop.id,
    vendorId,
    vendorMobile,
    vendorCompany,
    cropName: crop.cropName,
    cropPicture: crop.cropPhotos?.[0] || crop.cropPicture || SAMPLE_CROP_IMAGES[crop.cropName] || SAMPLE_CROP_IMAGES.Paddy,
    quantity: crop.quantity || `${crop.quantityNumber || 10} Quintals`,
    quantityNumber: crop.quantityNumber || 10,
    cropAddress: crop.cropAddress,
    acceptedBidRate: crop.currentHighestBid,
    purchaseAmount: totalPurchaseAmt,
    allocationDate: todayStr,
    allocationTime: timeStr,
    allocatedAt: now,
    expiresAt: now + (24 * 3600 * 1000), // Strict 24h purchase period from allocation
    status: 'Pending Purchase',
    // Unlocked Farmer Details for Accepted Vendor
    farmerDetails: {
      fullName: crop.farmerDetails?.fullName || 'Farmer Partner',
      mobileNumber: crop.farmerDetails?.mobileNumber || crop.farmerMobile || '9876543210',
      landSurveyNumber: crop.farmerDetails?.landSurveyNumber || 'SY-402/1A',
      village: crop.farmerDetails?.village || 'Rampur',
      mandal: crop.farmerDetails?.mandal || 'Shamirpet',
      district: crop.farmerDetails?.district || 'Medchal',
      pincode: crop.farmerDetails?.pincode || '500078'
    },
    purchaseDate: null,
    purchaseTime: null,
    purchasedAt: null,
    transactionId: null,
    utrReference: null,
    paymentMode: null
  };

  // Check if lot already exists in store, update or insert
  const existingIndex = allLots.findIndex((l) => l.id === newAllocatedLot.id);
  if (existingIndex >= 0) {
    allLots[existingIndex] = { ...allLots[existingIndex], ...newAllocatedLot };
  } else {
    allLots.unshift(newAllocatedLot);
  }
  saveAllLots(allLots);

  // Save in-app notification
  const notificationText = `Your bid for ${crop.cropName} was accepted. The crop has been allocated to you. Please complete the purchase within 24 hours.`;
  addVendorNotification(vendorUser, {
    type: 'bid_accepted',
    cropId: crop.id,
    cropName: crop.cropName,
    text: notificationText,
    lotId: newAllocatedLot.id,
    timestamp: now
  });

  return {
    success: true,
    lot: newAllocatedLot,
    notification: notificationText
  };
};

/**
 * Farmer Rejects Vendor Bid
 * - Marks status as 'Bid Rejected'
 * - Does NOT move to Allocated Lots
 * - Does NOT expose farmer private details
 * - Emits in-app Notification
 */
export const farmerRejectsVendorBid = (cropId, vendorUser) => {
  let marketplaceCrops = getMarketplaceCrops();
  let crop = marketplaceCrops.find((c) => c.id === cropId);

  if (!crop) {
    const seed = SEED_BIDDING_CROPS.find((s) => s.id === cropId);
    if (seed) {
      crop = { ...seed };
      marketplaceCrops.push(crop);
    }
  }

  if (!crop) return { success: false, message: 'Crop not found.' };

  const vendorId = vendorUser?.id || 'usr_demo_vendor_1';
  crop.status = 'Bid Rejected';
  crop.rejectedVendorId = vendorId;
  crop.rejectedAt = new Date().toISOString();

  saveMarketplaceCrops(marketplaceCrops);

  // Save in-app notification
  const notificationText = `Your bid for ${crop.cropName} was rejected by the farmer.`;
  addVendorNotification(vendorUser, {
    type: 'bid_rejected',
    cropId: crop.id,
    cropName: crop.cropName,
    text: notificationText,
    timestamp: Date.now()
  });

  return {
    success: true,
    crop,
    notification: notificationText
  };
};

/**
 * Manage Vendor In-App Notifications
 */
export const getVendorNotifications = (vendorUser) => {
  if (!vendorUser) return [];
  try {
    const raw = localStorage.getItem(getNotifKey(vendorUser));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addVendorNotification = (vendorUser, notifData) => {
  if (!vendorUser) return;
  const list = getVendorNotifications(vendorUser);
  const newNotif = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ...notifData,
    read: false,
    createdAt: Date.now()
  };
  list.unshift(newNotif);
  try {
    localStorage.setItem(getNotifKey(vendorUser), JSON.stringify(list));
  } catch (e) {}
  return newNotif;
};

export const dismissVendorNotification = (vendorUser, notifId) => {
  if (!vendorUser) return;
  let list = getVendorNotifications(vendorUser);
  list = list.filter((n) => n.id !== notifId);
  try {
    localStorage.setItem(getNotifKey(vendorUser), JSON.stringify(list));
  } catch (e) {}
  return list;
};
