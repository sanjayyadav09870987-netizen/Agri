import React, { useState, useEffect } from 'react';
import CropsModule from './CropsModule';
import BiddingModule from './BiddingModule';
import PriceTrendsModule from './PriceTrendsModule';
import SellCropSection from './SellCropSection';
import VendorLoanSection from './VendorLoanSection';
import RecommendationsSection from './RecommendationsSection';
import TransactionsSection from './TransactionsSection';
import {
  getFarmerCrops,
  addFarmerCrop,
  addCropProgressPhoto,
  getFarmerBids,
  pushCropToBidding,
  simulateIncomingBid,
  finalizeBidAfter24Hours
} from '../../services/farmerData';
import { getFarmerActiveVendorLoan } from '../../services/vendorLoanStore';

export default function FarmerDashboard({ user, onLogout }) {
  // Main Section Navigation: 'dashboard' | 'sell_crop' | 'vendor_loan' | 'recommendations' | 'transactions'
  const [mainSection, setMainSection] = useState('dashboard');

  // Dashboard Sub-tabs: 'crops' | 'bidding' | 'trends' | 'loans'
  const [activeTab, setActiveTab] = useState('crops');

  const [crops, setCrops] = useState([]);
  const [bids, setBids] = useState([]);
  const [activeVendorLoan, setActiveVendorLoan] = useState(null);

  const userMobile = user?.mobileNumber || 'default_farmer';

  // Load data for farmer
  const refreshFarmerData = () => {
    if (userMobile) {
      setCrops(getFarmerCrops(userMobile));
      setBids(getFarmerBids(userMobile));
      const loan = getFarmerActiveVendorLoan(userMobile);
      setActiveVendorLoan(loan);
    }
  };

  useEffect(() => {
    refreshFarmerData();
  }, [userMobile, mainSection]);

  // Handlers for Module 1: Crops
  const handleAddCrop = (cropData) => {
    addFarmerCrop(userMobile, cropData);
    setCrops(getFarmerCrops(userMobile));
  };

  const handleAddProgressPhoto = (cropId, progressData) => {
    addCropProgressPhoto(userMobile, cropId, progressData);
    setCrops(getFarmerCrops(userMobile));
  };

  // Handlers for Module 2: Bidding
  const handlePushToBidding = (pushData) => {
    pushCropToBidding(userMobile, pushData);
    setBids(getFarmerBids(userMobile));
    setActiveTab('bidding');
  };

  const handleSimulateBid = (bidId) => {
    simulateIncomingBid(userMobile, bidId);
    setBids(getFarmerBids(userMobile));
  };

  const handleFinalizeBid = (bidId) => {
    finalizeBidAfter24Hours(userMobile, bidId);
    setBids(getFarmerBids(userMobile));
  };

  // Synchronized Vendor Loan Status String
  const currentLoanStatus = activeVendorLoan?.status || 'No Loan Application';
  const activeBidsCount = bids.filter((b) => b.status === 'active').length;

  return (
    <div className="farmer-dashboard-layout">
      {/* Top Navbar */}
      <nav className="farmer-navbar">
        <div className="nav-left">
          <span className="brand-logo">AgriTradeX</span>
          <span className="nav-portal-tag">Farmer Portal</span>
        </div>

        {/* Primary Header Menu: 1. Dashboard | 2. Sell Crop | 3. Vendor Loan | 4. Recommendations | 5. Transactions */}
        <div className="farmer-nav-center-menu" style={{ flexWrap: 'wrap' }}>
          <button
            id="nav-menu-dashboard"
            type="button"
            className={`nav-section-btn ${mainSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setMainSection('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            id="nav-menu-sell-crop"
            type="button"
            className={`nav-section-btn ${mainSection === 'sell_crop' ? 'active' : ''}`}
            onClick={() => setMainSection('sell_crop')}
          >
            🏷️ Sell Crop
          </button>
          <button
            id="nav-menu-vendor-loan"
            type="button"
            className={`nav-section-btn ${mainSection === 'vendor_loan' ? 'active' : ''}`}
            onClick={() => setMainSection('vendor_loan')}
          >
            🤝 Vendor Loan
          </button>
          <button
            id="nav-menu-recommendations"
            type="button"
            className={`nav-section-btn ${mainSection === 'recommendations' ? 'active' : ''}`}
            onClick={() => setMainSection('recommendations')}
          >
            💡 Recommendations
          </button>
          <button
            id="nav-menu-transactions"
            type="button"
            className={`nav-section-btn ${mainSection === 'transactions' ? 'active' : ''}`}
            onClick={() => setMainSection('transactions')}
          >
            💳 Transactions
          </button>
        </div>

        <div className="nav-right">
          <div className="farmer-profile-pill">
            <span className="farmer-avatar">🌾</span>
            <div className="farmer-meta">
              <span className="farmer-name">{user?.fullName || 'Farmer Partner'}</span>
              <span className="farmer-sub">
                {user?.village || 'Village'}, {user?.district || 'District'} ({user?.landAcres || 0} Acres)
              </span>
            </div>
          </div>

          <button
            id="btn-farmer-logout"
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="dashboard-content-wrap">
        {/* ========================================================
            SECTION 1: DASHBOARD (4 CORE MODULES)
            ======================================================== */}
        {mainSection === 'dashboard' && (
          <div>
            {/* KPI Summary Banner */}
            <div className="kpi-summary-grid">
              <div className="kpi-card" onClick={() => setActiveTab('crops')} style={{ cursor: 'pointer' }}>
                <div className="kpi-icon">🌱</div>
                <div className="kpi-text">
                  <span className="kpi-label">Cultivated Crops</span>
                  <span className="kpi-val">{crops.length} Active Crops</span>
                </div>
              </div>

              <div className="kpi-card" onClick={() => setActiveTab('bidding')} style={{ cursor: 'pointer' }}>
                <div className="kpi-icon">⚡</div>
                <div className="kpi-text">
                  <span className="kpi-label">24h Live Biddings</span>
                  <span className="kpi-val">{activeBidsCount} Auction(s) Open</span>
                </div>
              </div>

              <div className="kpi-card" onClick={() => setActiveTab('trends')} style={{ cursor: 'pointer' }}>
                <div className="kpi-icon">📈</div>
                <div className="kpi-text">
                  <span className="kpi-label">Price Trends</span>
                  <span className="kpi-val">30-Day Mandi Curve</span>
                </div>
              </div>

              <div
                id="kpi-vendor-loan-status"
                className="kpi-card"
                onClick={() => setMainSection('vendor_loan')}
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-icon">🤝</div>
                <div className="kpi-text">
                  <span className="kpi-label">Vendor Loan Status</span>
                  <span
                    className="kpi-val"
                    style={{
                      color:
                        currentLoanStatus === 'Loan Amount Disbursed'
                          ? '#059669'
                          : currentLoanStatus === 'Loan Accepted'
                          ? '#d97706'
                          : currentLoanStatus === 'Loan Rejected'
                          ? '#dc2626'
                          : 'var(--text-main)'
                    }}
                  >
                    {currentLoanStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 MODULES NAVIGATION TABS */}
            <div className="dashboard-tab-bar">
              <button
                id="tab-module-crops"
                type="button"
                className={`dashboard-tab ${activeTab === 'crops' ? 'active' : ''}`}
                onClick={() => setActiveTab('crops')}
              >
                🌾 1. Cultivated Crops & Timeline
              </button>

              <button
                id="tab-module-bidding"
                type="button"
                className={`dashboard-tab ${activeTab === 'bidding' ? 'active' : ''}`}
                onClick={() => setActiveTab('bidding')}
              >
                ⚡ 2. 24h Crop Bidding ({activeBidsCount})
              </button>

              <button
                id="tab-module-trends"
                type="button"
                className={`dashboard-tab ${activeTab === 'trends' ? 'active' : ''}`}
                onClick={() => setActiveTab('trends')}
              >
                📈 3. 30-Day Price Trends
              </button>

              <button
                id="tab-module-loans"
                type="button"
                className={`dashboard-tab ${activeTab === 'loans' ? 'active' : ''}`}
                onClick={() => setActiveTab('loans')}
              >
                🤝 4. Vendor Loan Status ({currentLoanStatus})
              </button>
            </div>

            {/* MODULE VIEWS */}
            <main className="module-view-body">
              {activeTab === 'crops' && (
                <CropsModule
                  crops={crops}
                  onAddCrop={handleAddCrop}
                  onAddProgressPhoto={handleAddProgressPhoto}
                  onPushToBidding={handlePushToBidding}
                />
              )}

              {activeTab === 'bidding' && (
                <BiddingModule
                  bids={bids}
                  onSimulateBid={handleSimulateBid}
                  onFinalizeBid={handleFinalizeBid}
                  onNavigateToCrops={() => setActiveTab('crops')}
                />
              )}

              {activeTab === 'trends' && (
                <PriceTrendsModule
                  farmerCrops={crops}
                  onNavigateToCrops={() => setActiveTab('crops')}
                />
              )}

              {activeTab === 'loans' && (
                <div className="module-container">
                  <div className="module-header-row">
                    <div>
                      <h2 className="module-title">🤝 Vendor Loan Status Module</h2>
                      <p className="module-desc">
                        Current Vendor Loan workflow status for your farm.
                      </p>
                    </div>
                    <button
                      id="btn-goto-vendor-loan-section"
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setMainSection('vendor_loan')}
                    >
                      Open Vendor Loan Application Section →
                    </button>
                  </div>

                  {activeVendorLoan ? (
                    <div className="loan-status-card">
                      <div className="loan-card-header">
                        <div>
                          <div className="loan-type-tag">🏢 {activeVendorLoan.lendingVendor || 'Apex Agri Traders'}</div>
                          <h3 className="loan-id-heading">Application ID: {activeVendorLoan.id}</h3>
                          <span className="loan-applied-date">Submitted on {activeVendorLoan.appliedDate}</span>
                        </div>
                        <div className="loan-amount-badge">
                          <div className="la-lbl">
                            {activeVendorLoan.status === 'Loan Amount Disbursed' ? 'Disbursed Amount' : 'Requested Amount'}
                          </div>
                          <div className="la-val">
                            ₹{(activeVendorLoan.approvedAmount || activeVendorLoan.requestedAmount)?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LIVE STATUS:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                          {activeVendorLoan.status}
                        </div>
                      </div>

                      <div className="user-info-box" style={{ margin: 0 }}>
                        <div className="info-row">
                          <span className="info-label">Pledged Land:</span>
                          <span className="info-val">{activeVendorLoan.landAcres} Acres ({activeVendorLoan.landSurveyNumber})</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Maximum Eligible:</span>
                          <span className="info-val">₹{activeVendorLoan.calculatedEligibleAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-module-card">
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🤝</div>
                      <h3>No Active Vendor Loan Application</h3>
                      <p>You have not applied for a Vendor Loan yet. Click below to open the Vendor Loan section.</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: '0.75rem' }}
                        onClick={() => setMainSection('vendor_loan')}
                      >
                        Apply for Vendor Loan (1 Acre = ₹50,000)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        )}

        {/* ========================================================
            SECTION 2: SELL CROP
            ======================================================== */}
        {mainSection === 'sell_crop' && (
          <SellCropSection user={user} />
        )}

        {/* ========================================================
            SECTION 3: VENDOR LOAN
            ======================================================== */}
        {mainSection === 'vendor_loan' && (
          <VendorLoanSection
            user={user}
            onLoanUpdated={(updatedLoan) => setActiveVendorLoan(updatedLoan)}
          />
        )}

        {/* ========================================================
            SECTION 4: RECOMMENDATIONS (NEW)
            ======================================================== */}
        {mainSection === 'recommendations' && (
          <RecommendationsSection />
        )}

        {/* ========================================================
            SECTION 5: TRANSACTIONS (NEW)
            ======================================================== */}
        {mainSection === 'transactions' && (
          <TransactionsSection user={user} />
        )}
      </div>
    </div>
  );
}
