import React, { useState, useEffect } from 'react';
import {
  getVendorLoanApplications,
  verifyLoanDocuments,
  reviewLoanByVendor
} from '../../services/vendorLoanStore';

export default function CropFinanceHubSection({ user, onShowGlobalToast }) {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'accepted' | 'rejected'

  // Document verification modal / state for selected application
  const [isDocVerified, setIsDocVerified] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [docFeedbackMsg, setDocFeedbackMsg] = useState(null);

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Land documentation / credit limit criteria not met.');

  // Fullscreen document preview lightbox
  const [activeDocPreview, setActiveDocPreview] = useState(null);

  const loadLoans = () => {
    if (user) {
      const data = getVendorLoanApplications(user);
      setLoans(data);
      if (selectedLoan) {
        const refreshed = data.find((l) => l.id === selectedLoan.id);
        if (refreshed) {
          setSelectedLoan(refreshed);
          setIsDocVerified(refreshed.documentVerificationStatus === 'verified');
        }
      }
    }
  };

  useEffect(() => {
    loadLoans();
  }, [user]);

  // Open inspection drawer / modal for a loan application
  const handleOpenReview = (loan) => {
    setSelectedLoan(loan);
    setIsDocVerified(loan.documentVerificationStatus === 'verified');
    setVerificationNotes(loan.verificationNotes || '');
    setDocFeedbackMsg(null);
  };

  // Close review
  const handleCloseReview = () => {
    setSelectedLoan(null);
    setDocFeedbackMsg(null);
  };

  // Toggle / Save Document Verification
  const handleToggleDocVerification = (newVerifiedState) => {
    if (!selectedLoan) return;
    const res = verifyLoanDocuments(selectedLoan.id, newVerifiedState, verificationNotes);
    if (res.success) {
      setIsDocVerified(newVerifiedState);
      setDocFeedbackMsg({
        type: 'success',
        text: res.message
      });
      loadLoans();

      if (onShowGlobalToast) {
        onShowGlobalToast({
          type: 'success',
          text: newVerifiedState
            ? `✓ Documents for Application ${selectedLoan.id} (${selectedLoan.farmerDetails.fullName}) marked as VERIFIED.`
            : `Documents for Application ${selectedLoan.id} marked as NOT VERIFIED.`
        });
      }
    }
  };

  // Vendor Accepts Loan
  const handleAcceptLoan = () => {
    if (!selectedLoan) return;

    if (!isDocVerified && selectedLoan.documentVerificationStatus !== 'verified') {
      setDocFeedbackMsg({
        type: 'error',
        text: '⚠️ Mandatory: You must complete Document Verification (mark "Documents Verified") before approving this loan.'
      });
      return;
    }

    const res = reviewLoanByVendor(selectedLoan.id, 'accept', user, {
      approvedAmount: selectedLoan.requestedAmount,
      interestRate: '1.0% per month (Subsidized Pre-Harvest Trade Advance)'
    });

    if (res.success) {
      loadLoans();
      setDocFeedbackMsg({
        type: 'success',
        text: res.message
      });

      if (onShowGlobalToast) {
        onShowGlobalToast({
          type: 'success',
          text: `🎉 Loan ${selectedLoan.id} accepted for ${selectedLoan.farmerDetails.fullName}! Formal pre-harvest agreement transmitted to Farmer Portal.`
        });
      }
    } else {
      setDocFeedbackMsg({
        type: 'error',
        text: res.message
      });
    }
  };

  // Vendor Confirms Rejection
  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    const res = reviewLoanByVendor(selectedLoan.id, 'reject', user, {
      reason: rejectionReason.trim()
    });

    if (res.success) {
      loadLoans();
      setShowRejectModal(false);
      setDocFeedbackMsg({
        type: 'warning',
        text: res.message
      });

      if (onShowGlobalToast) {
        onShowGlobalToast({
          type: 'warning',
          text: `✕ Loan Application ${selectedLoan.id} rejected. Farmer has been notified.`
        });
      }
    }
  };

  // Filtered applications list
  const filteredLoans = loans.filter((loan) => {
    if (filterStatus === 'pending') {
      return (
        loan.status === 'Loan Application Submitted' ||
        loan.status === 'Under Vendor Review'
      );
    }
    if (filterStatus === 'accepted') {
      return (
        loan.status === 'Loan Accepted' ||
        loan.status === 'Agreement Pending' ||
        loan.status === 'Agreement Accepted' ||
        loan.status === 'Loan Amount Disbursed'
      );
    }
    if (filterStatus === 'rejected') {
      return loan.status === 'Loan Rejected';
    }
    return true;
  });

  return (
    <div className="finance-hub-container">
      {/* Header Card */}
      <div className="finance-header-card">
        <div className="fhc-info">
          <span className="fhc-tag">🤝 Section 4</span>
          <h1 className="fhc-title">Crop Finance Hub</h1>
          <p className="fhc-desc">
            Review farmer pre-harvest trade advance requests, perform mandatory land document verification, and generate binding crop sale agreements (<strong>1 Acre = ₹50,000 credit limit</strong>).
          </p>
        </div>
        <div className="fhc-stats">
          <div className="fhc-stat-box">
            <span className="fhc-stat-lbl">Total Applications</span>
            <span className="fhc-stat-val">{loans.length}</span>
          </div>
          <div className="fhc-stat-box highlight">
            <span className="fhc-stat-lbl">Pending Review</span>
            <span className="fhc-stat-val">
              {loans.filter((l) => l.status === 'Loan Application Submitted' || l.status === 'Under Vendor Review').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Privacy Guarantee */}
      <div className="finance-filter-bar">
        <div className="ffb-buttons">
          <button
            id="tab-finance-all"
            type="button"
            className={`ffb-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Applications ({loans.length})
          </button>
          <button
            id="tab-finance-pending"
            type="button"
            className={`ffb-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Awaiting Review ({loans.filter((l) => l.status === 'Loan Application Submitted' || l.status === 'Under Vendor Review').length})
          </button>
          <button
            id="tab-finance-accepted"
            type="button"
            className={`ffb-btn ${filterStatus === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('accepted')}
          >
            Accepted / Disbursed ({loans.filter((l) => l.status === 'Loan Accepted' || l.status === 'Agreement Pending' || l.status === 'Agreement Accepted' || l.status === 'Loan Amount Disbursed').length})
          </button>
          <button
            id="tab-finance-rejected"
            type="button"
            className={`ffb-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected ({loans.filter((l) => l.status === 'Loan Rejected').length})
          </button>
        </div>

        <div className="privacy-guarantee-pill">
          🔒 Encrypted Credit Portal: Land documents accessible only to authorized vendor
        </div>
      </div>

      {/* Main Loan Applications List View */}
      {filteredLoans.length === 0 ? (
        <div className="empty-module-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🤝</div>
          <h3>No Loan Applications Available</h3>
          <p>
            When farmers submit pre-harvest trade advance requests from their portal, they will appear here for document verification and approval.
          </p>
        </div>
      ) : (
        <div className="loan-applications-table-card">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Farmer Name</th>
                <th>Land Particulars</th>
                <th>Requested Advance</th>
                <th>Eligible Limit</th>
                <th>Applied Date</th>
                <th>Doc Verification</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => {
                const isPending =
                  loan.status === 'Loan Application Submitted' ||
                  loan.status === 'Under Vendor Review';
                const isAccepted =
                  loan.status === 'Loan Accepted' ||
                  loan.status === 'Agreement Pending' ||
                  loan.status === 'Agreement Accepted' ||
                  loan.status === 'Loan Amount Disbursed';
                const isDisbursed = loan.status === 'Loan Amount Disbursed';
                const isRejected = loan.status === 'Loan Rejected';
                const isVerified = loan.documentVerificationStatus === 'verified';

                return (
                  <tr key={loan.id} className="finance-table-row">
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#1e40af' }}>
                        {loan.id}
                      </span>
                    </td>

                    <td>
                      <div className="farmer-name-cell">
                        <strong>{loan.farmerDetails.fullName}</strong>
                        <span className="cell-sub">{loan.farmerDetails.village}, {loan.farmerDetails.district}</span>
                      </div>
                    </td>

                    <td>
                      <div className="land-cell">
                        <strong>{loan.landAcres} Acres</strong>
                        <span className="cell-sub">Survey: {loan.landSurveyNumber}</span>
                      </div>
                    </td>

                    <td>
                      <span className="loan-req-amount">
                        ₹{loan.requestedAmount?.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <span className="loan-elig-amount">
                        ₹{loan.calculatedEligibleAmount?.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <span className="cell-date">📅 {loan.appliedDate}</span>
                    </td>

                    <td>
                      <span className={`doc-verify-pill ${isVerified ? 'verified' : 'pending'}`}>
                        {isVerified ? '✓ Verified' : '⏱️ Not Verified'}
                      </span>
                    </td>

                    <td>
                      <span className={`loan-stage-badge ${isDisbursed ? 'disbursed' : isAccepted ? 'accepted' : isRejected ? 'rejected' : 'pending'}`}>
                        {isDisbursed && '💰 Disbursed'}
                        {isAccepted && !isDisbursed && '📄 Agreement Sent'}
                        {isRejected && '✕ Rejected'}
                        {isPending && '⏱️ Pending Review'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        id={`btn-review-loan-${loan.id}`}
                        type="button"
                        className={`btn btn-sm ${isPending ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleOpenReview(loan)}
                      >
                        {isPending ? '🔍 Verify & Review →' : '👁️ View Application'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          DETAILED LOAN APPLICATION INSPECTION & VERIFICATION MODAL
          ======================================================== */}
      {selectedLoan && (
        <div className="modal-overlay">
          <div className="modal-card modal-large" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <div>
                <span className="modal-sub-tag">AgriTradeX Pre-Harvest Credit Hub</span>
                <h3>🔍 Loan Application Review: {selectedLoan.id}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={handleCloseReview}
              >
                ✕
              </button>
            </div>

            {docFeedbackMsg && (
              <div className={`alert ${docFeedbackMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
                {docFeedbackMsg.text}
              </div>
            )}

            {/* Application Overview Grid */}
            <div className="loan-review-overview-grid">
              <div className="lro-box">
                <span className="lro-lbl">Farmer Applicant</span>
                <span className="lro-val">{selectedLoan.farmerDetails.fullName}</span>
                <span className="lro-sub">📞 {selectedLoan.farmerDetails.mobileNumber}</span>
              </div>

              <div className="lro-box">
                <span className="lro-lbl">Land Acreage & Rate</span>
                <span className="lro-val">{selectedLoan.landAcres} Acres</span>
                <span className="lro-sub">Credit Limit: ₹50,000 / Acre</span>
              </div>

              <div className="lro-box">
                <span className="lro-lbl">Requested Advance</span>
                <span className="lro-val text-primary">₹{selectedLoan.requestedAmount?.toLocaleString('en-IN')}</span>
                <span className="lro-sub">Max Limit: ₹{selectedLoan.calculatedEligibleAmount?.toLocaleString('en-IN')}</span>
              </div>

              <div className="lro-box">
                <span className="lro-lbl">Survey Number & Village</span>
                <span className="lro-val font-mono">{selectedLoan.landSurveyNumber}</span>
                <span className="lro-sub">{selectedLoan.farmerDetails.village}, {selectedLoan.farmerDetails.district}</span>
              </div>
            </div>

            {/* Stated Purpose & Farm Address */}
            <div className="user-info-box" style={{ marginBottom: '1.25rem' }}>
              <div className="info-row">
                <span className="info-label">Stated Working Capital Purpose:</span>
                <span className="info-val">{selectedLoan.purpose}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Land Plot Geographic Address:</span>
                <span className="info-val">{selectedLoan.landAddress}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Selected Lending Partner:</span>
                <span className="info-val"><strong>{selectedLoan.lendingVendor || selectedLoan.selectedVendor}</strong></span>
              </div>
            </div>

            {/* ========================================================
                DOCUMENT VERIFICATION AREA (MANDATORY BEFORE APPROVAL)
                ======================================================== */}
            <div className="doc-verification-container">
              <div className="dvc-header">
                <div className="dvc-title-wrap">
                  <span className="dvc-icon">📄</span>
                  <div>
                    <h4>Document Verification Area</h4>
                    <p className="dvc-subtitle">
                      Inspect submitted Land Passbooks, Satellite/Field Geo-Photos, and Title Records. <strong>Verification is strictly required before loan approval.</strong>
                    </p>
                  </div>
                </div>

                <div className="dvc-status-badge">
                  <span>Current Status:</span>
                  <strong className={isDocVerified ? 'text-success' : 'text-warning'}>
                    {isDocVerified ? '✓ Documents Verified' : '⏱️ Not Verified'}
                  </strong>
                </div>
              </div>

              {/* Uploaded Document Cards */}
              <div className="doc-cards-grid">
                {selectedLoan.landDocuments?.map((doc, idx) => (
                  <div key={idx} className="doc-card-item">
                    <div className="dci-thumb-wrap" onClick={() => setActiveDocPreview(doc)}>
                      <img src={doc.thumbUrl} alt={doc.title} className="dci-img" />
                      <span className="dci-zoom-hint">🔍 View Full Record</span>
                    </div>
                    <div className="dci-info">
                      <span className="dci-type">{doc.documentType || 'Land Record'}</span>
                      <strong className="dci-title">{doc.title}</strong>
                      <span className="dci-desc">{doc.description || `Verified field documentation for survey ${selectedLoan.landSurveyNumber}`}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verification Toggle & Notes Area */}
              <div className="dvc-actions-box">
                <div className="dvc-options-row">
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Vendor Verification Decision:
                  </span>

                  <div className="dvc-radio-group">
                    <label className={`dvc-radio-pill ${isDocVerified ? 'active-verified' : ''}`}>
                      <input
                        type="radio"
                        name="docVerification"
                        checked={isDocVerified}
                        onChange={() => handleToggleDocVerification(true)}
                      />
                      <span>✓ Documents Verified</span>
                    </label>

                    <label className={`dvc-radio-pill ${!isDocVerified ? 'active-unverified' : ''}`}>
                      <input
                        type="radio"
                        name="docVerification"
                        checked={!isDocVerified}
                        onChange={() => handleToggleDocVerification(false)}
                      />
                      <span>✕ Documents Not Verified</span>
                    </label>
                  </div>
                </div>

                {/* Verification Notice */}
                {!isDocVerified && (
                  <div className="alert alert-warning" style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
                    ⚠️ Document verification must be marked as <strong>"Documents Verified"</strong> before the "Accept Loan" button is unlocked.
                  </div>
                )}
              </div>
            </div>

            {/* Generated Agreement Summary (If already accepted) */}
            {selectedLoan.agreement && (
              <div className="agreement-preview-box">
                <div className="apb-header">
                  <span>📜 Pre-Harvest Loan Agreement: <strong>{selectedLoan.agreement.agreementId}</strong></span>
                  <span className="verified-badge">
                    {selectedLoan.agreement.isAcceptedByFarmer ? '✓ Farmer Accepted' : '⏳ Awaiting Farmer Acceptance'}
                  </span>
                </div>
                <div className="apb-body">
                  <p>• <strong>Approved Advance:</strong> ₹{selectedLoan.agreement.approvedLoanAmount?.toLocaleString('en-IN')} @ {selectedLoan.agreement.interestRate}</p>
                  <p>• <strong>Mandatory Rule:</strong> <em>"{selectedLoan.agreement.mandatoryRule}"</em></p>
                  <p>• <strong>Tenure:</strong> 6 Months linked to harvest crop auction settlement.</p>
                </div>
              </div>
            )}

            {/* Rejection Details (If rejected) */}
            {selectedLoan.status === 'Loan Rejected' && (
              <div className="rejected-confirmation-box" style={{ margin: '1rem 0' }}>
                <strong>✕ Application Rejected by Vendor:</strong> {selectedLoan.rejectionReason || 'Criteria not met.'}
              </div>
            )}

            {/* Disbursal Voucher (If disbursed) */}
            {selectedLoan.disbursalInfo && (
              <div className="disbursal-voucher-box">
                <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '0.25rem' }}>
                  💰 Bank Disbursal Voucher Recorded
                </div>
                <div style={{ fontSize: '0.825rem', color: '#047857' }}>
                  Reference UTR: <strong>{selectedLoan.disbursalInfo.utrReference}</strong> • Disbursed on {selectedLoan.disbursalInfo.disbursedDate}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseReview}
              >
                Close View
              </button>

              {/* Action Buttons for Pending Review */}
              {(selectedLoan.status === 'Loan Application Submitted' || selectedLoan.status === 'Under Vendor Review') && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    id="btn-reject-loan-trigger"
                    type="button"
                    className="btn btn-outline"
                    style={{ borderColor: '#f87171', color: '#dc2626' }}
                    onClick={() => setShowRejectModal(true)}
                  >
                    ✕ Reject Loan
                  </button>

                  <button
                    id="btn-accept-loan-submit"
                    type="button"
                    className={`btn ${isDocVerified ? 'btn-primary' : 'btn-disabled'}`}
                    style={{
                      backgroundColor: isDocVerified ? '#059669' : '#94a3b8',
                      cursor: isDocVerified ? 'pointer' : 'not-allowed'
                    }}
                    title={isDocVerified ? 'Approve loan and send agreement to farmer' : 'Verify documents above to enable approval'}
                    onClick={handleAcceptLoan}
                    disabled={!isDocVerified}
                  >
                    ✓ Accept Loan & Issue Agreement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          REJECTION REASON MODAL
          ======================================================== */}
      {showRejectModal && selectedLoan && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>✕ Reject Loan Application</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Provide a reason for rejecting the loan application for <strong>{selectedLoan.farmerDetails.fullName}</strong> (Survey: {selectedLoan.landSurveyNumber}).
              </p>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Rejection Reason *</label>
                <textarea
                  id="textarea-rejection-reason"
                  rows={3}
                  required
                  className="form-input"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-reject-loan"
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DOCUMENT LIGHTBOX / PREVIEW
          ======================================================== */}
      {activeDocPreview && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setActiveDocPreview(null)}>
          <div className="modal-card" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-sub-tag">{activeDocPreview.documentType || 'Submitted Land Record'}</span>
                <h3>{activeDocPreview.title}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveDocPreview(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', maxHeight: '450px', background: '#0f172a', textAlign: 'center' }}>
              <img
                src={activeDocPreview.thumbUrl}
                alt={activeDocPreview.title}
                style={{ width: '100%', maxHeight: '450px', objectFit: 'contain' }}
              />
            </div>

            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {activeDocPreview.description || 'Verified agricultural survey documentation submitted with loan application.'}
            </p>

            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveDocPreview(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
