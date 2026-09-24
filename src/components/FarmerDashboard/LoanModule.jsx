import React, { useState } from 'react';
import { PARTNER_VENDORS_FOR_LOANS } from '../../services/farmerData';

export default function LoanModule({ loans = [], onApplyLoan, user }) {
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [loanForm, setLoanForm] = useState({
    loanType: 'Pre-Harvest Crop Advance Vendor Loan',
    lendingVendor: 'Apex Agri Traders Pvt Ltd',
    amount: '150000',
    tenureMonths: '6',
    repaymentMode: 'Auto-settled from 24h Crop Bidding Sale',
    purpose: 'Crop inputs, seeds, bio-fertilizers & pre-harvest labour',
    landSurveyNumber: user?.landSurveyNumber || ''
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!loanForm.amount) return;

    onApplyLoan({
      ...loanForm,
      landSurveyNumber: loanForm.landSurveyNumber || user?.landSurveyNumber || 'SY-102/4B'
    });

    setShowApplyModal(false);
  };

  const activeLoans = loans;

  return (
    <div className="module-container">
      {/* Module Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">🤝 Vendor Loans & Pre-Harvest Advances</h2>
          <p className="module-desc">
            Request working capital and input advances directly from verified Vendors & Trade Buyers, settled automatically against your crop harvests.
          </p>
        </div>
        <button
          id="btn-apply-vendor-loan-top"
          type="button"
          className="btn btn-primary"
          onClick={() => setShowApplyModal(true)}
        >
          + Apply for Vendor Loan
        </button>
      </div>

      {/* CONDITIONAL LOAN STATUS DISPLAY */}
      {activeLoans.length === 0 ? (
        /* State when farmer has NOT applied for any vendor loan */
        <div className="empty-module-card">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🤝</div>
          <h3>No Active Vendor Loan Application Status</h3>
          <p style={{ maxWidth: '490px', margin: '0.5rem auto 1.5rem auto', color: 'var(--text-muted)' }}>
            You have not requested any vendor loans or crop advances yet. You can apply for pre-harvest capital and input financing from registered commodity vendors on AgriTradeX.
          </p>
          <button
            id="btn-apply-vendor-loan-empty"
            type="button"
            className="btn btn-primary"
            onClick={() => setShowApplyModal(true)}
          >
            Apply for Vendor Loan Now
          </button>
        </div>
      ) : (
        /* State when farmer HAS active vendor loan application(s) */
        <div className="loans-list-container">
          {activeLoans.map((loan) => (
            <div key={loan.id} className="loan-status-card">
              <div className="loan-card-header">
                <div>
                  <div className="loan-type-tag">🏢 {loan.loanType}</div>
                  <h3 className="loan-id-heading">Vendor Loan ID: {loan.id}</h3>
                  <span className="loan-applied-date">
                    Requested on {loan.appliedDate} • Lending Partner: <strong>{loan.lendingVendor}</strong>
                  </span>
                </div>

                <div className="loan-amount-badge">
                  <div className="la-lbl">Requested Advance</div>
                  <div className="la-val">₹{Number(loan.amount).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="loan-stepper-wrap">
                <div className="stepper-title">Vendor Review & Disbursement Progress</div>
                <div className="stepper-steps">
                  {loan.steps?.map((step, idx) => {
                    const isDone = idx <= loan.currentStepIndex;
                    const isCurrent = idx === loan.currentStepIndex;

                    return (
                      <div
                        key={idx}
                        className={`step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        <div className="step-circle">
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="step-content">
                          <span className="step-label">{step.title}</span>
                          <span className="step-date">{step.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details breakdown */}
              <div className="user-info-box" style={{ marginTop: '1.25rem', marginBottom: '0' }}>
                <div className="info-row">
                  <span className="info-label">Lending Vendor Partner:</span>
                  <span className="info-val">{loan.lendingVendor}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Repayment & Settlement:</span>
                  <span className="info-val text-success">{loan.repaymentMode || 'Auto-settled via Crop Bidding'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Land Survey Reference:</span>
                  <span className="info-val">{loan.landSurveyNumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Advance Purpose:</span>
                  <span className="info-val">{loan.purpose}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Apply for Vendor Loan */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>🤝 Apply for Vendor Loan / Advance</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowApplyModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Lending Vendor Partner *</label>
                  <select
                    className="form-input"
                    value={loanForm.lendingVendor}
                    onChange={(e) => setLoanForm({ ...loanForm, lendingVendor: e.target.value })}
                  >
                    {PARTNER_VENDORS_FOR_LOANS.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor Loan Type *</label>
                  <select
                    className="form-input"
                    value={loanForm.loanType}
                    onChange={(e) => setLoanForm({ ...loanForm, loanType: e.target.value })}
                  >
                    <option value="Pre-Harvest Crop Advance Vendor Loan">
                      Pre-Harvest Crop Advance (Linked to 24h Bidding)
                    </option>
                    <option value="Agri Inputs & Seeds Vendor Credit">
                      Agri Inputs, Seeds & Fertilizer Credit
                    </option>
                    <option value="Drip Irrigation & Equipment Vendor Advance">
                      Drip Irrigation & Equipment Financing
                    </option>
                    <option value="Post-Harvest Commodity Storage Advance">
                      Post-Harvest Commodity Storage Advance
                    </option>
                  </select>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Requested Advance Amount (₹) *</label>
                    <input
                      type="number"
                      min="10000"
                      step="5000"
                      required
                      className="form-input"
                      value={loanForm.amount}
                      onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Repayment Duration (Months) *</label>
                    <select
                      className="form-input"
                      value={loanForm.tenureMonths}
                      onChange={(e) => setLoanForm({ ...loanForm, tenureMonths: e.target.value })}
                    >
                      <option value="3">3 Months (Short Term Advance)</option>
                      <option value="6">6 Months (Harvest Season)</option>
                      <option value="12">12 Months (Annual Cycle)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Settlement Mode *</label>
                  <select
                    className="form-input"
                    value={loanForm.repaymentMode}
                    onChange={(e) => setLoanForm({ ...loanForm, repaymentMode: e.target.value })}
                  >
                    <option value="Auto-settled from 24h Crop Bidding Sale">
                      Auto-settled from 24h Crop Bidding proceeds (Recommended)
                    </option>
                    <option value="Direct Vendor Bank Transfer">
                      Direct Vendor Bank Transfer
                    </option>
                    <option value="Commodity Barter / Direct Crop Delivery">
                      Direct Crop Lot Handover to Vendor
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Land Survey Reference</label>
                  <input
                    type="text"
                    className="form-input"
                    value={loanForm.landSurveyNumber}
                    onChange={(e) => setLoanForm({ ...loanForm, landSurveyNumber: e.target.value })}
                    placeholder="e.g. SY-402/1A"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Advance Utilization Purpose *</label>
                  <textarea
                    rows={2}
                    required
                    className="form-input"
                    value={loanForm.purpose}
                    onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                    placeholder="Describe how the vendor advance funds will be utilized for crop production"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Vendor Loan Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
