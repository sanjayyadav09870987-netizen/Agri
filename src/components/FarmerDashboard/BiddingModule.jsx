import React, { useState, useEffect } from 'react';

export default function BiddingModule({
  bids,
  onSimulateBid,
  onFinalizeBid,
  onNavigateToCrops
}) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update countdown clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (expiresAt) => {
    const remaining = Math.max(0, expiresAt - currentTime);
    if (remaining <= 0) return '00h 00m 00s (Auction Ended)';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  const activeBids = bids.filter((b) => b.status === 'active' && b.expiresAt > currentTime);
  const completedBids = bids.filter((b) => b.status === 'completed' || b.expiresAt <= currentTime);

  return (
    <div className="module-container">
      {/* Module Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">⚡ 24-Hour Live Crop Bidding Hub</h2>
          <p className="module-desc">
            Track real-time vendor bidding updates for your pushed crops over a 24-hour cycle and view the locked final price.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateToCrops}
        >
          + Push Crop from My Crops
        </button>
      </div>

      {/* ACTIVE 24-HR AUCTIONS */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 className="section-subtitle">
          🟢 Live Active Biddings ({activeBids.length})
        </h3>

        {activeBids.length === 0 ? (
          <div className="empty-module-card">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⌛</div>
            <h4>No Active Bidding Windows</h4>
            <p>You have not pushed any crop lots for bidding right now. Go to 'Cultivated Crops' and click 'Push to Bidding'.</p>
          </div>
        ) : (
          <div className="bids-grid">
            {activeBids.map((bid) => {
              const totalEstValue = bid.currentHighestBid * bid.quantityQuintals;
              const isExpired = bid.expiresAt <= currentTime;

              return (
                <div key={bid.id} className="bid-card active-bid-card">
                  <div className="bid-header">
                    <div>
                      <span className="bid-crop-tag">{bid.cropName}</span>
                      <h4 className="bid-title">{bid.quantityQuintals} Quintals Lot</h4>
                    </div>
                    <div className="timer-badge">
                      <span className="timer-icon">⏱️</span>
                      <span>{formatCountdown(bid.expiresAt)}</span>
                    </div>
                  </div>

                  <div className="bid-price-metrics">
                    <div className="price-metric-box">
                      <span className="metric-lbl">Base Starting Price</span>
                      <span className="metric-val">₹{bid.basePricePerQuintal.toLocaleString('en-IN')} / Qtl</span>
                    </div>
                    <div className="price-metric-box highlight">
                      <span className="metric-lbl">🔥 Current Highest Bid</span>
                      <span className="metric-val highlight">₹{bid.currentHighestBid.toLocaleString('en-IN')} / Qtl</span>
                    </div>
                    <div className="price-metric-box">
                      <span className="metric-lbl">Total Lot Value</span>
                      <span className="metric-val">₹{totalEstValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Incoming Bid Activity Feed (Updates up to 24h) */}
                  <div className="bids-history-box">
                    <div className="history-title">
                      <span>📊 Live Vendor Bid Updates ({bid.bidsList?.length || 0})</span>
                      <span className="pulse-indicator">● Live</span>
                    </div>

                    <div className="bids-list">
                      {bid.bidsList
                        ?.slice()
                        .reverse()
                        .map((entry, idx) => (
                          <div key={entry.id || idx} className={`bid-entry ${idx === 0 ? 'top-bid' : ''}`}>
                            <div className="bidder-info">
                              <span className="bidder-name">{entry.vendorName}</span>
                              <span className="bidder-loc">{entry.vendorLocation}</span>
                            </div>
                            <div className="bid-amount-wrap">
                              <span className="bid-amt">₹{entry.bidAmountPerQuintal.toLocaleString('en-IN')}</span>
                              {idx === 0 && <span className="highest-tag">Highest</span>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* 24-hr Simulation Controls for Testing */}
                  <div className="bid-card-controls">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => onSimulateBid(bid.id)}
                    >
                      + Simulate Incoming Vendor Bid
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onFinalizeBid(bid.id)}
                    >
                      🔒 Lock Final Price (Complete 24h)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FINALIZED / 24-HR COMPLETED BIDS */}
      <div>
        <h3 className="section-subtitle">
          🏁 Completed Auctions & Final Locked Prices ({completedBids.length})
        </h3>

        {completedBids.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            No past completed bidding cycles yet.
          </p>
        ) : (
          <div className="bids-grid">
            {completedBids.map((bid) => {
              const finalPrice = bid.finalPricePerQuintal || bid.currentHighestBid;
              const totalVal = bid.finalTotalValue || (finalPrice * bid.quantityQuintals);
              const winner = bid.winningVendor || bid.bidsList?.[bid.bidsList.length - 1];

              return (
                <div key={bid.id} className="bid-card completed-bid-card">
                  <div className="bid-header">
                    <div>
                      <span className="bid-crop-tag completed">{bid.cropName}</span>
                      <h4 className="bid-title">{bid.quantityQuintals} Quintals Lot</h4>
                    </div>
                    <span className="completed-badge">✓ 24h Ended</span>
                  </div>

                  <div className="final-price-banner">
                    <div className="final-price-lbl">🏆 Final Locked Winning Price:</div>
                    <div className="final-price-amt">
                      ₹{finalPrice.toLocaleString('en-IN')} <span style={{ fontSize: '1rem' }}>/ Quintal</span>
                    </div>
                    <div className="final-total-amt">
                      Total Sale Amount: <strong>₹{totalVal.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="user-info-box" style={{ marginTop: '1rem', marginBottom: '0' }}>
                    <div className="info-row">
                      <span className="info-label">Winning Vendor:</span>
                      <span className="info-val">{winner?.vendorName || 'Apex Agro Commodities'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Vendor Location:</span>
                      <span className="info-val">{winner?.vendorLocation || 'APMC Trading Zone'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Received Bids:</span>
                      <span className="info-val">{bid.bidsList?.length || 1} bids in 24 hrs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
