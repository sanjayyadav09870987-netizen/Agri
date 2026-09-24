import React from 'react';

export default function PurchasedLotsModule({ lots = [] }) {
  const totalPurchasedOutlay = lots.reduce((sum, lot) => sum + (lot.purchaseAmount || 0), 0);

  return (
    <div className="module-container">
      <div className="module-header-row">
        <div>
          <div className="module-badge-tag success">💳 MODULE 2</div>
          <h2 className="module-title">Purchased Lots Today ({lots.length})</h2>
          <p className="module-desc">
            Crop lots purchased and finalized today with verified bank reference and transaction records.
          </p>
        </div>
        <div className="summary-stat-pill success">
          💰 Today's Purchase Outlay: <strong>₹{totalPurchasedOutlay.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {lots.length === 0 ? (
        <div className="empty-module-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🧾</div>
          <h3>No Lots Purchased Today Yet</h3>
          <p>When you complete a purchase transaction for any allocated pending lot, it will immediately appear here.</p>
        </div>
      ) : (
        <div className="vendor-lots-grid">
          {lots.map((lot) => (
            <div key={lot.id} className="vendor-lot-card card-purchased">
              <div className="vendor-lot-image-wrap">
                <img
                  src={lot.cropPicture}
                  alt={lot.cropName}
                  className="vendor-lot-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span className="lot-status-badge purchased">
                  ✓ Purchased
                </span>
                <span className="lot-id-chip">{lot.id}</span>
              </div>

              <div className="vendor-lot-content">
                <div className="vendor-lot-header">
                  <div>
                    <h3 className="vendor-lot-crop-name">{lot.cropName}</h3>
                    <span className="vendor-lot-qty-pill">⚖️ {lot.quantity}</span>
                  </div>
                  <div className="vendor-lot-amount-box highlight-green">
                    <span className="vla-lbl">Purchase Amount Paid</span>
                    <span className="vla-val success-val">₹{lot.purchaseAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="purchased-details-card">
                  <div className="pd-row">
                    <span className="pd-lbl">Purchase Date:</span>
                    <span className="pd-val">📅 {lot.purchaseDate || 'Today'}</span>
                  </div>
                  <div className="pd-row">
                    <span className="pd-lbl">Purchase Time:</span>
                    <span className="pd-val">🕒 {lot.purchaseTime || 'Just now'}</span>
                  </div>
                  <div className="pd-row highlight-ref">
                    <span className="pd-lbl">Transaction / Ref ID:</span>
                    <span className="pd-val font-mono">🔖 {lot.transactionId || lot.utrReference || 'TXN-SETTLED'}</span>
                  </div>
                  {lot.utrReference && (
                    <div className="pd-row">
                      <span className="pd-lbl">Bank UTR Reference:</span>
                      <span className="pd-val font-mono">🏦 {lot.utrReference}</span>
                    </div>
                  )}
                  {lot.paymentMode && (
                    <div className="pd-row">
                      <span className="pd-lbl">Payment Mode:</span>
                      <span className="pd-val">💳 {lot.paymentMode}</span>
                    </div>
                  )}
                  {lot.cropAddress && (
                    <div className="pd-row">
                      <span className="pd-lbl">Pickup Location:</span>
                      <span className="pd-val text-sm">📍 {lot.cropAddress}</span>
                    </div>
                  )}
                </div>

                <div className="vendor-lot-footer">
                  <div className="lot-purchased-banner full">
                    <span>✓ Status: <strong>Purchased & Trade Agreement Certified</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
