import React, { useState, useEffect, useRef } from 'react';
import {
  getVendorTransactions,
  payFarmerForTransaction,
  uploadCropPurchaseReceipt,
  uploadPaymentReceiptProof,
  SAMPLE_RECEIPT_PHOTOS
} from '../../services/transactionsStore';

export default function VendorTransactionsSection({ user, onShowGlobalToast }) {
  const [transactions, setTransactions] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'completed' | 'records'
  
  // Pay Farmer Modal State
  const [selectedTxnForPayment, setSelectedTxnForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [utrReference, setUtrReference] = useState('');
  const [paymentMode, setPaymentMode] = useState('Direct Bank NEFT / RTGS Transfer');
  const [payError, setPayError] = useState('');
  const [showUnmaskedBank, setShowUnmaskedBank] = useState(false);

  // Upload Receipt Modal / Action State
  const [receiptUploadModal, setReceiptUploadModal] = useState(null); // { txn, type: 'crop' | 'payment' }
  const [previewImage, setPreviewImage] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Company Record Inspection Modal
  const [selectedRecordForView, setSelectedRecordForView] = useState(null);

  // Lightbox Document Preview
  const [activeImageLightbox, setActiveImageLightbox] = useState(null); // { url, title, sub }

  const loadTransactions = () => {
    if (user) {
      const data = getVendorTransactions(user);
      setTransactions(data);
      if (selectedTxnForPayment) {
        const refreshed = data.find((t) => t.id === selectedTxnForPayment.id);
        if (refreshed) setSelectedTxnForPayment(refreshed);
      }
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  // Handle Opening Pay Farmer Modal
  const handleOpenPayFarmer = (txn) => {
    setSelectedTxnForPayment(txn);
    setPaymentAmount(String(txn.purchaseAmount || ''));
    setUtrReference('UTR' + Math.floor(100000000000 + Math.random() * 900000000000));
    setPaymentMode('Direct Bank NEFT / RTGS Transfer');
    setPayError('');
    setShowUnmaskedBank(false);
  };

  // Submit Pay Farmer Action
  const handleConfirmPayFarmer = (e) => {
    e.preventDefault();
    if (!selectedTxnForPayment) return;

    const res = payFarmerForTransaction(selectedTxnForPayment.id, user, {
      paymentAmount: Number(paymentAmount) || selectedTxnForPayment.purchaseAmount,
      utrReference: utrReference.trim(),
      paymentMode: paymentMode
    });

    if (res.success) {
      loadTransactions();
      setSelectedTxnForPayment(null);

      if (onShowGlobalToast) {
        onShowGlobalToast({
          type: 'success',
          text: res.message
        });
      }
    } else {
      setPayError(res.message);
    }
  };

  // Handle Opening Upload Receipt Modal
  const handleOpenUploadModal = (txn, type) => {
    setReceiptUploadModal({ txn, type });
    const existing = type === 'crop' ? txn.cropPurchaseReceiptPicture : txn.paymentReceiptPicture;
    const existingName = type === 'crop' ? txn.cropReceiptFileName : txn.paymentReceiptFileName;
    setPreviewImage(existing || '');
    setFileName(existingName || '');
  };

  // Handle File Input Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select a valid image file (JPG, JPEG, PNG).');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPreviewImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Choose Sample Demo Receipt
  const handleChooseSampleReceipt = (type) => {
    const sampleUrl = type === 'crop' ? SAMPLE_RECEIPT_PHOTOS.cropPurchaseReceipt : SAMPLE_RECEIPT_PHOTOS.paymentReceipt;
    setPreviewImage(sampleUrl);
    setFileName(type === 'crop' ? 'Weighbridge_Crop_Purchase_Slip.jpg' : 'Bank_RTGS_Transfer_Receipt.jpg');
  };

  // Confirm Receipt Upload
  const handleConfirmReceiptUpload = (e) => {
    e.preventDefault();
    if (!receiptUploadModal || !previewImage) return;

    const { txn, type } = receiptUploadModal;
    let res;

    if (type === 'crop') {
      res = uploadCropPurchaseReceipt(txn.id, {
        imageUrl: previewImage,
        fileName: fileName || 'Crop_Purchase_Receipt.jpg'
      });
    } else {
      res = uploadPaymentReceiptProof(txn.id, {
        imageUrl: previewImage,
        fileName: fileName || 'Payment_Transfer_Receipt.jpg'
      });
    }

    if (res.success) {
      loadTransactions();
      setReceiptUploadModal(null);
      setPreviewImage('');
      setFileName('');

      if (onShowGlobalToast) {
        onShowGlobalToast({
          type: 'success',
          text: res.message
        });
      }
    }
  };

  // Filtered list
  const filteredTxns = transactions.filter((t) => {
    if (filterTab === 'pending') return t.paymentStatus === 'Payment Pending';
    if (filterTab === 'completed') return t.paymentStatus === 'Payment Completed';
    if (filterTab === 'records') {
      return Boolean(t.cropPurchaseReceiptPicture || t.paymentReceiptPicture);
    }
    return true;
  });

  const totalSpent = transactions
    .filter((t) => t.paymentStatus === 'Payment Completed')
    .reduce((sum, t) => sum + (t.paymentAmount || t.purchaseAmount || 0), 0);

  const pendingAmount = transactions
    .filter((t) => t.paymentStatus === 'Payment Pending')
    .reduce((sum, t) => sum + (t.purchaseAmount || 0), 0);

  return (
    <div className="transactions-section-container">
      {/* Header Banner */}
      <div className="transactions-header-card">
        <div className="thc-info">
          <span className="thc-tag">💳 Section 5</span>
          <h1 className="thc-title">Vendor Transactions & Receipt Ledger</h1>
          <p className="thc-desc">
            Settle farmer crop purchases, verify bank IFSC credentials, and upload verified <strong>Crop Purchase Receipts</strong> & <strong>Payment Receipts</strong> for complete corporate records and future clarification.
          </p>
        </div>

        <div className="thc-stats">
          <div className="thc-stat-box">
            <span className="thc-stat-lbl">Settled Purchases</span>
            <span className="thc-stat-val text-success">₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>
          <div className="thc-stat-box highlight">
            <span className="thc-stat-lbl">Pending Payment</span>
            <span className="thc-stat-val text-warning">₹{pendingAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="transactions-filter-bar">
        <div className="tfb-buttons">
          <button
            id="tab-txn-all"
            type="button"
            className={`tfb-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All Transactions ({transactions.length})
          </button>
          <button
            id="tab-txn-pending"
            type="button"
            className={`tfb-btn ${filterTab === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterTab('pending')}
          >
            Payment Pending ({transactions.filter((t) => t.paymentStatus === 'Payment Pending').length})
          </button>
          <button
            id="tab-txn-completed"
            type="button"
            className={`tfb-btn ${filterTab === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterTab('completed')}
          >
            Payment Completed ({transactions.filter((t) => t.paymentStatus === 'Payment Completed').length})
          </button>
          <button
            id="tab-txn-records"
            type="button"
            className={`tfb-btn ${filterTab === 'records' ? 'active' : ''}`}
            onClick={() => setFilterTab('records')}
          >
            📁 Company Records ({transactions.filter((t) => t.cropPurchaseReceiptPicture || t.paymentReceiptPicture).length})
          </button>
        </div>

        <div className="privacy-guarantee-pill">
          🔒 Bank Data Encrypted: Farmer account numbers masked for privacy
        </div>
      </div>

      {/* Main Transactions List / Cards */}
      {filteredTxns.length === 0 ? (
        <div className="empty-module-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💳</div>
          <h3>No Transactions Found</h3>
          <p>
            When you purchase allocated crop lots from <strong>Dashboard</strong> or <strong>Bidding</strong>, transaction records will appear here for payment settlement and receipt uploads.
          </p>
        </div>
      ) : (
        <div className="transactions-list-grid">
          {filteredTxns.map((txn) => {
            const isPending = txn.paymentStatus === 'Payment Pending';
            const isCompleted = txn.paymentStatus === 'Payment Completed';
            const hasCropReceipt = Boolean(txn.cropPurchaseReceiptPicture);
            const hasPaymentReceipt = Boolean(txn.paymentReceiptPicture);

            return (
              <div key={txn.id} className={`vendor-txn-card ${isPending ? 'card-txn-pending' : 'card-txn-completed'}`}>
                {/* Card Top Row */}
                <div className="vtc-top-row">
                  <div className="vtc-left-identity">
                    <img
                      src={txn.cropPicture}
                      alt={txn.cropName}
                      className="vtc-crop-thumb"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div>
                      <div className="vtc-id-tags">
                        <span className="font-mono txn-id-chip">{txn.id}</span>
                        <span className="lot-ref-tag">Lot: {txn.lotId}</span>
                      </div>
                      <h3 className="vtc-crop-title">{txn.cropName}</h3>
                      <span className="vtc-qty-badge">⚖️ {txn.quantity}</span>
                    </div>
                  </div>

                  <div className="vtc-right-status">
                    <span className={`txn-status-badge ${isPending ? 'status-pending' : 'status-completed'}`}>
                      {isPending ? '⏱️ Payment Pending' : '✓ Payment Completed'}
                    </span>
                    <div className="vtc-amount-display">
                      <span className="vtc-amt-lbl">Purchase Value</span>
                      <span className={`vtc-amt-val ${isPending ? 'text-warning' : 'text-success'}`}>
                        ₹{txn.purchaseAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Farmer Particulars & Bank Data Box */}
                <div className="vtc-farmer-bank-box">
                  <div className="fbb-row">
                    <span className="fbb-lbl">Farmer Beneficiary:</span>
                    <span className="fbb-val">
                      <strong>{txn.farmerName}</strong> (📞 {txn.farmerMobile})
                    </span>
                  </div>

                  <div className="fbb-grid">
                    <div className="fbb-cell">
                      <span className="fbb-sub-lbl">Bank Account No:</span>
                      <span className="fbb-sub-val font-mono">
                        {txn.farmerBank?.maskedAccountNumber || '••••••••8123'}
                      </span>
                    </div>

                    <div className="fbb-cell">
                      <span className="fbb-sub-lbl">IFSC Code:</span>
                      <span className="fbb-sub-val font-mono text-primary">
                        {txn.farmerBank?.ifscCode || 'SBIN0020194'}
                      </span>
                    </div>

                    <div className="fbb-cell">
                      <span className="fbb-sub-lbl">Bank & Branch:</span>
                      <span className="fbb-sub-val">
                        {txn.farmerBank?.bankName || 'State Bank of India'} ({txn.farmerBank?.branch || 'Agri Branch'})
                      </span>
                    </div>

                    <div className="fbb-cell">
                      <span className="fbb-sub-lbl">Purchase Date:</span>
                      <span className="fbb-sub-val">📅 {txn.purchaseDate}</span>
                    </div>
                  </div>
                </div>

                {/* Settle Details Banner (If Payment Completed) */}
                {isCompleted && (
                  <div className="vtc-settlement-strip">
                    <div className="vss-item">
                      <span>Payment Date & Time:</span>
                      <strong>📅 {txn.paymentDate} at {txn.paymentTime || '10:00 AM'}</strong>
                    </div>
                    <div className="vss-item">
                      <span>Bank Reference / UTR:</span>
                      <strong className="font-mono text-success">🔖 {txn.utrReference || 'UTR-RECORDED'}</strong>
                    </div>
                    <div className="vss-item">
                      <span>Payment Channel:</span>
                      <strong>💳 {txn.paymentMode || 'Direct Bank NEFT/RTGS'}</strong>
                    </div>
                  </div>
                )}

                {/* Receipt Upload & Management Area */}
                <div className="vtc-receipts-management-area">
                  <div className="rma-title">
                    <span>📄 Company Record Receipts (Mandatory for Corporate Filing):</span>
                  </div>

                  <div className="rma-grid">
                    {/* RECEIPT 1: CROP PURCHASE RECEIPT */}
                    <div className={`rma-card ${hasCropReceipt ? 'uploaded' : 'pending'}`}>
                      <div className="rma-card-left">
                        <div className="rma-icon-wrap">
                          {hasCropReceipt ? '🌾' : '📤'}
                        </div>
                        <div>
                          <strong className="rma-card-heading">Crop Purchase Receipt</strong>
                          <span className="rma-card-status">
                            {hasCropReceipt
                              ? `✓ Uploaded (${txn.cropReceiptFileName || 'Receipt.jpg'})`
                              : '⏱️ Purchase Receipt Picture Required'}
                          </span>
                        </div>
                      </div>

                      <div className="rma-card-actions">
                        {hasCropReceipt ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() =>
                                setActiveImageLightbox({
                                  url: txn.cropPurchaseReceiptPicture,
                                  title: `Crop Purchase Receipt • Lot ${txn.lotId}`,
                                  sub: `Purchased from ${txn.farmerName} • ₹${txn.purchaseAmount?.toLocaleString('en-IN')}`
                                })
                              }
                            >
                              🔍 View
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleOpenUploadModal(txn, 'crop')}
                            >
                              🔄 Replace
                            </button>
                          </>
                        ) : (
                          <button
                            id={`btn-upload-crop-receipt-${txn.id}`}
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenUploadModal(txn, 'crop')}
                          >
                            📤 Upload Picture
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RECEIPT 2: PAYMENT RECEIPT */}
                    <div className={`rma-card ${hasPaymentReceipt ? 'uploaded' : 'pending'}`}>
                      <div className="rma-card-left">
                        <div className="rma-icon-wrap">
                          {hasPaymentReceipt ? '💳' : '📤'}
                        </div>
                        <div>
                          <strong className="rma-card-heading">Payment Transfer Receipt</strong>
                          <span className="rma-card-status">
                            {hasPaymentReceipt
                              ? `✓ Uploaded (${txn.paymentReceiptFileName || 'Transfer.jpg'})`
                              : isCompleted
                              ? '⏱️ Bank Transfer Proof Required'
                              : '🔒 Settle Payment to Upload'}
                          </span>
                        </div>
                      </div>

                      <div className="rma-card-actions">
                        {hasPaymentReceipt ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() =>
                                setActiveImageLightbox({
                                  url: txn.paymentReceiptPicture,
                                  title: `Payment Receipt (UTR: ${txn.utrReference})`,
                                  sub: `Paid ₹${(txn.paymentAmount || txn.purchaseAmount)?.toLocaleString('en-IN')} to ${txn.farmerName}`
                                })
                              }
                            >
                              🔍 View
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleOpenUploadModal(txn, 'payment')}
                            >
                              🔄 Replace
                            </button>
                          </>
                        ) : (
                          <button
                            id={`btn-upload-payment-receipt-${txn.id}`}
                            type="button"
                            className={`btn btn-sm ${isCompleted ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => {
                              if (isPending) {
                                handleOpenPayFarmer(txn);
                              } else {
                                handleOpenUploadModal(txn, 'payment');
                              }
                            }}
                          >
                            {isPending ? '💳 Pay & Upload' : '📤 Upload Picture'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="vtc-footer-actions">
                  <button
                    id={`btn-view-company-record-${txn.id}`}
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelectedRecordForView(txn)}
                  >
                    📑 View Company Record Slip
                  </button>

                  {isPending && (
                    <button
                      id={`btn-pay-farmer-${txn.id}`}
                      type="button"
                      className="btn btn-primary"
                      style={{ backgroundColor: '#059669' }}
                      onClick={() => handleOpenPayFarmer(txn)}
                    >
                      💳 Pay Farmer (₹{txn.purchaseAmount?.toLocaleString('en-IN')}) →
                    </button>
                  )}

                  {isCompleted && (
                    <div className="txn-certified-badge">
                      <span>✓ Payment Settled & Recorded in Farmer Transactions Ledger</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL 1: PAY FARMER MODAL
          ======================================================== */}
      {selectedTxnForPayment && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div>
                <span className="modal-sub-tag">AgriTradeX Banking Settlement</span>
                <h3>💳 Pay Farmer: {selectedTxnForPayment.farmerName}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedTxnForPayment(null)}
              >
                ✕
              </button>
            </div>

            {payError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                ⚠️ {payError}
              </div>
            )}

            {/* Farmer Bank Particulars Box */}
            <div className="pay-farmer-bank-card">
              <div className="pfb-header">
                <span>🏦 Farmer Registered Bank Particulars</span>
                <button
                  type="button"
                  className="unmask-toggle-btn"
                  onClick={() => setShowUnmaskedBank(!showUnmaskedBank)}
                >
                  {showUnmaskedBank ? '🔒 Hide Full No.' : '👁️ Verify Full Account No.'}
                </button>
              </div>

              <div className="pfb-body">
                <div className="pfb-row">
                  <span className="pfb-lbl">Account Holder:</span>
                  <strong className="pfb-val">{selectedTxnForPayment.farmerBank?.accountHolderName || selectedTxnForPayment.farmerName}</strong>
                </div>

                <div className="pfb-row highlight-account">
                  <span className="pfb-lbl">Bank Account Number:</span>
                  <strong className="pfb-val font-mono" style={{ fontSize: '1.1rem', color: '#1e3a8a' }}>
                    {showUnmaskedBank
                      ? (selectedTxnForPayment.farmerBank?.accountNumber || '389102948123')
                      : (selectedTxnForPayment.farmerBank?.maskedAccountNumber || '••••••••8123')}
                  </strong>
                </div>

                <div className="pfb-row highlight-ifsc">
                  <span className="pfb-lbl">IFSC Code:</span>
                  <strong className="pfb-val font-mono" style={{ fontSize: '1.1rem', color: '#047857' }}>
                    {selectedTxnForPayment.farmerBank?.ifscCode || 'SBIN0020194'}
                  </strong>
                </div>

                <div className="pfb-row">
                  <span className="pfb-lbl">Bank & Branch:</span>
                  <span className="pfb-val">{selectedTxnForPayment.farmerBank?.bankName || 'State Bank of India'} ({selectedTxnForPayment.farmerBank?.branch || 'Agri Hub'})</span>
                </div>
              </div>

              <div className="pfb-footer-hint">
                ⚠️ Please carefully cross-verify the Account Number and IFSC code above before submitting payment transfer.
              </div>
            </div>

            <form onSubmit={handleConfirmPayFarmer}>
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Payment Transfer Amount (₹) *</label>
                  <input
                    id="input-pay-amount"
                    type="number"
                    required
                    className="form-input"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <span className="field-hint">Agreed purchase valuation</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Bank UTR / Transaction Reference ID *</label>
                  <input
                    id="input-pay-utr"
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. UTR881920391823"
                    value={utrReference}
                    onChange={(e) => setUtrReference(e.target.value)}
                  />
                  <span className="field-hint">NEFT / RTGS / IMPS reference</span>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Payment Mode / Settlement Channel</label>
                  <select
                    className="form-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="Direct Bank NEFT / RTGS Transfer">Direct Bank NEFT / RTGS Transfer</option>
                    <option value="Direct Bank IMPS Transfer">Direct Bank IMPS Transfer</option>
                    <option value="AgriTradeX Escrow Settlement">AgriTradeX Escrow Settlement</option>
                    <option value="APMC Mandi e-Payment">APMC Mandi e-Payment</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTxnForPayment(null)}
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-pay-farmer-submit"
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#059669' }}
                >
                  ✓ Confirm Payment & Settle Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: UPLOAD RECEIPT PICTURE (JPG, JPEG, PNG, PREVIEW, REPLACE)
          ======================================================== */}
      {receiptUploadModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div>
                <span className="modal-sub-tag">Company Audit & Verification Record</span>
                <h3>
                  📤 Upload {receiptUploadModal.type === 'crop' ? 'Crop Purchase Receipt' : 'Payment Receipt'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setReceiptUploadModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReceiptUpload}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.825rem' }}>
                <div>Linked Transaction: <strong>{receiptUploadModal.txn.id}</strong> (Lot: {receiptUploadModal.txn.lotId})</div>
                <div>Crop: <strong>{receiptUploadModal.txn.cropName}</strong> ({receiptUploadModal.txn.quantity})</div>
                <div>Farmer Seller: <strong>{receiptUploadModal.txn.farmerName}</strong></div>
              </div>

              {/* Upload Drop Area */}
              <div className="receipt-upload-dropzone">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {previewImage ? (
                  <div className="receipt-preview-container">
                    <img src={previewImage} alt="Receipt Preview" className="receipt-preview-img" />
                    <div className="rpc-overlay">
                      <span className="rpc-file-name">{fileName || 'Uploaded_Receipt.jpg'}</span>
                      <div className="rpc-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          🔄 Replace Picture
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setPreviewImage('');
                            setFileName('');
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="dropzone-prompt" onClick={() => fileInputRef.current?.click()}>
                    <span className="dropzone-icon">📷</span>
                    <h4>Select Picture from Device</h4>
                    <p>Accepted file formats: <strong>JPG, JPEG, PNG</strong></p>
                    <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
                      Browse Files
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Sample Choice for easy testing */}
              <div style={{ margin: '0.85rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Or use realistic sample voucher for testing:</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                  onClick={() => handleChooseSampleReceipt(receiptUploadModal.type)}
                >
                  ⚡ Attach Sample {receiptUploadModal.type === 'crop' ? 'Purchase Slip' : 'Bank Voucher'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReceiptUploadModal(null)}
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-receipt-save"
                  type="submit"
                  className="btn btn-primary"
                  disabled={!previewImage}
                >
                  ✓ Save Receipt Picture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: COMPLETE COMPANY RECORD SLIP
          ======================================================== */}
      {selectedRecordForView && (
        <div className="modal-overlay">
          <div className="modal-card modal-large" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div>
                <span className="modal-sub-tag">AgriTradeX Corporate Records & Audit Registry</span>
                <h3>📑 Company Transaction Record Slip: {selectedRecordForView.id}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedRecordForView(null)}
              >
                ✕
              </button>
            </div>

            <div className="company-record-slip">
              {/* Top Banner */}
              <div className="crs-header-banner">
                <div>
                  <div className="crs-brand">AgriTradeX Trade & Settlement Record</div>
                  <span className="crs-sub">Corporate Archival & Legal Clarification Copy</span>
                </div>
                <div className="crs-status-chip">
                  {selectedRecordForView.paymentStatus === 'Payment Completed' ? '✓ FULLY SETTLED' : '⏳ PAYMENT PENDING'}
                </div>
              </div>

              {/* Data Rows Matrix */}
              <div className="crs-grid">
                <div className="crs-cell">
                  <span className="crs-lbl">Transaction ID:</span>
                  <strong className="font-mono">{selectedRecordForView.id}</strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Lot ID:</span>
                  <strong className="font-mono">{selectedRecordForView.lotId}</strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Crop Name:</span>
                  <strong>{selectedRecordForView.cropName}</strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Quantity:</span>
                  <strong>{selectedRecordForView.quantity}</strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Farmer Beneficiary:</span>
                  <strong>{selectedRecordForView.farmerName}</strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Purchasing Vendor:</span>
                  <strong>{selectedRecordForView.vendorName}</strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Purchase Date:</span>
                  <strong>{selectedRecordForView.purchaseDate}</strong>
                </div>

                <div className="crs-cell highlight-cell">
                  <span className="crs-lbl">Purchase Amount:</span>
                  <strong className="text-primary font-mono" style={{ fontSize: '1.1rem' }}>
                    ₹{selectedRecordForView.purchaseAmount?.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Payment Date & Time:</span>
                  <strong>
                    {selectedRecordForView.paymentDate ? `${selectedRecordForView.paymentDate} (${selectedRecordForView.paymentTime || '10:00 AM'})` : 'Pending'}
                  </strong>
                </div>

                <div className="crs-cell highlight-cell">
                  <span className="crs-lbl">Payment Amount Settled:</span>
                  <strong className="text-success font-mono" style={{ fontSize: '1.1rem' }}>
                    ₹{(selectedRecordForView.paymentAmount || selectedRecordForView.purchaseAmount)?.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Bank UTR / Reference ID:</span>
                  <strong className="font-mono">{selectedRecordForView.utrReference || 'Pending Transfer'}</strong>
                </div>

                <div className="crs-cell">
                  <span className="crs-lbl">Payment Status:</span>
                  <strong>{selectedRecordForView.paymentStatus}</strong>
                </div>
              </div>

              {/* Uploaded Receipts Section */}
              <div className="crs-receipts-row">
                <div className="crs-receipt-box">
                  <div className="crb-header">
                    <span>🌾 Crop Purchase Receipt Picture</span>
                    <span className={`crb-status ${selectedRecordForView.cropPurchaseReceiptPicture ? 'ok' : 'missing'}`}>
                      {selectedRecordForView.cropPurchaseReceiptPicture ? '✓ Attached' : '✕ Not Uploaded'}
                    </span>
                  </div>
                  {selectedRecordForView.cropPurchaseReceiptPicture ? (
                    <div
                      className="crb-preview-wrap"
                      onClick={() =>
                        setActiveImageLightbox({
                          url: selectedRecordForView.cropPurchaseReceiptPicture,
                          title: 'Crop Purchase Receipt',
                          sub: `Lot ${selectedRecordForView.lotId} • ${selectedRecordForView.cropName}`
                        })
                      }
                    >
                      <img
                        src={selectedRecordForView.cropPurchaseReceiptPicture}
                        alt="Crop Receipt"
                        className="crb-img"
                      />
                      <span className="crb-zoom-tag">🔍 Click to Enlarge</span>
                    </div>
                  ) : (
                    <div className="crb-empty-box">
                      <span>No Crop Purchase Receipt Uploaded Yet</span>
                    </div>
                  )}
                </div>

                <div className="crs-receipt-box">
                  <div className="crb-header">
                    <span>💳 Payment Transfer Receipt Picture</span>
                    <span className={`crb-status ${selectedRecordForView.paymentReceiptPicture ? 'ok' : 'missing'}`}>
                      {selectedRecordForView.paymentReceiptPicture ? '✓ Attached' : '✕ Not Uploaded'}
                    </span>
                  </div>
                  {selectedRecordForView.paymentReceiptPicture ? (
                    <div
                      className="crb-preview-wrap"
                      onClick={() =>
                        setActiveImageLightbox({
                          url: selectedRecordForView.paymentReceiptPicture,
                          title: 'Payment Transfer Receipt',
                          sub: `UTR: ${selectedRecordForView.utrReference} • ₹${(selectedRecordForView.paymentAmount || selectedRecordForView.purchaseAmount)?.toLocaleString('en-IN')}`
                        })
                      }
                    >
                      <img
                        src={selectedRecordForView.paymentReceiptPicture}
                        alt="Payment Receipt"
                        className="crb-img"
                      />
                      <span className="crb-zoom-tag">🔍 Click to Enlarge</span>
                    </div>
                  ) : (
                    <div className="crb-empty-box">
                      <span>No Payment Receipt Uploaded Yet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedRecordForView(null)}
              >
                Close Record View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          IMAGE LIGHTBOX MODAL
          ======================================================== */}
      {activeImageLightbox && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setActiveImageLightbox(null)}>
          <div className="modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-sub-tag">Verified Picture Attachment</span>
                <h3>{activeImageLightbox.title}</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveImageLightbox(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', maxHeight: '480px', background: '#0f172a', textAlign: 'center' }}>
              <img
                src={activeImageLightbox.url}
                alt={activeImageLightbox.title}
                style={{ width: '100%', maxHeight: '480px', objectFit: 'contain' }}
              />
            </div>

            {activeImageLightbox.sub && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {activeImageLightbox.sub}
              </p>
            )}

            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveImageLightbox(null)}
              >
                Close Full Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
