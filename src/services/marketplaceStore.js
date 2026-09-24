/**
 * AgriTradeX Centralized Marketplace & 24-Hour Bidding Store
 * Manages:
 * - Farmer pushed crops for 24-hour auction
 * - Vendor bids with privacy protections
 * - Automatic / manual 24-hour completion
 * - Farmer Accept / Reject decision handling
 * - Privacy-controlled detail disclosure strictly to winning vendors
 */

const MARKETPLACE_STORAGE_KEY = 'agritradex_marketplace_crops';

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

// Seed initial marketplace crops if empty
const getSeedMarketplaceCrops = () => {
  const now = Date.now();
  return [
    {
      id: 'sell_crop_demo_1',
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
      quantity: '40 Quintals',
      quantityNumber: 40,
      cropPhotos: [SAMPLE_CROP_IMAGES.Cotton],
      cropAddress: 'Survey No. 402/1A, Rampur Village, Shamirpet, Medchal - 500078',
      basePrice: 7000,
      currentHighestBid: 7450,
      createdAt: now - (5 * 3600 * 1000), // Pushed 5 hours ago
      durationMs: 24 * 3600 * 1000,
      expiresAt: now + (19 * 3600 * 1000), // 19 hours left
      status: 'Bidding Active', // 'Bidding Active' | 'Bidding Completed' | 'Bid Accepted' | 'Bid Rejected'
      bidsList: [
        {
          id: 'bid_s1',
          vendorId: 'usr_demo_vendor_1',
          vendorCompany: 'Apex Agri Traders Pvt Ltd',
          vendorContact: 'Priya Sharma',
          vendorMobile: '9123456780',
          vendorLocation: 'Bengaluru Urban, KA',
          bidAmountPerQuintal: 7200,
          totalBidValue: 288000,
          timestamp: now - (4 * 3600 * 1000)
        },
        {
          id: 'bid_s2',
          vendorId: 'usr_vendor_ext_2',
          vendorCompany: 'Kisan Universal Commodities',
          vendorContact: 'Sunil Rao',
          vendorMobile: '9848022334',
          vendorLocation: 'Hyderabad, TS',
          bidAmountPerQuintal: 7450,
          totalBidValue: 298000,
          timestamp: now - (2 * 3600 * 1000)
        }
      ],
      winningVendor: {
        vendorId: 'usr_vendor_ext_2',
        vendorCompany: 'Kisan Universal Commodities',
        vendorContact: 'Sunil Rao',
        vendorMobile: '9848022334',
        vendorLocation: 'Hyderabad, TS',
        bidAmountPerQuintal: 7450,
        totalBidValue: 298000
      }
    },
    {
      id: 'sell_crop_demo_2',
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
      cropName: 'Turmeric',
      quantity: '25 Quintals',
      quantityNumber: 25,
      cropPhotos: [SAMPLE_CROP_IMAGES.Turmeric],
      cropAddress: 'Plot 4, Farm Zone, Rampur, Medchal - 500078',
      basePrice: 12500,
      currentHighestBid: 13800,
      createdAt: now - (24.5 * 3600 * 1000), // Ended
      durationMs: 24 * 3600 * 1000,
      expiresAt: now - (0.5 * 3600 * 1000),
      status: 'Bidding Completed', // Ready for farmer decision
      bidsList: [
        {
          id: 'bid_t1',
          vendorId: 'usr_demo_vendor_1',
          vendorCompany: 'Apex Agri Traders Pvt Ltd',
          vendorContact: 'Priya Sharma',
          vendorMobile: '9123456780',
          vendorLocation: 'Bengaluru Urban, KA',
          bidAmountPerQuintal: 13800,
          totalBidValue: 345000,
          timestamp: now - (1 * 3600 * 1000)
        }
      ],
      winningVendor: {
        vendorId: 'usr_demo_vendor_1',
        vendorCompany: 'Apex Agri Traders Pvt Ltd',
        vendorContact: 'Priya Sharma',
        vendorMobile: '9123456780',
        vendorLocation: 'Bengaluru Urban, KA',
        bidAmountPerQuintal: 13800,
        totalBidValue: 345000
      }
    }
  ];
};

