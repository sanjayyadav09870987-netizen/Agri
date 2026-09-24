import React from 'react';

export default function LoanApplicationsModule({ count = 0, onNavigateToFinanceHub }) {
  return (
    <div className="module-container">
      <div className="module-header-row">
        <div>
          <div className="module-badge-tag info">🤝 MODULE 4</div>
          <h2 className="module-title">Farmer Loan Applications</h2>
          <p className="module-desc">
            Overview of pre-harvest trade advance and crop finance applications submitted to your vendor account.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {onNavigateToFinanceHub && (
            <button
              id="btn-goto-crop-finance-hub"
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onNavigateToFinanceHub}
            >
              Open Section 4: Crop Finance Hub →
            </button>
          )}
          <div className="privacy-guarantee-pill">
            🔒 Strict Privacy Guard: Farmer PII (Aadhaar, PAN, Bank, Mobile) is hidden on this Dashboard
          </div>
        </div>
      </div>

      {/* Main Big Metric Card for Module 4 */}
      <div className="loan-count-summary-card">
        <div className="lcs-icon-wrap">
          <span className="lcs-icon">🤝</span>
        </div>

        <div className="lcs-content">
          <span className="lcs-label">Available Loan Applications</span>
          <div className="lcs-count-display">
            <span className="lcs-number">{count}</span>
            <span className="lcs-status-tag">
              {count > 0 ? `${count} Active Application(s)` : 'No Applications'}
            </span>
          </div>
          <p className="lcs-caption">
            {count > 0
              ? `There are currently ${count} farmer loan application(s) linked to your vendor trading hub.`
              : 'There are currently 0 farmer loan applications awaiting review.'}
          </p>

          {onNavigateToFinanceHub && (
            <div style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onNavigateToFinanceHub}
              >
                🔍 Review & Verify Applications in Crop Finance Hub →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Privacy & Compliance Notice */}
      <div className="privacy-compliance-box">
        <div className="pcb-header">
          <span>🛡️ Data Privacy & Information Security Policy</span>
          <span className="pcb-badge">Compliance Protected</span>
        </div>
        <div className="pcb-body">
          <p>
            In compliance with AgriTradeX Farmer Privacy Protection standards, all sensitive personal credentials including:
          </p>
          <ul className="pcb-list">
            <li>🔒 <strong>Aadhaar Number</strong></li>
            <li>🔒 <strong>PAN Number</strong></li>
            <li>🔒 <strong>Bank Account & IFSC details</strong></li>
            <li>🔒 <strong>Land Title Documents & Geo-photos</strong></li>
            <li>🔒 <strong>Personal Mobile Number</strong></li>
          </ul>
          <p style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Are strictly secured and hidden in this dashboard module. Detailed document inspection and verification are conducted inside Section 4: Crop Finance Hub.
          </p>
        </div>
      </div>
    </div>
  );
}
