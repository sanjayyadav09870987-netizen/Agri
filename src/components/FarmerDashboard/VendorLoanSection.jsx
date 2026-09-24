import React, { useState, useEffect } from 'react';
import {
  LOAN_RATE_PER_ACRE,
  SAMPLE_LAND_DOCUMENTS,
  calculateEligibleLoan,
  getFarmerActiveVendorLoan,
  submitVendorLoanApplication,
  acceptAgreementByFarmer
} from '../../services/vendorLoanStore';
import { PARTNER_VENDORS_FOR_LOANS } from '../../services/farmerData';

export default function VendorLoanSection({ user, onLoanUpdated }) {
  const [activeLoan, setActiveLoan] = useState(null);

  // Land & Loan Form State
  const [landAcres, setLandAcres] = useState(user?.landAcres || '3.0');
  const [landSurveyNumber, setLandSurveyNumber] = useState(user?.landSurveyNumber || 'SY-402/1A');
  const [landAddress, setLandAddress] = useState(
    user ? `${user.village || 'Rampur'}, ${user.mandal || 'Shamirpet'}, ${user.district || 'Medchal'} - ${user.pincode || '500078'}` : ''
  );
  const [customDocUrl, setCustomDocUrl] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('Apex Agri Traders Pvt Ltd');
  const [purpose, setPurpose] = useState('Pre-harvest seeds, bio-fertilizers, solar drip irrigation maintenance');

  // Step state
  const [hasCalculated, setHasCalculated] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Agreement Modal / View
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const loadActiveLoan = () => {
    if (user?.mobileNumber) {
      const loan = getFarmerActiveVendorLoan(user.mobileNumber);
      setActiveLoan(loan);
      if (onLoanUpdated) onLoanUpdated(loan);
    }
  };

  useEffect(() => {
    loadActiveLoan();
  }, [user?.mobileNumber]);

  // Land Details Validation check
  const isLandDetailsComplete =
    Boolean(landAcres) &&
    Number(landAcres) > 0 &&
    Boolean(landSurveyNumber.trim()) &&
    Boolean(landAddress.trim());

  // Calculated Max Eligible Amount
  const maxEligibleAmount = calculateEligibleLoan(landAcres);

  // Trigger Loan Calculation View
  const handleCalculateEligible = (e) => {
    e.preventDefault();
    setFormError('');
    if (!isLandDetailsComplete) {
      setFormError('Please fill in all required land details (Acres, Survey Number, and Address) before proceeding.');
      return;
    }
    setRequestedAmount(String(maxEligibleAmount));
    setHasCalculated(true);
  };

  // Submit Loan Application
  const handleSubmitLoan = (e) => {
    e.preventDefault();
    setFormError('');

    const reqAmt = Number(requestedAmount);
    if (!reqAmt || reqAmt <= 0) {
      setFormError('Please enter a valid loan amount.');
      return;
    }

    if (reqAmt > maxEligibleAmount) {
      setFormError(`Requested amount cannot exceed your maximum eligible amount of ₹${maxEligibleAmount.toLocaleString('en-IN')}.`);
      return;
    }

    const docs = [...SAMPLE_LAND_DOCUMENTS];
    if (customDocUrl.trim()) {
      docs.push({
        id: 'doc_custom_' + Date.now(),
        title: 'Farmer Uploaded Land Record',
        thumbUrl: customDocUrl.trim()
      });
    }

    const newLoan = submitVendorLoanApplication(user, {
      landAcres: Number(landAcres),
      landSurveyNumber: landSurveyNumber.trim(),
      landAddress: landAddress.trim(),
      landDocuments: docs,
      requestedAmount: reqAmt,
      selectedVendor,
      purpose
    });

    setActiveLoan(newLoan);
    if (onLoanUpdated) onLoanUpdated(newLoan);
    setSuccessMsg('🎉 Your Vendor Loan Application has been submitted to the Vendor Portal for review!');
    setHasCalculated(false);
  };

  // Farmer Accepts Loan Agreement
  const handleAcceptAgreement = () => {
    if (!activeLoan) return;
    const res = acceptAgreementByFarmer(activeLoan.id, user);
    if (res.success) {
      setActiveLoan(res.loan);
      if (onLoanUpdated) onLoanUpdated(res.loan);
      setShowAgreementModal(false);
      setSuccessMsg('✅ Agreement Accepted! Approved loan amount has been recorded as disbursed to your registered bank account.');
    }
  };

  return (
    <div className="sell-crop-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">🤝 Vendor Loan & Pre-Harvest Advances</h2>
          <p className="module-desc">
            Direct pre-harvest working capital provided by commodity vendors based on your land acreage (<strong>1 Acre = ₹50,000</strong>).
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{successMsg}</div>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => setSuccessMsg('')}>✕</button>
        </div>
      )}

      {/* ========================================================
          ACTIVE LOAN STATUS CARD & WORKFLOW (IF APPLIED)
          ======================================================== */}
      {activeLoan && (
        <div className="loan-status-card" style={{ marginBottom: '2rem' }}>
          <div className="loan-card-header">
            <div>
              <div className="loan-type-tag">🏢 Vendor Pre-Harvest Advance</div>
              <h3 className="loan-id-heading">Application ID: {activeLoan.id}</h3>
              <span className="loan-applied-date">
                Submitted on {activeLoan.appliedDate} • Partner Vendor: <strong>{activeLoan.lendingVendor || activeLoan.selectedVendor}</strong>
              </span>
            </div>

            <div className="loan-amount-badge">
              <div className="la-lbl">
                {activeLoan.status === 'Loan Amount Disbursed' ? 'Disbursed Amount' : 'Requested Amount'}
              </div>
              <div className="la-val">
                ₹{(activeLoan.approvedAmount || activeLoan.requestedAmount)?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Current Status Badge Banner */}
          <div style={{
            background: activeLoan.status === 'Loan Amount Disbursed' ? '#ecfdf5' : activeLoan.status === 'Loan Accepted' ? '#fffbeb' : activeLoan.status === 'Loan Rejected' ? '#fef2f2' : 'var(--bg-subtle)',
            border: `1.5px solid ${activeLoan.status === 'Loan Amount Disbursed' ? '#10b981' : activeLoan.status === 'Loan Accepted' ? '#f59e0b' : activeLoan.status === 'Loan Rejected' ? '#f87171' : 'var(--border-color)'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Current Workflow Stage:
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: activeLoan.status === 'Loan Amount Disbursed' ? '#047857' : activeLoan.status === 'Loan Accepted' ? '#b45309' : activeLoan.status === 'Loan Rejected' ? '#b91c1c' : 'var(--text-main)' }}>
                  {activeLoan.status === 'Loan Amount Disbursed' && '💰 '}
                  {activeLoan.status === 'Loan Accepted' && '📄 '}
                  {activeLoan.status === 'Loan Rejected' && '✕ '}
                  {activeLoan.status}
                </div>
              </div>

              {/* Action for Loan Accepted -> View / Accept Agreement */}
              {activeLoan.status === 'Loan Accepted' && (
                <button
                  id="btn-view-loan-agreement"
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#f59e0b', borderColor: '#d97706', color: '#78350f' }}
                  onClick={() => setShowAgreementModal(true)}
                >
                  📜 Review & Accept Agreement
                </button>
              )}

              {/* Action for Disbursed -> View Disbursal Voucher */}
              {activeLoan.status === 'Loan Amount Disbursed' && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowAgreementModal(true)}
                >
                  📜 View Signed Agreement & Voucher
                </button>
              )}
            </div>
          </div>

          {/* DISBURSAL VOUCHER BANNER (IF DISBURSED) */}
          {activeLoan.status === 'Loan Amount Disbursed' && activeLoan.disbursalInfo && (
            <div className="final-price-banner" style={{ marginBottom: '1.25rem', textAlign: 'left', background: '#f0fdf4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <strong style={{ fontSize: '1.1rem', color: '#166534' }}>
                  Loan Amount Disbursed: ₹{activeLoan.disbursalInfo.disbursedAmount?.toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#15803d', lineHeight: '1.5' }}>
                <div>• Credited to: <strong>{activeLoan.disbursalInfo.beneficiaryAccount}</strong></div>
                <div>• UTR Reference: <code>{activeLoan.disbursalInfo.utrReference}</code> ({activeLoan.disbursalInfo.disbursedDate})</div>
                <div>• Disbursing Vendor: <strong>{activeLoan.disbursalInfo.lendingVendor}</strong></div>
              </div>
            </div>
          )}

          {/* Details Overview */}
          <div className="user-info-box" style={{ margin: 0 }}>
            <div className="info-row">
              <span className="info-label">Pledged Land Area:</span>
              <span className="info-val">{activeLoan.landAcres} Acres (Max Limit: ₹{activeLoan.calculatedEligibleAmount?.toLocaleString('en-IN')})</span>
            </div>
            <div className="info-row">
              <span className="info-label">Land Survey Reference:</span>
              <span className="info-val">{activeLoan.landSurveyNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Land Location:</span>
              <span className="info-val">{activeLoan.landAddress}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Stated Utilization:</span>
              <span className="info-val">{activeLoan.purpose}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          LOAN APPLICATION FORM (LAND DETAILS + CALCULATION)
          ======================================================== */}
      {(!activeLoan || activeLoan.status === 'Loan Rejected' || activeLoan.status === 'No Loan Application') && (
        <div className="chart-card">
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              📝 Step 1: Provide Land Details & Calculate Eligible Amount
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Fill in your land particulars and documents to automatically compute your maximum eligible loan amount at <strong>₹50,000 per acre</strong>.
            </p>
          </div>

          {formError && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={hasCalculated ? handleSubmitLoan : handleCalculateEligible}>
            {/* 1. LAND DETAILS SECTION */}
            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">
                    Land Acres <span className="required-star">*</span>
                  </label>
                  <input
                    id="input-loan-land-acres"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    required
                    className="form-input"
                    placeholder="e.g. 3.0"
                    value={landAcres}
                    onChange={(e) => {
                      setLandAcres(e.target.value);
                      setHasCalculated(false);
                    }}
                  />
                  <span className="field-hint">Calculation Formula: 1 Acre = ₹50,000 credit limit</span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Land Survey Number <span className="required-star">*</span>
                  </label>
                  <input
                    id="input-loan-survey-no"
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. SY-402/1A"
                    value={landSurveyNumber}
                    onChange={(e) => {
                      setLandSurveyNumber(e.target.value);
                      setHasCalculated(false);
                    }}
                  />
                </div>
              </div>

              {/* Land Documents Upload / Preview */}
              <div className="form-group">
                <label className="form-label">Land Title Documents & Field Geo-Photos *</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  {SAMPLE_LAND_DOCUMENTS.map((doc) => (
                    <div key={doc.id} className="thumb-item" style={{ border: '1px solid var(--border-color)', padding: '4px', borderRadius: '8px' }}>
                      <img src={doc.thumbUrl} alt={doc.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.7rem', maxWidth: '80px', textAlign: 'center' }}>{doc.title}</span>
                    </div>
                  ))}
                </div>
                <input
                  type="url"
                  className="form-input"
                  placeholder="Optional: Enter custom document URL or scan link"
                  value={customDocUrl}
                  onChange={(e) => setCustomDocUrl(e.target.value)}
                />
              </div>

              {/* Land Address */}
              <div className="form-group">
                <label className="form-label">
                  Land / Farm Location Address <span className="required-star">*</span>
                </label>
                <textarea
                  id="input-loan-land-address"
                  rows={2}
                  required
                  className="form-input"
                  placeholder="Farm Village, Mandal, District, Pincode"
                  value={landAddress}
                  onChange={(e) => {
                    setLandAddress(e.target.value);
                    setHasCalculated(false);
                  }}
                />
              </div>
            </div>

            {/* BUTTON TO CALCULATE ELIGIBLE LOAN (SHOWN ONLY WHEN DETAILS FILLED) */}
            {!hasCalculated && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  id="btn-calculate-loan-eligibility"
                  type="submit"
                  disabled={!isLandDetailsComplete}
                  className="btn btn-primary"
                  style={{ opacity: isLandDetailsComplete ? 1 : 0.6 }}
                >
                  ⚡ Calculate Eligible Loan (Apply Loan)
                </button>
              </div>
            )}

            {/* ========================================================
                STEP 2 & 3: DISPLAY APPLICABLE AMOUNT & CHOOSE REQUEST
                ======================================================== */}
            {hasCalculated && (
              <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '12px', padding: '1.5rem', marginTop: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
                      Applicable Loan Calculation (1 Acre = ₹50,000)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857' }}>
                      Maximum Eligible Amount: ₹{maxEligibleAmount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#059669' }}>
                      Computed for <strong>{landAcres} Acres</strong> @ ₹{LOAN_RATE_PER_ACRE.toLocaleString('en-IN')} / acre
                    </div>
                  </div>
                  <span className="verified-badge" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    ✓ Land Verified
                  </span>
                </div>

                <div className="form-grid-2col" style={{ marginBottom: '1.25rem' }}>
                  {/* Farmer Chooses Loan Amount */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#065f46' }}>
                      Requested Loan Amount (₹) *
                    </label>
                    <input
                      id="input-requested-loan-amt"
                      type="number"
                      min="10000"
                      max={maxEligibleAmount}
                      step="5000"
                      required
                      className="form-input"
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(e.target.value)}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                      Enter any amount up to ₹{maxEligibleAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Select Lending Vendor Partner */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#065f46' }}>
                      Select Lending Vendor Partner *
                    </label>
                    <select
                      className="form-input"
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                    >
                      {PARTNER_VENDORS_FOR_LOANS.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ color: '#065f46' }}>
                    Loan Utilization Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Seeds, bio-fertilizers, solar drip irrigation & pre-harvest labour"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setHasCalculated(false)}
                  >
                    Edit Land Info
                  </button>
                  <button
                    id="btn-confirm-apply-vendor-loan"
                    type="submit"
                    className="btn btn-primary"
                  >
                    🚀 Apply Loan (Submit to Vendor)
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL: FORMAL LOAN AGREEMENT (DISPLAYED ON VENDOR ACCEPT)
          ======================================================== */}
      {showAgreementModal && activeLoan && activeLoan.agreement && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Official Contract Document • Agreement ID: {activeLoan.agreement.agreementId}
                </span>
                <h3 style={{ margin: 0 }}>📜 Vendor Pre-Harvest Loan Agreement</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAgreementModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem', maxHeight: '360px', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                  AGRICULTURAL PRE-HARVEST TRADE ADVANCE AGREEMENT
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Executed on {activeLoan.agreement.generatedDate} • AgriTradeX Exchange
                </div>
              </div>

              {/* CRUCIAL MANDATORY PROJECT RULE HIGHLIGHT */}
              <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                  ⚠️ MANDATORY PROJECT RULE & OBLIGATION:
                </div>
                <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.95rem' }}>
                  "{activeLoan.agreement.mandatoryRule}"
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.6' }}>
                {activeLoan.agreement.clauses.map((clause, idx) => (
                  <p key={idx} style={{ marginBottom: '0.75rem' }}>
                    {clause}
                  </p>
                ))}
              </div>

              {/* Agreement summary parameters */}
              <div className="user-info-box" style={{ background: '#ffffff', border: '1px solid #cbd5e1', marginTop: '1rem', marginBottom: 0 }}>
                <div className="info-row">
                  <span className="info-label">Approved Advance Amount:</span>
                  <span className="info-val" style={{ color: '#047857' }}>
                    ₹{activeLoan.agreement.approvedLoanAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Interest Rate:</span>
                  <span className="info-val">{activeLoan.agreement.interestRate}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Lending Vendor Partner:</span>
                  <span className="info-val">{activeLoan.agreement.lendingVendor}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Borrower Farmer:</span>
                  <span className="info-val">{activeLoan.agreement.borrowerFarmer} ({activeLoan.agreement.farmerLandSurvey})</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAgreementModal(false)}
              >
                Close
              </button>

              {/* Show Accept Agreement button ONLY if not accepted yet */}
              {!activeLoan.agreement.isAcceptedByFarmer ? (
                <button
                  id="btn-farmer-accept-agreement"
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAcceptAgreement}
                >
                  ✓ Accept Agreement & Disburse Funds
                </button>
              ) : (
                <span className="verified-badge" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  ✓ Agreement Signed & Locked ({activeLoan.agreement.signatureHash?.slice(0, 16)})
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
