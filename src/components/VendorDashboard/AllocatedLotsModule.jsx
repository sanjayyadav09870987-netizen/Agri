import React from 'react';

export default function AllocatedLotsModule({ lots = [], currentTime, onSelectLotForPurchase }) {
  const formatCountdown = (expiresAt, status) => {
    if (status === 'Purchased') {
      return '✓ Purchase Completed';
    }
    const remaining = Math.max(0, expiresAt - currentTime);
    if (remaining <= 0) return '00h 00m 00s (24h Expired)';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s left`;
  };

  return (
    <div className="module-container">
      <div className="module-header-row">
        <div>
          <div className="module-badge-tag">📦 MODULE 1</div>
          <h2 className="module-title">Allocated Lots ({lots.length})</h2>
          <p className="module-desc">
            All crop lots currently allocated to your registered vendor account through accepted auction bids and direct mandates.
          </p>
        </div>
        <div className="privacy-guarantee-pill">
          🔒 Vendor Specific: Showing lots allocated strictly to your account
        </div>
      </div>

      {lots.length === 0 ? (
        <div className="empty-module-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</div>
          <h3>No Allocated Lots Currently</h3>
          <p>When crop lots are allocated to your vendor account, they will appear here with full specifications.</p>
        </div>
      ) : (
        <div className="vendor-lots-grid">
          {lots.map((lot) => {
            const isPurchased = lot.status === 'Purchased';
            const isPending = lot.status === 'Pending Purchase';
            const remaining = Math.max(0, lot.expiresAt - currentTime);
            const isExpired = isPending && remaining <= 0;

            return (
              <div key={lot.id} className={`vendor-lot-card ${isPurchased ? 'card-purchased' : isExpired ? 'card-expired' : 'card-pending'}`}>
                <div className="vendor-lot-image-wrap">
                  <img
                    src={lot.cropPicture}
                    alt={lot.cropName}
                    className="vendor-lot-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <span className={`lot-status-badge ${lot.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {isPurchased ? '✓ Purchased' : isExpired ? '✕ Expired' : '⏱️ Pending Purchase'}
                  </span>
                  <span className="lot-id-chip">{lot.id}</span>
                </div>

                <div className="vendor-lot-content">
                  <div className="vendor-lot-header">
                    <div>
                      <h3 className="vendor-lot-crop-name">{lot.cropName}</h3>
                      <span className="vendor-lot-qty-pill">⚖️ {lot.quantity}</span>
                    </div>
                    <div className="vendor-lot-amount-box">
                      <span className="vla-lbl">Accepted Purchase Amount</span>
                      <span className="vla-val">₹{lot.purchaseAmount?.toLocaleString('en-IN')}</span>
                      {lot.acceptedBidRate && (
                        <span className="vla-rate">(₹{lot.acceptedBidRate?.toLocaleString('en-IN')} / Qtl)</span>
                      )}
                    </div>
                  </div>

                  <div className="vendor-lot-address-box">
                    <span className="vla-icon">📍</span>
                    <div className="vla-text">
                      <strong>Crop Address:</strong> {lot.cropAddress}
                    </div>
                  </div>

                  <div className="vendor-lot-meta-grid">
                    <div className="vlm-item">
                      <span className="vlm-lbl">Allocation Date</span>
                      <span className="vlm-val">📅 {lot.allocationDate}</span>
                    </div>
                    <div className="vlm-item">
                      <span className="vlm-lbl">Allocation Time</span>
                      <span className="vlm-val">🕒 {lot.allocationTime}</span>
                    </div>
                    <div className="vlm-item full-width">
                      <span className="vlm-lbl">Remaining 24h Purchase Time</span>
                      <span className={`vlm-val countdown-text ${isPurchased ? 'purchased-text' : isExpired ? 'expired-text' : 'active-text'}`}>
                        ⏱️ {formatCountdown(lot.expiresAt, lot.status)}
                      </span>
                    </div>
                  </div>

                  {/* Lot Action / Status Footer */}
                  <div className="vendor-lot-footer">
                    {isPending && !isExpired && (
                      <button
                        id={`btn-purchase-allocated-lot-${lot.id}`}
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => onSelectLotForPurchase(lot)}
                      >
                        💳 Purchase Lot Now (₹{lot.purchaseAmount?.toLocaleString('en-IN')})
                      </button>
                    )}
                    {isPurchased && (
                      <div className="lot-purchased-banner">
                        <span>✓ Purchased on {lot.purchaseDate} at {lot.purchaseTime}</span>
                        <span className="txn-chip">Txn: {lot.transactionId}</span>
                      </div>
                    )}
                    {isExpired && (
                      <div className="lot-expired-banner">
                        <span>✕ 24h Purchase Window Expired</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
