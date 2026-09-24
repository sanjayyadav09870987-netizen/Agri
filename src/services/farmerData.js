/**
 * Farmer Data Service for AgriTradeX
 * Manages:
 * 1. Cultivated Crops with Progress Timeline & Photos
 * 2. 24-Hour Crop Bidding & Final Price calculation
 * 3. 30-Day Historical Market Price Trends
 * 4. Kisan Loan Applications & Status Workflow
 */

const CROPS_KEY_PREFIX = 'agritradex_farmer_crops_';
const BIDS_KEY_PREFIX = 'agritradex_farmer_bids_';
const LOANS_KEY_PREFIX = 'agritradex_farmer_loans_';

// Default sample photos for quick selection / previews
export const SAMPLE_CROP_IMAGES = {
  Paddy: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  Turmeric: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  Maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  Chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  Groundnut: 'https://images.unsplash.com/photo-1567892320421-1c657571ea4a?auto=format&fit=crop&w=600&q=80',
  Soybean: 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=600&q=80'
};

// Base 30-day baseline prices in INR per Quintal
const BASE_PRICES = {
  Paddy: 2200,
  Cotton: 6900,
  Wheat: 2350,
  Turmeric: 12800,
  Maize: 2150,
  Chilli: 18500,
  Tomato: 2800,
  Groundnut: 6400,
  Soybean: 4800
};

// ============================================================================
// MODULE 1: CROPS MANAGEMENT
// ============================================================================

export const getFarmerCrops = (mobile) => {
  if (!mobile) return [];
  try {
    const raw = localStorage.getItem(CROPS_KEY_PREFIX + mobile);
    if (raw) return JSON.parse(raw);
    
    // Seed default crops for initial demo experience
    const initialCrops = [
      {
        id: 'crop_' + Date.now() + '_1',
        cropName: 'Cotton',
        category: 'Cash Crop / Commercial',
        variety: 'Bt Cotton Hybrid',
        acresAllocated: 3.5,
        sowingDate: '2026-06-15',
        expectedHarvestDate: '2026-11-20',
        estimatedYieldQuintals: 35,
        photoUrl: SAMPLE_CROP_IMAGES.Cotton,
        stage: 'Flowering & Boll Formation',
        status: 'Cultivating',
        progressLogs: [
          {
            id: 'log_1',
            date: '2026-06-15',
            stage: 'Sowing & Germination',
            note: 'High quality hybrid seeds sown with bio-fertilizers.',
            photoUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=500&q=80'
          },
          {
            id: 'log_2',
            date: '2026-08-10',
            stage: 'Vegetative Growth',
            note: 'Healthy vegetative growth, timely drip irrigation applied.',
            photoUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2252e?auto=format&fit=crop&w=500&q=80'
          },
          {
            id: 'log_3',
            date: '2026-09-18',
            stage: 'Flowering & Boll Formation',
            note: 'Bolls forming vigorously. Pest protection sprays completed.',
            photoUrl: SAMPLE_CROP_IMAGES.Cotton
          }
        ]
      },
      {
        id: 'crop_' + Date.now() + '_2',
        cropName: 'Turmeric',
        category: 'Spices & Medicinal',
        variety: 'Salem Curcumin Rich',
        acresAllocated: 2.0,
        sowingDate: '2026-05-25',
        expectedHarvestDate: '2026-12-15',
        estimatedYieldQuintals: 24,
        photoUrl: SAMPLE_CROP_IMAGES.Turmeric,
        stage: 'Rhizome Development',
        status: 'Cultivating',
        progressLogs: [
          {
            id: 'log_t1',
            date: '2026-05-25',
            stage: 'Rhizome Planting',
            note: 'Planted treated rhizomes on raised beds with organic mulch.',
            photoUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=500&q=80'
          },
          {
            id: 'log_t2',
            date: '2026-08-01',
            stage: 'Canopy Formation',
            note: 'Broad green leaves developed, mulching replenished.',
            photoUrl: SAMPLE_CROP_IMAGES.Turmeric
          }
        ]
      }
    ];

    localStorage.setItem(CROPS_KEY_PREFIX + mobile, JSON.stringify(initialCrops));
    return initialCrops;
  } catch (err) {
    console.error('Error fetching crops', err);
    return [];
  }
};

