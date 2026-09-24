/**
 * AgriTradeX Crop Market Price Intelligence & Predictions Store (Section 4)
 * Provides crop-wise current market rates, AI/ML predicted future prices, expected change, and trend direction.
 */

export const RECOMMENDATIONS_DATA = [
  {
    id: 'rec_rice',
    cropName: 'Rice (Paddy)',
    category: 'Cereals & Grains',
    variety: 'Sona Masoori / Hybrid',
    currentPrice: 2400,
    predictedPrice: 2550,
    expectedChange: 150,
    trend: 'Increasing', // 'Increasing' | 'Decreasing' | 'Stable'
    trendPercent: '+6.25%',
    confidenceScore: '89% High Confidence',
    forecastPeriod: 'Next 30 Days (Harvest Peak)',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'High festival demand and government buffer stock procurement are driving spot prices upward.',
    actionTip: 'Holding inventory for 2-3 weeks recommended to capture higher peak harvest prices.'
  },
  {
    id: 'rec_cotton',
    cropName: 'Cotton',
    category: 'Cash Crops / Fiber',
    variety: 'Bt Cotton Long Staple',
    currentPrice: 7200,
    predictedPrice: 7000,
    expectedChange: -200,
    trend: 'Decreasing',
    trendPercent: '-2.78%',
    confidenceScore: '84% Moderate Confidence',
    forecastPeriod: 'Next 2-3 Weeks',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'Surplus arrivals in Gujarat and international textile slowdown are creating temporary price pressure.',
    actionTip: 'Push available lots for 24-hour bidding soon to lock current higher spot floor rates.'
  },
  {
    id: 'rec_maize',
    cropName: 'Maize (Corn)',
    category: 'Coarse Grains / Feed',
    variety: 'Yellow Feed Grain',
    currentPrice: 2100,
    predictedPrice: 2250,
    expectedChange: 150,
    trend: 'Increasing',
    trendPercent: '+7.14%',
    confidenceScore: '92% High Confidence',
    forecastPeriod: 'Next 30 Days',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'Stiff poultry feed demand and ethanol distillery industrial blending are boosting price levels.',
    actionTip: 'Strong upward momentum. Good window to negotiate premium vendor advances.'
  },
  {
    id: 'rec_wheat',
    cropName: 'Wheat',
    category: 'Cereals & Grains',
    variety: 'Sharbati / Mill Quality',
    currentPrice: 2350,
    predictedPrice: 2420,
    expectedChange: 70,
    trend: 'Increasing',
    trendPercent: '+2.98%',
    confidenceScore: '88% High Confidence',
    forecastPeriod: 'Next 1 Month',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'Steady flour mill demand with tight regional warehouse inventories supporting stable prices.',
    actionTip: 'Stable demand trajectory. Favorable for standard 24h auction pushes.'
  },
  {
    id: 'rec_turmeric',
    cropName: 'Turmeric',
    category: 'Spices & Commercial',
    variety: 'Salem Curcumin Rich',
    currentPrice: 12800,
    predictedPrice: 13500,
    expectedChange: 700,
    trend: 'Increasing',
    trendPercent: '+5.47%',
    confidenceScore: '86% High Confidence',
    forecastPeriod: 'Next 45 Days',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'Export demand to Middle East & Europe surging alongside lower monsoon acreages in major belts.',
    actionTip: 'Strong bullish outlook. Consider pre-harvest vendor credit agreements.'
  },
  {
    id: 'rec_chilli',
    cropName: 'Red Chilli',
    category: 'Spices',
    variety: 'Teja / Guntur Best',
    currentPrice: 18500,
    predictedPrice: 18500,
    expectedChange: 0,
    trend: 'Stable',
    trendPercent: '0.00%',
    confidenceScore: '81% Moderate Confidence',
    forecastPeriod: 'Next 2 Weeks',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'Supply and export demand are evenly matched across major APMC wholesale yards.',
    actionTip: 'Current rates are competitive and stable for immediate spot selling.'
  },
  {
    id: 'rec_tomato',
    cropName: 'Tomato',
    category: 'Horticulture / Vegetables',
    variety: 'Hybrid Table Grade',
    currentPrice: 2800,
    predictedPrice: 2500,
    expectedChange: -300,
    trend: 'Decreasing',
    trendPercent: '-10.71%',
    confidenceScore: '78% Moderate Confidence',
    forecastPeriod: 'Next 10-15 Days',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'Fresh crop arrivals arriving from neighboring state clusters will increase daily wholesale volumes.',
    actionTip: 'Harvest and liquidate ready inventory promptly before incoming supplies peak.'
  },
  {
    id: 'rec_groundnut',
    cropName: 'Groundnut (Peanut)',
    category: 'Oilseeds',
    variety: 'Bold Grade Shelling',
    currentPrice: 6400,
    predictedPrice: 6750,
    expectedChange: 350,
    trend: 'Increasing',
    trendPercent: '+5.47%',
    confidenceScore: '87% High Confidence',
    forecastPeriod: 'Next 30 Days',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'Oil mill crushing orders are expanding ahead of festive season consumption.',
    actionTip: 'Favorable price trajectory for quality bold lots.'
  },
  {
    id: 'rec_soybean',
    cropName: 'Soybean',
    category: 'Oilseeds',
    variety: 'Yellow High Protein',
    currentPrice: 4800,
    predictedPrice: 4750,
    expectedChange: -50,
    trend: 'Stable',
    trendPercent: '-1.04%',
    confidenceScore: '82% Moderate Confidence',
    forecastPeriod: 'Next 2 Weeks',
    lastUpdated: 'Today at 06:30 AM (Mandi Intelligence AI)',
    marketInsight: 'Global soymeal import-export balances holding domestic physical market within range.',
    actionTip: 'Stable baseline. Suitable for direct vendor bidding.'
  }
];

export const getCropRecommendations = () => {
  return RECOMMENDATIONS_DATA;
};
