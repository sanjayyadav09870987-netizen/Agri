import React, { useState, useEffect } from 'react';
import {
  getMatchingBiddingLots,
  placeBidOnMatchingLot,
  farmerAcceptsVendorBid,
  farmerRejectsVendorBid
} from '../../services/vendorPreferencesStore';

export default function VendorBiddingSection({
  user,
  preferences,
  currentTime,
  onNavigateToPreferences,
  onNavigateToDashboard,
  onShowGlobalToast
}) {
  const [matchingLots, setMatchingLots] = useState([]);
  const [bidInputs, setBidInputs] = useState({});
  const [bidMessages, setBidMessages] = useState({});
  const [biddingFilter, setBiddingFilter] = useState('all'); // 'all' | 'my_bids' | 'unbidded'

  const loadLots = () => {
    if (user && preferences) {
      const lots = getMatchingBiddingLots(user, preferences);
      setMatchingLots(lots);
    }
  };

  useEffect(() => {
    loadLots();
  }, [user, preferences]);

  const formatCountdown = (expiresAt) => {
    const remaining = Math.max(0, expiresAt - currentTime);
    if (remaining <= 0) return '00h 00m 00s (24h Closed)';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  // Handle Bid Amount Input Change
  const handleBidInputChange = (lotId, value) => {
    setBidInputs((prev) => ({
      ...prev,
      [lotId]: value
    }));
    if (bidMessages[lotId]) {
      setBidMessages((prev) => ({ ...prev, [lotId]: null }));
    }
  };

  // Handle Place Bid Submission
  const handlePlaceBidSubmit = (e, lot) => {
    e.preventDefault();
    const enteredAmt = bidInputs[lot.id] || (lot.currentHighestBid + 50);

    const res = placeBidOnMatchingLot(lot.id, user, Number(enteredAmt));
    if (res.success) {
      setBidMessages((prev) => ({
        ...prev,
        [lot.id]: { type: 'success', text: `✓ Bid of ₹${Number(enteredAmt).toLocaleString('en-IN')}/Qtl placed successfully!` }
      }));
      loadLots();

      if (onShowGlobalToast) {
        onShowGlobalToast({
          type: 'success',
          text: `⚡ Bid of ₹${Number(enteredAmt).toLocaleString('en-IN')}/Qtl submitted on Lot ${lot.id} (${lot.cropName}). Awaiting farmer review!`
        });
      }
    } else {
      setBidMessages((prev) => ({
        ...prev,
        [lot.id]: { type: 'error', text: res.message }
      }));
    }
  };

  // Farmer Decision: ACCEPT Bid
  const handleFarmerAccept = (lot) => {
    const res = farmerAcceptsVendorBid(lot.id, user);
    if (res.success) {
      loadLots();
      if (onShowGlobalToast) {
        onShowGlobalToast({
          type: 'success',
          text: `🎉 Your bid for ${lot.cropName} was accepted. The crop has been allocated to you. Please complete the purchase within 24 hours.`
        });
      }
    }
  };

  // Farmer Decision: REJECT Bid
  const handleFarmerReject = (lot) => {
    const res = farmerRejectsVendorBid(lot.id, user);
    if (res.success) {
      loadLots();
      if (onShowGlobalToast) {
        onShowGlobalToast({
          type: 'warning',
          text: `✕ Your bid for ${lot.cropName} was rejected by the farmer.`
        });
      }
    }
  };

  // Filter lots
  const displayedLots = matchingLots.filter((lot) => {
    if (biddingFilter === 'my_bids') return Boolean(lot.myBid);
    if (biddingFilter === 'unbidded') return !lot.myBid;
    return true;
  });

  return (
    <div className="bidding-section-container">
      {/* Header Banner */}
      <div className="bidding-header-card">
        <div className="bhc-info">
          <span className="bhc-tag">⚡ Section 3</span>
          <h1 className="bhc-title">Live 24-Hour Crop Bidding</h1>
          <p className="bhc-desc">
            Explore farmer crop lots matching your saved Buying Preferences (within <strong>{preferences?.maxDistanceKm || 50} km</strong>, selected crop categories, and <strong>{preferences?.minQuantityKg || 500} - {preferences?.maxQuantityKg || 5000} kg</strong> lot size).
          </p>
        </div>

        <div className="bhc-actions">
          <button
            id="btn-edit-preferences"
            type="button"
            className="btn btn-outline btn-sm"
            style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
            onClick={onNavigateToPreferences}
          >
            ⚙️ Edit Buying Preferences
          </button>
        </div>
      </div>

      {/* Preferences Summary Filter Bar */}
      <div className="active-preferences-strip">
        <div className="aps-title">
          <span>🎯 Active Match Filters:</span>
        </div>
        <div className="aps-pills">
          <span className="aps-pill">
            📍 Max Distance: <strong>≤ {preferences?.maxDistanceKm} km</strong>
          </span>
          <span className="aps-pill">
            🌾 Crops ({preferences?.selectedCropTypes?.length || 0}):{' '}
            <strong>{preferences?.selectedCropTypes?.slice(0, 3).join(', ')}{preferences?.selectedCropTypes?.length > 3 ? '...' : ''}</strong>
          </span>
          <span className="aps-pill">
            ⚖️ Quantity:{' '}
            <strong>
              {preferences?.minQuantityKg} kg – {preferences?.maxQuantityKg} kg
            </strong>
          </span>
        </div>

        <div className="aps-counts">
          <span>{matchingLots.length} Eligible Crop Lot(s)</span>
        </div>
      </div>

      {/* Sub Filter Tab Bar */}
      <div className="bidding-sub-filter-bar">
        <div className="bsf-buttons">
          <button
            type="button"
            className={`bsf-btn ${biddingFilter === 'all' ? 'active' : ''}`}
            onClick={() => setBiddingFilter('all')}
          >
            All Matching Lots ({matchingLots.length})
          </button>
          <button
            type="button"
            className={`bsf-btn ${biddingFilter === 'my_bids' ? 'active' : ''}`}
            onClick={() => setBiddingFilter('my_bids')}
          >
            My Active Bids ({matchingLots.filter((l) => l.myBid).length})
          </button>
          <button
            type="button"
            className={`bsf-btn ${biddingFilter === 'unbidded' ? 'active' : ''}`}
            onClick={() => setBiddingFilter('unbidded')}
          >
            Available to Bid ({matchingLots.filter((l) => !l.myBid).length})
          </button>
        </div>

        <div className="privacy-guarantee-pill" style={{ marginLeft: 'auto' }}>
          🔒 Privacy Protected: Farmer personal IDs hidden until bid acceptance
        </div>
      </div>

      {/* Matching Lots Grid */}
      {displayedLots.length === 0 ? (
        <div className="empty-module-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌾</div>
          <h3>No Crop Lots Match Your Current Filter Criteria</h3>
          <p>
            Try expanding your maximum distance (up to 100 km), selecting more crop types, or widening your quantity range in <strong>Buying Preferences</strong>.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={onNavigateToPreferences}
          >
            ⚙️ Adjust Buying Preferences
          </button>
        </div>
      ) : (
        <div className="bidding-lots-grid">
          {displayedLots.map((lot) => {
            const hasPlacedBid = Boolean(lot.myBid);
            const isAccepted = lot.isMyBidAccepted;
            const isRejected = lot.isMyBidRejected;
            const currentBidVal = lot.currentHighestBid || lot.basePrice;
            const myBidAmt = lot.myBid?.bidAmountPerQuintal;
            const isHighestBidder = hasPlacedBid && myBidAmt >= currentBidVal;
            const defaultBidVal = bidInputs[lot.id] !== undefined ? bidInputs[lot.id] : (currentBidVal + 50);

            return (
              <div key={lot.id} className={`bidding-crop-card ${isAccepted ? 'card-accepted' : isRejected ? 'card-rejected' : hasPlacedBid ? 'card-bidded' : ''}`}>
                <div className="bcc-image-wrap">
                  <img
                    src={lot.cropPicture}
                    alt={lot.cropName}
                    className="bcc-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="bcc-badge-distance">
                    📍 <strong>{lot.distanceKm} km</strong> from hub
                  </div>

                  <div className={`bcc-status-badge ${lot.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {isAccepted ? '🏆 Bid Accepted & Allocated' : isRejected ? '✕ Bid Rejected' : `⏱️ 24h Bidding Active`}
                  </div>

                  <span className="lot-id-chip">{lot.id}</span>
                </div>

                <div className="bcc-content">
                  {/* Crop Header */}
                  <div className="bcc-header">
                    <div>
                      <h3 className="bcc-crop-name">{lot.cropName}</h3>
                      <span className="bcc-qty-tag">⚖️ {lot.quantity}</span>
                    </div>

                    <div className="timer-pill">
                      <span className="timer-icon">⏱️</span>
                      <span>{formatCountdown(lot.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Pickup Address */}
                  <div className="bcc-address-box">
                    <span className="bcc-addr-icon">📍</span>
                    <span className="bcc-addr-text">
                      <strong>Location:</strong> {lot.cropAddress}
                    </span>
                  </div>

                  {/* Privacy Badge if not accepted */}
                  {!isAccepted && (
                    <div className="privacy-badge-inline" style={{ margin: '0.4rem 0 0.75rem' }}>
                      🔒 <em>Farmer phone & personal ID are protected until bid acceptance.</em>
                    </div>
                  )}

                  {/* Pricing Matrix */}
                  <div className="bcc-price-grid">
                    <div className="bcc-pbox">
                      <span className="bcc-plbl">Farmer Listed Floor</span>
                      <span className="bcc-pval">₹{lot.basePrice?.toLocaleString('en-IN')}/Qtl</span>
                    </div>
                    <div className="bcc-pbox highlight">
                      <span className="bcc-plbl">🔥 Current Highest Bid</span>
                      <span className="bcc-pval highlight">₹{currentBidVal?.toLocaleString('en-IN')}/Qtl</span>
                    </div>
                    <div className="bcc-pbox">
                      <span className="bcc-plbl">Est. Lot Value</span>
                      <span className="bcc-pval">₹{(currentBidVal * (lot.quantityNumber || 10)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Placed Bid Status Banner */}
                  {hasPlacedBid && !isAccepted && !isRejected && (
                    <div className={`my-bid-pill ${isHighestBidder ? 'highest' : 'outbid'}`}>
                      <span>
                        🏷️ Your Bid: <strong>₹{myBidAmt?.toLocaleString('en-IN')}/Qtl</strong>
                      </span>
                      <span className="mb-tag">
                        {isHighestBidder ? '👑 Highest Bidder' : '⚠️ Outbid'}
                      </span>
                    </div>
                  )}

                  {/* Feedback Message */}
                  {bidMessages[lot.id] && (
                    <div className={`alert ${bidMessages[lot.id].type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ margin: '0.65rem 0', padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}>
                      {bidMessages[lot.id].text}
                    </div>
                  )}

                  {/* ACCEPTED STATE: REVEALS FARMER DETAILS & LINK TO ALLOCATED LOTS */}
                  {isAccepted && (
                    <div className="revealed-farmer-box" style={{ margin: '0.75rem 0' }}>
                      <div className="rf-header">
                        <span>🔓 Farmer Details Released (Bid Accepted)</span>
                        <span className="verified-badge">✓ Allocated to You</span>
                      </div>
                      <div className="user-info-box" style={{ background: '#ffffff', margin: 0, padding: '0.65rem' }}>
                        <div className="info-row">
                          <span className="info-label">Farmer Name:</span>
                          <span className="info-val">{lot.farmerDetails?.fullName || 'Farmer Partner'}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Direct Contact:</span>
                          <span className="info-val" style={{ color: '#047857', fontWeight: 700 }}>
                            📞 {lot.farmerDetails?.mobileNumber || lot.farmerMobile || '9876543210'}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Survey Reference:</span>
                          <span className="info-val">{lot.farmerDetails?.landSurveyNumber || 'SY-402/1A'}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '0.65rem' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', backgroundColor: '#059669' }}
                          onClick={onNavigateToDashboard}
                        >
                          📦 View in Dashboard → Allocated Lots (Purchase within 24h)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* REJECTED STATE */}
                  {isRejected && (
                    <div className="rejected-confirmation-box" style={{ margin: '0.75rem 0' }}>
                      <strong>Bid Rejected:</strong> Your bid was not accepted by the farmer. No lot allocation was made.
                    </div>
                  )}

                  {/* BIDDING FORM */}
                  {!isAccepted && !isRejected && (
                    <form onSubmit={(e) => handlePlaceBidSubmit(e, lot)} className="bcc-bid-form">
                      <div className="bid-input-group">
                        <span className="bid-currency-symbol">₹</span>
                        <input
                          id={`input-bid-amt-${lot.id}`}
                          type="number"
                          min={currentBidVal + 1}
                          step="50"
                          required
                          placeholder={`Min ₹${currentBidVal + 50}`}
                          className="form-input bid-field"
                          value={defaultBidVal}
                          onChange={(e) => handleBidInputChange(lot.id, e.target.value)}
                        />
                        <span className="bid-unit-tag">/ Quintal</span>
                      </div>

                      <button
                        id={`btn-place-bid-${lot.id}`}
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        ⚡ {hasPlacedBid ? 'Raise Bid' : 'Place Bid'} (₹{((Number(defaultBidVal) || 0) * (lot.quantityNumber || 10)).toLocaleString('en-IN')})
                      </button>
                    </form>
                  )}

                  {/* INTERACTIVE FARMER DECISION SIMULATION BAR (FOR TESTING) */}
                  {!isAccepted && !isRejected && (
                    <div className="farmer-decision-simulation-bar">
                      <span className="fds-title">👨‍🌾 Farmer Decision Simulator:</span>
                      <div className="fds-btns">
                        <button
                          id={`btn-simulate-accept-${lot.id}`}
                          type="button"
                          className="fds-btn accept"
                          title="Simulate Farmer accepting this vendor's bid"
                          onClick={() => handleFarmerAccept(lot)}
                        >
                          ✓ Farmer Accepts
                        </button>
                        <button
                          id={`btn-simulate-reject-${lot.id}`}
                          type="button"
                          className="fds-btn reject"
                          title="Simulate Farmer rejecting this vendor's bid"
                          onClick={() => handleFarmerReject(lot)}
                        >
                          ✕ Farmer Rejects
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