export const saveFarmerCrops = (mobile, crops) => {
  if (!mobile) return;
  try {
    localStorage.setItem(CROPS_KEY_PREFIX + mobile, JSON.stringify(crops));
  } catch (err) {
    console.error('Error saving crops', err);
  }
};

export const addFarmerCrop = (mobile, cropData) => {
  const crops = getFarmerCrops(mobile);
  const newCrop = {
    id: 'crop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    cropName: cropData.cropName,
    category: cropData.category || 'General Agriculture',
    variety: cropData.variety || 'Standard Hybrid',
    acresAllocated: Number(cropData.acresAllocated) || 1,
    sowingDate: cropData.sowingDate || new Date().toISOString().split('T')[0],
    expectedHarvestDate: cropData.expectedHarvestDate,
    estimatedYieldQuintals: Number(cropData.estimatedYieldQuintals) || (Number(cropData.acresAllocated) * 10),
    photoUrl: cropData.photoUrl || SAMPLE_CROP_IMAGES[cropData.cropName] || SAMPLE_CROP_IMAGES.Paddy,
    stage: 'Sown / Germination',
    status: 'Cultivating',
    createdAt: new Date().toISOString(),
    progressLogs: [
      {
        id: 'log_' + Date.now(),
        date: cropData.sowingDate || new Date().toISOString().split('T')[0],
        stage: 'Sowing / Initial Plant',
        note: 'Crop planted and registered in AgriTradeX.',
        photoUrl: cropData.photoUrl || SAMPLE_CROP_IMAGES[cropData.cropName] || SAMPLE_CROP_IMAGES.Paddy
      }
    ]
  };

  crops.unshift(newCrop);
  saveFarmerCrops(mobile, crops);
  return newCrop;
};

export const addCropProgressPhoto = (mobile, cropId, progressData) => {
  const crops = getFarmerCrops(mobile);
  const crop = crops.find((c) => c.id === cropId);
  if (!crop) return null;

  const newLog = {
    id: 'log_' + Date.now(),
    date: progressData.date || new Date().toISOString().split('T')[0],
    stage: progressData.stage || 'Growth Update',
    note: progressData.note || '',
    photoUrl: progressData.photoUrl || crop.photoUrl
  };

  crop.stage = progressData.stage || crop.stage;
  crop.photoUrl = progressData.photoUrl || crop.photoUrl;
  if (!crop.progressLogs) crop.progressLogs = [];
  crop.progressLogs.push(newLog);

  saveFarmerCrops(mobile, crops);
  return crop;
};

// ============================================================================
// MODULE 2: 24-HOUR BIDDING SYSTEM
// ============================================================================

export const getFarmerBids = (mobile) => {
  if (!mobile) return [];
  try {
    const raw = localStorage.getItem(BIDS_KEY_PREFIX + mobile);
    if (raw) return JSON.parse(raw);

    // Initial simulated active bid for quick review
    const now = Date.now();
    const sampleBid = [
      {
        id: 'bid_' + now + '_1',
        cropId: 'crop_seed_1',
        cropName: 'Cotton',
        quantityQuintals: 30,
        basePricePerQuintal: 6800,
        currentHighestBid: 7350,
        createdAt: now - (6 * 3600 * 1000), // Created 6 hours ago
        durationMs: 24 * 3600 * 1000,       // 24 Hours window
        expiresAt: now + (18 * 3600 * 1000),// 18 Hours left
        status: 'active', // 'active' | 'completed'
        bidsList: [
          {
            id: 'b1',
            vendorName: 'Apex Agro Commodities',
            vendorLocation: 'Guntur, AP',
            bidAmountPerQuintal: 6950,
            timestamp: now - (5 * 3600 * 1000)
          },
          {
            id: 'b2',
            vendorName: 'Kisan Universal Traders',
            vendorLocation: 'Hyderabad, TS',
            bidAmountPerQuintal: 7100,
            timestamp: now - (3 * 3600 * 1000)
          },
          {
            id: 'b3',
            vendorName: 'Sri Balaji Agro Exporters',
            vendorLocation: 'Warangal, TS',
            bidAmountPerQuintal: 7350,
            timestamp: now - (1 * 3600 * 1000)
          }
        ]
      }
    ];

    localStorage.setItem(BIDS_KEY_PREFIX + mobile, JSON.stringify(sampleBid));
    return sampleBid;
  } catch (err) {
    return [];
  }
};

