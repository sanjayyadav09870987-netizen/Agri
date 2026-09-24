import React, { useState, useEffect } from 'react';
import {
  getVendorDashboardData,
  completeLotPurchase,
  expireLotNow,
  resetVendorLotsDemo
} from '../../services/vendorLotsStore';
import {
  getVendorBuyingPreferences,
  hasVendorSetPreferences,
  getVendorNotifications,
  dismissVendorNotification
} from '../../services/vendorPreferencesStore';
import AllocatedLotsModule from './AllocatedLotsModule';
import PurchasedLotsModule from './PurchasedLotsModule';
import PendingLotsModule from './PendingLotsModule';
import LoanApplicationsModule from './LoanApplicationsModule';
import BuyingPreferencesSection from './BuyingPreferencesSection';
import VendorBiddingSection from './VendorBiddingSection';
import CropFinanceHubSection from './CropFinanceHubSection';
import VendorTransactionsSection from './VendorTransactionsSection';

export default function VendorDashboard({ user, onLogout }) {
  // Vendor Portal Menu Sections:
  // 1. 'dashboard' (Section 1 - Default)
  // 2. 'preferences' (Section 2 - Buying Preferences)
  // 3. 'bidding' (Section 3 - Bidding)
  // 4. 'crop_finance' (Section 4 - Crop Finance Hub)
  // 5. 'transactions' (Section 5 - Transactions)
  const [activeSection, setActiveSection] = useState('dashboard');

  // Dashboard Sub-module tabs: 'allocated' | 'purchased' | 'pending' | 'loans'
  const [activeModuleTab, setActiveModuleTab] = useState('allocated');

  // Vendor Lots Data State (Dashboard Section 1)
  const [dashboardData, setDashboardData] = useState({
    allocatedLots: [],
    purchasedTodayLots: [],
    pendingTodayLots: [],
    allocatedCount: 0,
    purchasedTodayCount: 0,
    pendingTodayCount: 0,
    loanApplicationsCount: 0
  });

  // Buying Preferences State (Section 2 & 3)
  const [vendorPreferences, setVendorPreferences] = useState(null);
  const [isPreferencesConfigured, setIsPreferencesConfigured] = useState(false);

  // In-app Notifications State
  const [notifications, setNotifications] = useState([]);

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Purchase Modal State
  const [selectedLotForPurchase, setSelectedLotForPurchase] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [utrReference, setUtrReference] = useState('');
  const [paymentMode, setPaymentMode] = useState('AgriTradeX Escrow RTGS Transfer');
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState('');
  const [purchaseError, setPurchaseError] = useState('');

  // Toast / feedback notification
  const [globalToast, setGlobalToast] = useState(null);

  // Load fresh data for currently logged-in vendor
  const loadData = () => {
    if (user) {
      const data = getVendorDashboardData(user);
      setDashboardData(data);

      const prefs = getVendorBuyingPreferences(user);
      setVendorPreferences(prefs);
      setIsPreferencesConfigured(hasVendorSetPreferences(user));

      const notifs = getVendorNotifications(user);
      setNotifications(notifs);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Live timer tick every second for real-time 24h countdowns and auto-expiry
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Check if any pending lot just crossed the 24h boundary
      if (user) {
        const freshData = getVendorDashboardData(user);
        setDashboardData((prev) => {
          if (
            prev.pendingTodayCount !== freshData.pendingTodayCount ||
            prev.allocatedCount !== freshData.allocatedCount
          ) {
            return freshData;
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  // Handle Menu Navigation with Preferences Guard for Bidding
  const handleNavClick = (section) => {
    if (section === 'bidding') {
      const hasPrefs = hasVendorSetPreferences(user);
      if (!hasPrefs) {
        setGlobalToast({
          type: 'warning',
          text: '⚠️ Please set your Buying Preferences (Distance, Crops, Quantity) before accessing Bidding.'
        });
        setActiveSection('preferences');
        setTimeout(() => setGlobalToast(null), 5000);
        return;
      }
    }
    setActiveSection(section);
  };

  // Handler: When Preferences are saved in Section 2, navigate to Section 3 Bidding
  const handlePreferencesSaved = () => {
    loadData();
    setActiveSection('bidding');
    setGlobalToast({
      type: 'success',
      text: '✓ Preferences saved! Now showing matching crop lots for bidding.'
    });
    setTimeout(() => setGlobalToast(null), 5000);
  };

  // Handler: Open Purchase Modal for a pending/allocated lot
  const handleOpenPurchaseModal = (lot) => {
    setSelectedLotForPurchase(lot);
    setPaymentAmount(String(lot.purchaseAmount || ''));
    setUtrReference('UTR' + Math.floor(100000000000 + Math.random() * 900000000000));
    setPaymentMode('AgriTradeX Escrow RTGS Transfer');
    setPurchaseSuccessMessage('');
    setPurchaseError('');
  };

  // Handler: Submit Purchase Transaction
  const handleConfirmPurchase = (e) => {
    e.preventDefault();
    if (!selectedLotForPurchase) return;

    setPurchaseError('');
    setPurchaseSuccessMessage('');

    const res = completeLotPurchase(selectedLotForPurchase.id, user, {
      purchaseAmount: Number(paymentAmount) || selectedLotForPurchase.purchaseAmount,
      utrReference: utrReference.trim(),
      paymentMode: paymentMode
    });

    if (res.success) {
      setPurchaseSuccessMessage(`🎉 ${res.message}`);
      loadData();

      // Show global toast
      setGlobalToast({
        type: 'success',
        text: `✓ Purchase completed for Lot ${selectedLotForPurchase.id} (${selectedLotForPurchase.cropName}). Moved to Purchased Lots Today!`
      });

      setTimeout(() => {
        setSelectedLotForPurchase(null);
        setPurchaseSuccessMessage('');
        // Automatically switch view to Purchased Lots Today tab to highlight the new purchase
        setActiveModuleTab('purchased');
      }, 1200);

      setTimeout(() => {
        setGlobalToast(null);
      }, 5000);
    } else {
      setPurchaseError(res.message || 'Failed to complete purchase.');
    }
  };

  // Handler: Simulate 24h expiration for testing
  const handleSimulateExpire = (lotId) => {
    const res = expireLotNow(lotId);
    if (res.success) {
      loadData();
      setGlobalToast({
        type: 'warning',
        text: `⏱️ Lot ${lotId} has reached the 24-hour limit without purchase. It has been automatically expired and removed from Pending & Purchased lists.`
      });
      setTimeout(() => {
        setGlobalToast(null);
      }, 5000);
    }
  };

  // Handler: Reset demo lots
  const handleResetDemo = () => {
    resetVendorLotsDemo(user);
    loadData();
    setGlobalToast({
      type: 'info',
      text: '🔄 Reset to initial 8 Allocated Lots (3 Purchased Today, 5 Pending Today).'
    });
    setTimeout(() => {
      setGlobalToast(null);
    }, 4000);
  };

  const handleDismissNotification = (notifId) => {
    const updated = dismissVendorNotification(user, notifId);
    setNotifications(updated || []);
  };

  const {
    allocatedLots,
    purchasedTodayLots,
    pendingTodayLots,
    allocatedCount,
    purchasedTodayCount,
    pendingTodayCount,
    loanApplicationsCount
  } = dashboardData;

  return (
    <div className="farmer-dashboard-layout vendor-theme">
      {/* Top Navbar */}
      <nav className="farmer-navbar vendor-navbar">
        <div className="nav-left">
          <span className="brand-logo">AgriTradeX</span>
          <span className="nav-portal-tag vendor-tag">
            🏢 Vendor Portal
          </span>
        </div>

        {/* ========================================================
            VENDOR PORTAL MENU: 
            1. Dashboard 
            2. Buying Preferences 
            3. Bidding 
            4. Crop Finance Hub (NEW SECTION 4)
            ======================================================== */}
        <div className="farmer-nav-center-menu" style={{ flexWrap: 'wrap' }}>
          <button
            id="nav-vendor-dashboard"
            type="button"
            className={`nav-section-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            📊 Dashboard
          </button>

          <button
            id="nav-vendor-preferences"
            type="button"
            className={`nav-section-btn ${activeSection === 'preferences' ? 'active' : ''}`}
            onClick={() => handleNavClick('preferences')}
          >
            ⚙️ Buying Preferences
            {!isPreferencesConfigured && <span className="menu-dot-warning" title="Setup Required">•</span>}
          </button>

          <button
            id="nav-vendor-bidding"
            type="button"
            className={`nav-section-btn ${activeSection === 'bidding' ? 'active' : ''}`}
            onClick={() => handleNavClick('bidding')}
          >
            ⚡ Bidding
          </button>

          <button
            id="nav-vendor-crop-finance"
            type="button"
            className={`nav-section-btn ${activeSection === 'crop_finance' ? 'active' : ''}`}
            onClick={() => handleNavClick('crop_finance')}
          >
            🤝 Crop Finance Hub
            {loanApplicationsCount > 0 && (
              <span className="nav-count-badge">{loanApplicationsCount}</span>
            )}
          </button>

          <button
            id="nav-vendor-transactions"
            type="button"
            className={`nav-section-btn ${activeSection === 'transactions' ? 'active' : ''}`}
            onClick={() => handleNavClick('transactions')}
          >
            💳 Transactions
          </button>
        </div>

        <div className="nav-right">
          <div className="farmer-profile-pill vendor-profile">
            <span className="farmer-avatar">🏢</span>
            <div className="farmer-meta">
              <span className="farmer-name">{user?.companyName || user?.fullName || 'Vendor Partner'}</span>
              <span className="farmer-sub">
                {user?.district || 'Trading Hub'} • {user?.companyId || 'ID: REG-101'}
              </span>
            </div>
          </div>

          <button
            id="btn-vendor-logout"
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Vendor Portal Content Area */}
      <div className="dashboard-content-wrap">
        {/* In-app Notifications Banner Area */}
        {notifications.length > 0 && (
          <div className="vendor-notifications-container">
            {notifications.slice(0, 2).map((n) => (
              <div
                key={n.id}
                className={`alert ${n.type === 'bid_accepted' ? 'alert-success' : 'alert-warning'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem'
                }}
              >
                <div>
                  <strong>{n.type === 'bid_accepted' ? '🎉 Bid Accepted:' : '✕ Bid Update:'}</strong> {n.text}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {n.type === 'bid_accepted' && activeSection !== 'dashboard' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => {
                        setActiveSection('dashboard');
                        setActiveModuleTab('allocated');
                      }}
                    >
                      View in Dashboard →
                    </button>
                  )}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
                    onClick={() => handleDismissNotification(n.id)}
                    title="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Toast Notification */}
        {globalToast && (
          <div
            className={`alert ${
              globalToast.type === 'success'
                ? 'alert-success'
                : globalToast.type === 'warning'
                ? 'alert-warning'
                : 'alert-info'
            }`}
            style={{ marginBottom: '1.25rem', animation: 'fadeIn 0.3s ease-out' }}
          >
            {globalToast.text}
          </div>
        )}

        {/* ========================================================
            SECTION 1: DASHBOARD (4 CORE MODULES)
            ======================================================== */}
        {activeSection === 'dashboard' && (
          <div>
            {/* Dashboard Header Bar */}
            <div className="vendor-dashboard-banner">
              <div className="vdb-info">
                <span className="vdb-tag">🏢 Vendor Trading Hub</span>
                <h1 className="vdb-title">Vendor Dashboard</h1>
                <p className="vdb-subtitle">
                  Live management of allocated crop lots, today's purchase transactions, 24-hour pending settlements, and loan applications.
                </p>
              </div>

              <div className="vdb-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ background: '#ffffff', fontSize: '0.8rem' }}
                  onClick={handleResetDemo}
                  title="Reset demo data to 8 allocated lots (3 purchased, 5 pending)"
                >
                  🔄 Reset Demo Lots (8 Lots)
                </button>
              </div>
            </div>

            {/* ========================================================
                4 MODERN DASHBOARD KPI CARDS
                1. Allocated Lots
                2. Purchased Lots Today
                3. Pending Lots Today
                4. Loan Applications
                ======================================================== */}
            <div className="kpi-summary-grid four-cards">
              {/* CARD 1: ALLOCATED LOTS */}
              <div
                id="kpi-card-allocated-lots"
                className={`kpi-card vendor-kpi ${activeModuleTab === 'allocated' ? 'active-kpi' : ''}`}
                onClick={() => setActiveModuleTab('allocated')}
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-icon-wrapper blue">
                  <span className="kpi-icon">📦</span>
                </div>
                <div className="kpi-text">
                  <span className="kpi-label">Allocated Lots</span>
                  <div className="kpi-val-row">
                    <span className="kpi-val-number">{allocatedCount}</span>
                    <span className="kpi-unit">Lots</span>
                  </div>
                  <span className="kpi-sub-desc">Total crop lots assigned</span>
                </div>
              </div>

              {/* CARD 2: PURCHASED LOTS TODAY */}
              <div
                id="kpi-card-purchased-lots"
                className={`kpi-card vendor-kpi ${activeModuleTab === 'purchased' ? 'active-kpi' : ''}`}
                onClick={() => setActiveModuleTab('purchased')}
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-icon-wrapper green">
                  <span className="kpi-icon">💳</span>
                </div>
                <div className="kpi-text">
                  <span className="kpi-label">Purchased Today</span>
                  <div className="kpi-val-row">
                    <span className="kpi-val-number text-success">{purchasedTodayCount}</span>
                    <span className="kpi-unit">Lots</span>
                  </div>
                  <span className="kpi-sub-desc">Completed transactions</span>
                </div>
              </div>

              {/* CARD 3: PENDING LOTS TODAY */}
              <div
                id="kpi-card-pending-lots"
                className={`kpi-card vendor-kpi ${activeModuleTab === 'pending' ? 'active-kpi' : ''}`}
                onClick={() => setActiveModuleTab('pending')}
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-icon-wrapper amber">
                  <span className="kpi-icon">⏱️</span>
                </div>
                <div className="kpi-text">
                  <span className="kpi-label">Pending Lots Today</span>
                  <div className="kpi-val-row">
                    <span className="kpi-val-number text-warning">{pendingTodayCount}</span>
                    <span className="kpi-unit">Lots</span>
                  </div>
                  <span className="kpi-sub-desc">Max 24h purchase window</span>
                </div>
              </div>

              {/* CARD 4: LOAN APPLICATIONS */}
              <div
                id="kpi-card-loan-apps"
                className={`kpi-card vendor-kpi ${activeModuleTab === 'loans' ? 'active-kpi' : ''}`}
                onClick={() => setActiveModuleTab('loans')}
                style={{ cursor: 'pointer' }}
              >
                <div className="kpi-icon-wrapper purple">
                  <span className="kpi-icon">🤝</span>
                </div>
                <div className="kpi-text">
                  <span className="kpi-label">Loan Applications</span>
                  <div className="kpi-val-row">
                    <span className="kpi-val-number text-purple">{loanApplicationsCount}</span>
                    <span className="kpi-unit">Apps</span>
                  </div>
                  <span className="kpi-sub-desc">Count only • PII Protected</span>
                </div>
              </div>
            </div>

            {/* 4 MODULES SUB-NAVIGATION TABS */}
            <div className="dashboard-tab-bar vendor-tab-bar">
              <button
                id="tab-module-1-allocated"
                type="button"
                className={`dashboard-tab ${activeModuleTab === 'allocated' ? 'active' : ''}`}
                onClick={() => setActiveModuleTab('allocated')}
              >
                📦 Module 1: Allocated Lots ({allocatedCount})
              </button>

              <button
                id="tab-module-2-purchased"
                type="button"
                className={`dashboard-tab ${activeModuleTab === 'purchased' ? 'active' : ''}`}
                onClick={() => setActiveModuleTab('purchased')}
              >
                💳 Module 2: Purchased Lots Today ({purchasedTodayCount})
              </button>

              <button
                id="tab-module-3-pending"
                type="button"
                className={`dashboard-tab ${activeModuleTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveModuleTab('pending')}
              >
                ⏱️ Module 3: Pending Lots to Purchase ({pendingTodayCount})
              </button>

              <button
                id="tab-module-4-loans"
                type="button"
                className={`dashboard-tab ${activeModuleTab === 'loans' ? 'active' : ''}`}
                onClick={() => setActiveModuleTab('loans')}
              >
                🤝 Module 4: Loan Applications ({loanApplicationsCount})
              </button>
            </div>

            {/* MODULE VIEWS */}
            <main className="module-view-body">
              {/* MODULE 1: ALLOCATED LOTS */}
              {activeModuleTab === 'allocated' && (
                <AllocatedLotsModule
                  lots={allocatedLots}
                  currentTime={currentTime}
                  onSelectLotForPurchase={handleOpenPurchaseModal}
                />
              )}

              {/* MODULE 2: PURCHASED LOTS TODAY */}
              {activeModuleTab === 'purchased' && (
                <PurchasedLotsModule
                  lots={purchasedTodayLots}
                />
              )}

              {/* MODULE 3: PENDING LOTS TO PURCHASE TODAY */}
              {activeModuleTab === 'pending' && (
                <PendingLotsModule
                  lots={pendingTodayLots}
                  currentTime={currentTime}
                  onSelectLotForPurchase={handleOpenPurchaseModal}
                  onSimulateExpire={handleSimulateExpire}
                />
              )}

              {/* MODULE 4: LOAN APPLICATIONS (COUNT ONLY, PRIVACY PROTECTED) */}
              {activeModuleTab === 'loans' && (
                <LoanApplicationsModule
                  count={loanApplicationsCount}
                  onNavigateToFinanceHub={() => setActiveSection('crop_finance')}
                />
              )}
            </main>
          </div>
        )}

        {/* ========================================================
            SECTION 2: BUYING PREFERENCES (DISTANCE, CROPS, QUANTITY)
            ======================================================== */}
        {activeSection === 'preferences' && (
          <BuyingPreferencesSection
            user={user}
            onSavedAndContinue={handlePreferencesSaved}
          />
        )}

        {/* ========================================================
            SECTION 3: BIDDING (MATCHING LOTS & 24H BIDDING)
            ======================================================== */}
        {activeSection === 'bidding' && (
          <VendorBiddingSection
            user={user}
            preferences={vendorPreferences}
            currentTime={currentTime}
            onNavigateToPreferences={() => setActiveSection('preferences')}
            onNavigateToDashboard={() => {
              setActiveSection('dashboard');
              setActiveModuleTab('allocated');
            }}
            onShowGlobalToast={(t) => {
              setGlobalToast(t);
              setTimeout(() => setGlobalToast(null), 5000);
              loadData();
            }}
          />
        )}

        {/* ========================================================
            SECTION 4: CROP FINANCE HUB (LOAN REVIEW & DOCUMENT VERIFICATION)
            ======================================================== */}
        {activeSection === 'crop_finance' && (
          <CropFinanceHubSection
            user={user}
            onShowGlobalToast={(t) => {
              setGlobalToast(t);
              setTimeout(() => setGlobalToast(null), 5000);
              loadData();
            }}
          />
        )}

        {/* ========================================================
            SECTION 5: TRANSACTIONS (PAY FARMER, CROP & PAYMENT RECEIPTS, COMPANY RECORD)
            ======================================================== */}
        {activeSection === 'transactions' && (
          <VendorTransactionsSection
            user={user}
            onShowGlobalToast={(t) => {
              setGlobalToast(t);
              setTimeout(() => setGlobalToast(null), 5000);
              loadData();
            }}
          />
        )}
      </div>

      {/* ========================================================
          PURCHASE PAYMENT MODAL
          ======================================================== */}
      {selectedLotForPurchase && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <span className="modal-sub-tag">AgriTradeX Trade Settlement</span>
                <h3>💳 Complete Purchase for {selectedLotForPurchase.cropName}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedLotForPurchase(null)}
              >
                ✕
              </button>
            </div>

            {/* Lot Summary in Modal */}
            <div className="modal-lot-summary">
              <img
                src={selectedLotForPurchase.cropPicture}
                alt={selectedLotForPurchase.cropName}
                className="mls-thumb"
              />
              <div className="mls-details">
                <div className="mls-title">
                  <strong>{selectedLotForPurchase.cropName}</strong> • {selectedLotForPurchase.quantity}
                </div>
                <div className="mls-sub">Lot ID: <strong>{selectedLotForPurchase.id}</strong></div>
                <div className="mls-sub">Location: {selectedLotForPurchase.cropAddress}</div>
                {selectedLotForPurchase.farmerDetails && (
                  <div className="mls-sub" style={{ color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                    Farmer: {selectedLotForPurchase.farmerDetails.fullName} (📞 {selectedLotForPurchase.farmerDetails.mobileNumber})
                  </div>
                )}
                <div className="mls-price">
                  Agreed Purchase Amount: <strong>₹{selectedLotForPurchase.purchaseAmount?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {purchaseError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                ⚠️ {purchaseError}
              </div>
            )}

            {purchaseSuccessMessage && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                {purchaseSuccessMessage}
              </div>
            )}

            <form onSubmit={handleConfirmPurchase}>
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Purchase Amount to Transfer (₹) *</label>
                  <input
                    id="input-vendor-purchase-amount"
                    type="number"
                    required
                    className="form-input"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <span className="field-hint">Exact allocated bid valuation</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Bank UTR / Transaction Reference Number *</label>
                  <input
                    id="input-vendor-purchase-utr"
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. UTR881920391823"
                    value={utrReference}
                    onChange={(e) => setUtrReference(e.target.value)}
                  />
                  <span className="field-hint">Bank transfer reference ID</span>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Payment Mode / Settlement Channel</label>
                  <select
                    className="form-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="AgriTradeX Escrow RTGS Transfer">AgriTradeX Escrow RTGS Transfer</option>
                    <option value="Direct Bank IMPS Transfer">Direct Bank IMPS Transfer</option>
                    <option value="Direct Bank NEFT Transfer">Direct Bank NEFT Transfer</option>
                    <option value="APMC Mandi e-Payment">APMC Mandi e-Payment</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedLotForPurchase(null)}
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-complete-purchase"
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#059669' }}
                >
                  ✓ Confirm Purchase & Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
