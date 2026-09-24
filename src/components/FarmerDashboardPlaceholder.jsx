import React from 'react';

/**
 * Farmer Dashboard Placeholder
 * Note: Functional features (Crops, Bidding, Loans, etc.) are strictly reserved for subsequent steps.
 */
export default function FarmerDashboardPlaceholder({ user, onLogout }) {
  return (
    <div className="placeholder-layout">
      <nav className="placeholder-navbar">
        <div className="nav-brand">AgriTradeX</div>
        <div className="nav-user">
          <span className="user-badge">🌾 Farmer Account</span>
          <button
            id="btn-farmer-logout"
            type="button"
            className="btn btn-outline"
            style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="placeholder-body">
        <div className="placeholder-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌾</div>
          <h2>Farmer Dashboard</h2>
          <p>
            Welcome, <strong>{user?.fullName || 'Farmer'}</strong>! You have successfully logged in via mobile OTP.
          </p>

          <div className="user-info-box">
            <div className="info-row">
              <span className="info-label">Full Name:</span>
              <span className="info-val">{user?.fullName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mobile Number:</span>
              <span className="info-val">{user?.mobileNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Land Acres:</span>
              <span className="info-val">{user?.landAcres} Acres</span>
            </div>
            <div className="info-row">
              <span className="info-label">Survey Number:</span>
              <span className="info-val">{user?.landSurveyNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-val">{user?.village}, {user?.mandal}, {user?.district} - {user?.pincode}</span>
            </div>
          </div>

          <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <span>ℹ️</span>
            <span>
              <strong>Step 1 Complete:</strong> Authentication & Role Routing verified. Dashboard features will be added in upcoming steps.
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onLogout}
          >
            Back to Home / Logout
          </button>
        </div>
      </main>
    </div>
  );
}