export const getMarketplaceCrops = () => {
  try {
    const raw = localStorage.getItem(MARKETPLACE_STORAGE_KEY);
    if (!raw) {
      const seed = getSeedMarketplaceCrops();
      localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const crops = JSON.parse(raw);
    
    // Auto-update any expired active auctions to 'Bidding Completed'
    const now = Date.now();
    let changed = false;
    crops.forEach((c) => {
      if (c.status === 'Bidding Active' && c.expiresAt <= now) {
        c.status = 'Bidding Completed';
        if (c.bidsList && c.bidsList.length > 0) {
          c.winningVendor = c.bidsList[c.bidsList.length - 1];
          c.currentHighestBid = c.winningVendor.bidAmountPerQuintal;
        }
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(crops));
    }

    return crops;
  } catch (err) {
    console.error('Error getting marketplace crops', err);
    return [];
  }
};

export const saveMarketplaceCrops = (crops) => {
  try {
    localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(crops));
  } catch (err) {
    console.error('Error saving marketplace crops', err);
  }
};

// 1. Farmer pushes a new crop for 24-hour bidding
export const pushCropForBidding = (farmerUser, cropData) => {
  const crops = getMarketplaceCrops();
  const now = Date.now();
  const basePrice = Number(cropData.basePrice) || 2500;
  const qtyNumber = Number(cropData.quantityNumber) || Number(cropData.quantity) || 10;

  const newCrop = {
    id: 'crop_lot_' + now + '_' + Math.random().toString(36).substring(2, 6),
    farmerMobile: farmerUser?.mobileNumber || '9876543210',
    farmerDetails: {
      fullName: farmerUser?.fullName || 'Farmer Partner',
      mobileNumber: farmerUser?.mobileNumber || '',
      aadhaarNumber: farmerUser?.aadhaarNumber || '',
      panNumber: farmerUser?.panNumber || '',
      landSurveyNumber: farmerUser?.landSurveyNumber || 'N/A',
      village: farmerUser?.village || '',
      mandal: farmerUser?.mandal || '',
      district: farmerUser?.district || '',
      pincode: farmerUser?.pincode || ''
    },
    cropName: cropData.cropName || 'Paddy',
    quantity: cropData.quantity ? `${cropData.quantity} Quintals` : `${qtyNumber} Quintals`,
    quantityNumber: qtyNumber,
    cropPhotos: cropData.cropPhotos && cropData.cropPhotos.length ? cropData.cropPhotos : [SAMPLE_CROP_IMAGES[cropData.cropName] || SAMPLE_CROP_IMAGES.Paddy],
    cropAddress: cropData.cropAddress || `${farmerUser?.village || 'Farm'}, ${farmerUser?.mandal || ''}, ${farmerUser?.district || ''} - ${farmerUser?.pincode || ''}`,
    basePrice: basePrice,
    currentHighestBid: basePrice,
    createdAt: now,
    durationMs: 24 * 3600 * 1000,
    expiresAt: now + (24 * 3600 * 1000), // Exactly 24 hours
    status: 'Bidding Active',
    bidsList: [
      {
        id: 'bid_floor_' + now,
        vendorId: 'system_floor',
        vendorCompany: 'Floor Starting Price',
        vendorContact: 'AgriTradeX Exchange',
        vendorMobile: '',
        vendorLocation: 'Mandi Base',
        bidAmountPerQuintal: basePrice,
        totalBidValue: basePrice * qtyNumber,
        timestamp: now
      }
    ],
    winningVendor: null
  };

  crops.unshift(newCrop);
  saveMarketplaceCrops(crops);
  return newCrop;
};

// 2. Vendor places a bid
export const placeVendorBid = (cropId, vendorUser, bidAmountPerQuintal) => {
  const crops = getMarketplaceCrops();
  const crop = crops.find((c) => c.id === cropId);
  if (!crop) return { success: false, message: 'Crop not found.' };

  const now = Date.now();
  if (crop.status !== 'Bidding Active' || crop.expiresAt <= now) {
    return { success: false, message: 'Bidding period for this crop has ended.' };
  }

  const bidAmt = Number(bidAmountPerQuintal);
  if (bidAmt <= crop.currentHighestBid) {
    return {
      success: false,
      message: `Bid must be higher than the current highest bid of ₹${crop.currentHighestBid.toLocaleString('en-IN')}.`
    };
  }

  const newBid = {
    id: 'bid_' + now + '_' + Math.random().toString(36).substring(2, 6),
    vendorId: vendorUser?.id || 'usr_vendor_' + now,
    vendorCompany: vendorUser?.companyName || vendorUser?.fullName || 'Registered Agri Trader',
    vendorContact: vendorUser?.fullName || 'Vendor Representative',
    vendorMobile: vendorUser?.mobileNumber || '',
    vendorLocation: `${vendorUser?.village || ''}, ${vendorUser?.district || 'Trading Hub'}`,
    bidAmountPerQuintal: bidAmt,
    totalBidValue: bidAmt * (crop.quantityNumber || 10),
    timestamp: now
  };

  crop.bidsList.push(newBid);
  crop.currentHighestBid = bidAmt;
  crop.winningVendor = newBid;

  saveMarketplaceCrops(crops);
  return { success: true, crop, newBid };
};

// 3. Complete / Fast-forward 24-hour bidding (stops accepting bids)
export const finalize24HourBidding = (cropId) => {
  const crops = getMarketplaceCrops();
  const crop = crops.find((c) => c.id === cropId);
  if (!crop) return null;

  crop.status = 'Bidding Completed';
  crop.expiresAt = Date.now();
  if (crop.bidsList && crop.bidsList.length > 0) {
    crop.winningVendor = crop.bidsList[crop.bidsList.length - 1];
    crop.currentHighestBid = crop.winningVendor.bidAmountPerQuintal;
  }

  saveMarketplaceCrops(crops);
  return crop;
};

// 4. Farmer ACCEPTS Bid
export const acceptBidByFarmer = (cropId) => {
  const crops = getMarketplaceCrops();
  const crop = crops.find((c) => c.id === cropId);
  if (!crop) return null;

  crop.status = 'Bid Accepted';
  crop.acceptedAt = new Date().toISOString();
  // Winning vendor is locked
  if (!crop.winningVendor && crop.bidsList && crop.bidsList.length > 0) {
    crop.winningVendor = crop.bidsList[crop.bidsList.length - 1];
  }

  saveMarketplaceCrops(crops);
  return crop;
};

// 5. Farmer REJECTS Bid
export const rejectBidByFarmer = (cropId) => {
  const crops = getMarketplaceCrops();
  const crop = crops.find((c) => c.id === cropId);
  if (!crop) return null;

  crop.status = 'Bid Rejected';
  crop.rejectedAt = new Date().toISOString();

  saveMarketplaceCrops(crops);
  return crop;
};

// 6. Get crops for farmer view
export const getSellCropsForFarmer = (farmerMobile) => {
  const crops = getMarketplaceCrops();
  if (!farmerMobile) return crops;
  return crops.filter((c) => c.farmerMobile === farmerMobile);
};

// 7. Get crops for vendor view WITH PRIVACY CONTROLS
export const getMarketplaceCropsForVendor = (vendorUser) => {
  const crops = getMarketplaceCrops();
  const vendorId = vendorUser?.id;
  const vendorCompany = vendorUser?.companyName;

  return crops.map((crop) => {
    // Check if this specific vendor won and farmer ACCEPTED the bid
    const isWinningVendorAndAccepted =
      crop.status === 'Bid Accepted' &&
      crop.winningVendor &&
      (crop.winningVendor.vendorId === vendorId ||
        crop.winningVendor.vendorCompany === vendorCompany ||
        crop.winningVendor.vendorMobile === vendorUser?.mobileNumber);

    if (isWinningVendorAndAccepted) {
      // Reveal complete farmer details to the selected winning vendor
      return {
        ...crop,
        hasFarmerDetailsAccess: true,
        farmerDetails: crop.farmerDetails
      };
    } else {
      // PRIVACY RULE: Strip farmer's complete personal registration details
      return {
        ...crop,
        hasFarmerDetailsAccess: false,
        farmerDetails: null, // Hidden: No Aadhaar, PAN, personal phone
        farmerMobile: null   // Hidden
      };
    }
  });
};
