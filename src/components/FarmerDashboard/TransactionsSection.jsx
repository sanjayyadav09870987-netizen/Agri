import React, { useState, useEffect } from 'react';
import {
  getFarmerBankDetails,
  saveFarmerBankDetails,
  getFarmerTransactions,
  maskAccountNumber
} from '../../services/transactionsStore';

export default function TransactionsSection({ user }) {
  const [bankDetails, setBankDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Bank Form State
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [branch, setBranch] = useState('Main Agri Branch, Medchal');
  const [bankFormError, setBankFormError] = useState('');
  const [bankSuccessMsg, setBankSuccessMsg] = useState('');

  // Modals for Viewing Receipts
  const [selectedCropSaleReceipt, setSelectedCropSaleReceipt] = useState(null);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState(null);

  const loadData = () => {
    if (user?.mobileNumber) {
      const bank = getFarmerBankDetails(user.mobileNumber);
      setBankDetails(bank);
      if (bank) {
        const txns = getFarmerTransactions(user.mobileNumber);
        setTransactions(txns);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.mobileNumber]);

  // Handle Save Bank Details
  const handleSaveBankSubmit = (e) => {
    e.preventDefault();
    setBankFormError('');
    setBankSuccessMsg('');

    const acc = accountNumber.trim();
    const confAcc = confirmAccountNumber.trim();
    const ifsc = ifscCode.trim().toUpperCase();

    if (!acc || acc.length < 9 || acc.length > 18 || !/^\d+$/.test(acc)) {
      setBankFormError('Please enter a valid Bank Account Number (9 to 18 digits).');
      return;
    }

    if (acc !== confAcc) {
      setBankFormError('Account Number and Confirm Account Number do not match.');
      return;
    }

    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      setBankFormError('Enter a valid 11-character Indian IFSC Code (e.g. HDFC0001024, SBIN0004567).');
      return;
    }

    const saved = saveFarmerBankDetails(user.mobileNumber, {
      accountNumber: acc,
      ifscCode: ifsc,
      bankName: bankName.trim(),
      branch: branch.trim(),
      accountHolderName: user?.fullName || 'Farmer Account'
    });

    setBankDetails(saved);
    setBankSuccessMsg('🎉 Bank details successfully verified and saved! Transaction history is now unlocked.');
    const txns = getFarmerTransactions(user.mobileNumber);
    setTransactions(txns);
  };

  return (
    <div className="sell-crop-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">💳 Transactions & Payment Receipts</h2>
          <p className="module-desc">
            Secure crop sales ledger, automated Crop Sale Receipts, and direct Vendor Payment Receipts with verified bank UTR references.
          </p>
        </div>
        {bankDetails && (
          <div className="privacy-guarantee-pill">
            🔒 Bank Account Linked: <strong>{bankDetails.maskedAccountNumber}</strong> ({bankDetails.ifscCode})
          </div>
        )}
      </div>

      {bankSuccessMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{bankSuccessMsg}</div>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => setBankSuccessMsg('')}>✕</button>
        </div>
      )}

      {/* ========================================================
          1. BANK DETAILS GATE (IF NOT SAVED YET)
          ======================================================== */}
      {!bankDetails ? (
        <div className="chart-card" style={{ maxWidth: '640px', margin: '1rem auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>🏦</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--text-main)' }}>
              Link Bank Details to Access Transactions
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              To receive payments and view sale transaction receipts, please register your bank account. Your account number is encrypted and masked for security.
            </p>
          </div>

          {bankFormError && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              ⚠️ {bankFormError}
            </div>
          )}

          <form onSubmit={handleSaveBankSubmit}>
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Bank Account Number <span className="required-star">*</span>
                </label>
                <input
                  id="input-bank-acc-no"
                  type="password"
                  required
                  maxLength={18}
                  className="form-input"
                  placeholder="Enter 9-18 digit account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm Bank Account Number <span className="required-star">*</span>
                </label>
                <input
                  id="input-bank-conf-acc-no"
                  type="text"
                  required
                  maxLength={18}
                  className="form-input"
                  placeholder="Re-enter bank account number"
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">
                    IFSC Code <span className="required-star">*</span>
                  </label>
                  <input
                    id="input-bank-ifsc"
                    type="text"
                    required
                    maxLength={11}
                    className="form-input"
                    placeholder="e.g. HDFC0001024"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  />
                  <span className="field-hint">11-character Indian bank code</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Bank Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Branch & Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Branch Name"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>
            </div>

            <button
              id="btn-save-bank-details"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              🔒 Save & Verify Bank Details
            </button>
          </form>
        </div>
      ) : (
        /* ========================================================
            2. TRANSACTION HISTORY (AFTER BANK DETAILS SAVED)
            ======================================================== */
        <div>
          {/* Top Bank Summary Bar */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Payout Account:
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {bankDetails.bankName} • Account: <code style={{ color: '#047857' }}>{bankDetails.maskedAccountNumber}</code>
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                IFSC: {bankDetails.ifscCode} • Branch: {bankDetails.branch}
              </div>
            </div>

            <span className="verified-badge" style={{ padding: '0.35rem 0.75rem' }}>
              ✓ KYC & Bank Active
            </span>
          </div>

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <div className="empty-module-card">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🧾</div>
              <h3>No Crop Sale Transactions Yet</h3>
              <p>When you sell crops via 24-hour bidding, your Crop Sale Receipts and Vendor Payment Receipts will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {transactions.map((txn) => {
                const isCompleted = txn.status === 'Payment Completed' || txn.status === 'Receipt Uploaded';
                const isPending = txn.status === 'Payment Pending';

                return (
                  <div key={txn.id} className="loan-status-card" style={{ borderLeft: `4px solid ${isCompleted ? '#10b981' : '#f59e0b'}` }}>
                    <div className="loan-card-header">
                      <div>
                        <div className="loan-type-tag">🌾 {txn.cropName} Sale ({txn.quantitySold})</div>
                        <h3 className="loan-id-heading">Transaction ID: {txn.id}</h3>
                        <span className="loan-applied-date">
                          Sale Executed on {txn.saleDate} • Buyer Vendor: <strong>{txn.vendorName}</strong>
                        </span>
                      </div>

                      <div className="loan-amount-badge">
                        <div className="la-lbl">Total Sale Proceeds</div>
                        <div className="la-val">₹{txn.saleAmount?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Status & Receipt Actions */}
                    <div style={{ background: isCompleted ? '#f0fdf4' : '#fffbeb', border: `1px solid ${isCompleted ? '#bbf7d0' : '#fde68a'}`, borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT STATUS: </span>
                        <strong style={{ color: isCompleted ? '#166534' : '#92400e', fontSize: '0.95rem' }}>
                          {isCompleted ? '✓ Payment Completed (Receipt Uploaded)' : '⏳ Payment Pending from Vendor'}
                        </strong>
                        {txn.paymentReceipt && (
                          <div style={{ fontSize: '0.775rem', color: '#15803d', marginTop: '2px' }}>
                            UTR: <code>{txn.paymentReceipt.utrReference}</code> ({txn.paymentReceipt.paymentDate})
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/* Option to View Crop Sale Receipt */}
                        {txn.cropSaleReceipt && (
                          <button
                            id={`btn-view-sale-receipt-${txn.id}`}
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedCropSaleReceipt(txn.cropSaleReceipt)}
                          >
                            📄 View Crop Sale Receipt
                          </button>
                        )}

                        {/* Option to View Vendor Payment Receipt */}
                        {txn.paymentReceipt ? (
                          <button
                            id={`btn-view-payment-receipt-${txn.id}`}
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#059669' }}
                            onClick={() => setSelectedPaymentReceipt(txn.paymentReceipt)}
                          >
                            💰 View Payment Receipt
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#92400e', fontStyle: 'italic', alignSelf: 'center' }}>
                            (Awaiting vendor payment upload)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="user-info-box" style={{ margin: 0 }}>
                      <div className="info-row">
                        <span className="info-label">Commodity & Quantity:</span>
                        <span className="info-val">{txn.cropName} ({txn.quantitySold})</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Purchasing Vendor:</span>
                        <span className="info-val">{txn.vendorName} ({txn.vendorLocation || 'Trade Zone'})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: CROP SALE RECEIPT
          ======================================================== */}
      {selectedCropSaleReceipt && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                  OFFICIAL SALES VOUCHER • {selectedCropSaleReceipt.receiptNo}
                </span>
                <h3 style={{ margin: 0 }}>📄 Crop Sale Receipt</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedCropSaleReceipt(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, color: 'var(--primary)' }}>AgriTradeX Commercial Exchange</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Certified Crop Sale & Delivery Receipt • {selectedCropSaleReceipt.issueDate}
                </div>
              </div>

              <div className="user-info-box" style={{ margin: 0, background: '#f8fafc' }}>
                <div className="info-row">
                  <span className="info-label">Receipt Number:</span>
                  <span className="info-val">{selectedCropSaleReceipt.receiptNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Crop & Quantity:</span>
                  <span className="info-val">{selectedCropSaleReceipt.cropName} — {selectedCropSaleReceipt.quantity}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Agreed Unit Rate:</span>
                  <span className="info-val">₹{selectedCropSaleReceipt.agreedPricePerQuintal?.toLocaleString('en-IN')} / Qtl</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Sale Value:</span>
                  <span className="info-val" style={{ color: '#047857', fontSize: '1.1rem' }}>
                    ₹{selectedCropSaleReceipt.totalSaleAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Seller (Farmer):</span>
                  <span className="info-val">{selectedCropSaleReceipt.sellerFarmer}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Buyer (Vendor):</span>
                  <span className="info-val">{selectedCropSaleReceipt.buyerVendor}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Pickup Farm Location:</span>
                  <span className="info-val">{selectedCropSaleReceipt.pickupLocation}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedCropSaleReceipt(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PAYMENT RECEIPT FROM VENDOR
          ======================================================== */}
      {selectedPaymentReceipt && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                  BANK DISBURSEMENT CONFIRMATION • {selectedPaymentReceipt.receiptNo}
                </span>
                <h3 style={{ margin: 0 }}>💰 Vendor Payment Receipt</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedPaymentReceipt(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f0fdf4', border: '1.5px solid #10b981', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #a7f3d0', paddingBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>OFFICIAL PAYMENT VOUCHER</div>
                <h4 style={{ margin: '0.2rem 0', color: '#065f46', fontSize: '1.4rem' }}>
                  ₹{selectedPaymentReceipt.paymentAmount?.toLocaleString('en-IN')}
                </h4>
                <span className="verified-badge">✓ Payment Completed</span>
              </div>

              <div className="user-info-box" style={{ margin: 0, background: '#ffffff' }}>
                <div className="info-row">
                  <span className="info-label">Payment Date:</span>
                  <span className="info-val">{selectedPaymentReceipt.paymentDate}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Banking UTR Reference:</span>
                  <span className="info-val" style={{ fontFamily: 'monospace', color: '#047857', fontWeight: 700 }}>
                    {selectedPaymentReceipt.utrReference}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Paying Vendor:</span>
                  <span className="info-val">{selectedPaymentReceipt.vendorName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Transfer Channel:</span>
                  <span className="info-val">{selectedPaymentReceipt.paymentMode}</span>
                </div>
              </div>

              {/* Uploaded Receipt Document Preview */}
              {selectedPaymentReceipt.receiptPhotoUrl && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, marginBottom: '4px' }}>
                    Uploaded Bank Transfer Voucher:
                  </div>
                  <img
                    src={selectedPaymentReceipt.receiptPhotoUrl}
                    alt="Bank Receipt Scan"
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #a7f3d0' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedPaymentReceipt(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
