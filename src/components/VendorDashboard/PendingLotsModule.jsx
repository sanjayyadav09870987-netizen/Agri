import React from 'react';

export default function PendingLotsModule({
  lots = [],
  currentTime,
  onSelectLotForPurchase,
  onSimulateExpire
}) {
  const formatCountdown = (expiresAt) => {
    const remaining = Math.max(0, expiresAt - currentTime);
    if (remaining <= 0) return '00h 00m 00s (24h Expired)';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  const totalPendingValue = lots.reduce((sum, lot) => sum + (lot.purchaseAmount || 0), 0);

  return (
    <div className="module-container">
      <div className="module-header-row">
        <div>
          <div className="module-badge-tag warning">⏱️ MODULE 3</div>
          <h2 className="module-title">Pending Lots to Purchase Today ({lots.length})</h2>
          <p className="module-desc">
            Allocated lots awaiting your payment confirmation. Each lot has a strict <strong>24-hour purchase period</strong> from its allocation timestamp.
          </p>
        </div>
        <div className="summary-stat-pill warning">
          ⏳ Total Pending Commitment: <strong>₹{totalPendingValue.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {lots.length === 0 ? (
        <div className="empty-module-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <h3>No Pending Lots to Purchase</h3>
          <p>You have settled all your allocated lots for today, or no new lots are pending purchase.</p>
        </div>
      ) : (
        <div className="vendor-lots-grid">
          {lots.map((lot) => {
            const remaining = Math.max(0, lot.expiresAt - currentTime);
            const isCritical = remaining < 4 * 3600 * 1000; // Less than 4 hours

            return (
              <div key={lot.id} className={`vendor-lot-card card-pending ${isCritical ? 'border-critical' : ''}`}>
                <div className="vendor-lot-image-wrap">
                  <img
                    src={lot.cropPicture}
                    alt={lot.cropName}
                    className="vendor-lot-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <span className="lot-status-badge pending">
                    ⏱️ Pending Purchase
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
                      <span className="vla-lbl">Purchase Amount</span>
                      <span className="vla-val highlight">₹{lot.purchaseAmount?.toLocaleString('en-IN')}</span>
                      {lot.acceptedBidRate && (
                        <span className="vla-rate">₹{lot.acceptedBidRate?.toLocaleString('en-IN')} / Qtl</span>
                      )}
                    </div>
                  </div>

                  {/* 24-HOUR COUNTDOWN TIMER BANNER */}
                  <div className={`countdown-timer-banner ${isCritical ? 'urgent' : ''}`}>
                    <div className="ct-left">
                      <span className="ct-icon">⏱️</span>
                      <div>
                        <span className="ct-lbl">24-Hour Purchase Window</span>
                        <div className="ct-timer-val">{formatCountdown(lot.expiresAt)}</div>
                      </div>
                    </div>
                    <div className="ct-right-badge">
                      {isCritical ? '⚠️ Expiring Soon' : '🟢 Active 24h Window'}
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
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="vendor-lot-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      id={`btn-purchase-pending-lot-${lot.id}`}
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1, minWidth: '170px' }}
                      onClick={() => onSelectLotForPurchase(lot)}
                    >
                      💳 Purchase Now (₹{lot.purchaseAmount?.toLocaleString('en-IN')})
                    </button>

                    {/* Quick Simulation Button for 24h Expiry Testing */}
                    {onSimulateExpire && (
                      <button
                        id={`btn-expire-pending-lot-${lot.id}`}
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: '#fca5a5', color: '#dc2626', fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                        title="Simulate 24-hour expiration for testing"
                        onClick={() => onSimulateExpire(lot.id)}
                      >
                        ⚡ Simulate 24h Expiry
                      </button>
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