export const saveFarmerBids = (mobile, bids) => {
  if (!mobile) return;
  try {
    localStorage.setItem(BIDS_KEY_PREFIX + mobile, JSON.stringify(bids));
  } catch (err) {
    console.error('Error saving bids', err);
  }
};

export const pushCropToBidding = (mobile, { cropId, cropName, quantityQuintals, basePricePerQuintal }) => {
  const bids = getFarmerBids(mobile);
  const now = Date.now();
  const basePrice = Number(basePricePerQuintal) || BASE_PRICES[cropName] || 2500;
  
  const newBid = {
    id: 'bid_' + now + '_' + Math.random().toString(36).substring(2, 6),
    cropId,
    cropName,
    quantityQuintals: Number(quantityQuintals) || 10,
    basePricePerQuintal: basePrice,
    currentHighestBid: basePrice,
    createdAt: now,
    durationMs: 24 * 3600 * 1000,
    expiresAt: now + (24 * 3600 * 1000),
    status: 'active',
    bidsList: [
      {
        id: 'b_initial',
        vendorName: 'Mandi Base Floor Price',
        vendorLocation: 'Local APMC',
        bidAmountPerQuintal: basePrice,
        timestamp: now
      }
    ]
  };

  bids.unshift(newBid);
  saveFarmerBids(mobile, bids);
  return newBid;
};

// Simulate vendor placing a higher bid during the 24-hour cycle
export const simulateIncomingBid = (mobile, bidId) => {
  const bids = getFarmerBids(mobile);
  const bidItem = bids.find((b) => b.id === bidId);
  if (!bidItem || bidItem.status !== 'active') return null;

  const vendorPool = [
    { name: 'Kisan Global Exports Ltd', loc: 'Indore, MP' },
    { name: 'Shree Krishna Agro Mills', loc: 'Nagpur, MH' },
    { name: 'National Farm Produce Corp', loc: 'Delhi APMC' },
    { name: 'South India Agri Commodities', loc: 'Chennai, TN' },
    { name: 'Deccan Agro Traders', loc: 'Khammam, TS' }
  ];

  const randomVendor = vendorPool[Math.floor(Math.random() * vendorPool.length)];
  const increment = Math.floor(50 + Math.random() * 200);
  const newBidPrice = bidItem.currentHighestBid + increment;

  const newEntry = {
    id: 'b_' + Date.now(),
    vendorName: randomVendor.name,
    vendorLocation: randomVendor.loc,
    bidAmountPerQuintal: newBidPrice,
    timestamp: Date.now()
  };

  bidItem.currentHighestBid = newBidPrice;
  bidItem.bidsList.push(newEntry);
  saveFarmerBids(mobile, bids);
  return bidItem;
};

// Fast-forward / complete 24h auction to lock final price
export const finalizeBidAfter24Hours = (mobile, bidId) => {
  const bids = getFarmerBids(mobile);
  const bidItem = bids.find((b) => b.id === bidId);
  if (!bidItem) return null;

  bidItem.status = 'completed';
  bidItem.finalPricePerQuintal = bidItem.currentHighestBid;
  bidItem.finalTotalValue = bidItem.currentHighestBid * bidItem.quantityQuintals;
  bidItem.winningVendor = bidItem.bidsList[bidItem.bidsList.length - 1] || null;
  bidItem.completedAt = Date.now();

  saveFarmerBids(mobile, bids);
  return bidItem;
};

// ============================================================================
// MODULE 3: 30-DAY CROP PRICE TREND DATA GENERATOR
// ============================================================================

export const generate30DayPriceHistory = (cropName) => {
  const base = BASE_PRICES[cropName] || 2500;
  const history = [];
  const now = new Date();

  // Deterministic seed variance based on crop name
  let currentPrice = base * 0.92;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    // Gradual realistic fluctuation (-2% to +2.5%)
    const changeFactor = 1 + (Math.sin(i * 0.45) * 0.02) + ((Math.random() - 0.48) * 0.015);
    currentPrice = Math.round(currentPrice * changeFactor);

    history.push({
      date: dayLabel,
      fullDate: d.toISOString().split('T')[0],
      price: currentPrice
    });
  }

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const current = prices[prices.length - 1];
  const previous = prices[0];
  const percentChange = (((current - previous) / previous) * 100).toFixed(1);

  return {
    cropName,
    history,
    currentPrice: current,
    minPrice,
    maxPrice,
    percentChange: Number(percentChange)
  };
};

// ============================================================================
// MODULE 4: VENDOR LOAN & PRE-HARVEST ADVANCES
// ============================================================================

export const PARTNER_VENDORS_FOR_LOANS = [
  { id: 'v1', name: 'Apex Agri Traders Pvt Ltd', category: 'Major Trade Buyer & Input Financer', maxLimit: 500000 },
  { id: 'v2', name: 'Kisan Universal Commodities', category: 'Agri Export & Pre-Harvest Advance', maxLimit: 350000 },
  { id: 'v3', name: 'Sri Balaji Agro Processing Mills', category: 'Crop Output Offtaker & Credit Partner', maxLimit: 400000 },
  { id: 'v4', name: 'National Farm Produce Corp', category: 'APMC Authorized Trade Financer', maxLimit: 600000 },
  { id: 'v5', name: 'Open Request to All Registered Vendors', category: 'Open Marketplace Tender', maxLimit: 300000 }
];

export const getFarmerLoans = (mobile) => {
  if (!mobile) return [];
  try {
    const raw = localStorage.getItem(LOANS_KEY_PREFIX + mobile);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

export const applyFarmerLoan = (mobile, loanData) => {
  const loans = getFarmerLoans(mobile);
  const now = new Date();
  
  const newLoan = {
    id: 'VLN-' + Math.floor(100000 + Math.random() * 900000),
    loanType: loanData.loanType || 'Pre-Harvest Crop Advance Vendor Loan',
    lendingVendor: loanData.lendingVendor || 'Apex Agri Traders Pvt Ltd',
    amount: Number(loanData.amount) || 150000,
    tenureMonths: Number(loanData.tenureMonths) || 6,
    repaymentMode: loanData.repaymentMode || 'Auto-deducted from 24h Crop Bidding Sale',
    purpose: loanData.purpose || 'Pre-harvest working capital, seeds, drip irrigation and fertilizers',
    landSurveyNumber: loanData.landSurveyNumber || 'N/A',
    appliedDate: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    status: 'Under Vendor Review', // 'Submitted' | 'Under Vendor Review' | 'Field Inspected' | 'Sanctioned' | 'Disbursed'
    currentStepIndex: 1, // 0 to 4
    steps: [
      { title: 'Application Submitted to Vendor', date: now.toISOString().split('T')[0], done: true },
      { title: 'Vendor Credit & Land Review', date: 'In Progress', done: false },
      { title: 'Crop Inspection & Agreement', date: 'Upcoming', done: false },
      { title: 'Vendor Sanction Approval', date: 'Upcoming', done: false },
      { title: 'Fund / Input Disbursal', date: 'Upcoming', done: false }
    ],
    interestRate: '1.2% / month (Vendor Trade Credit)',
    settlementTerms: 'Linked to upcoming crop harvest lot'
  };

  loans.unshift(newLoan);
  try {
    localStorage.setItem(LOANS_KEY_PREFIX + mobile, JSON.stringify(loans));
  } catch (err) {
    console.error('Error saving vendor loan', err);
  }

  return newLoan;
};
