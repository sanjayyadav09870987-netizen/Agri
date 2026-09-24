import React, { useState, useEffect } from 'react';
import {
  SAMPLE_CROP_IMAGES,
  getSellCropsForFarmer,
  pushCropForBidding,
  finalize24HourBidding,
  acceptBidByFarmer,
  rejectBidByFarmer
} from '../../services/marketplaceStore';

export default function SellCropSection({ user }) {
  const [crops, setCrops] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showPushModal, setShowPushModal] = useState(false);

  // Form State
  const defaultAddress = user
    ? `${user.village || 'Farm Village'}, ${user.mandal || ''}, ${user.district || ''} - ${user.pincode || ''} (Survey No: ${user.landSurveyNumber || 'N/A'})`
    : '';

  const [form, setForm] = useState({
    cropName: 'Cotton',
    quantity: '30',
    cropPhotos: [SAMPLE_CROP_IMAGES.Cotton],
    customPhotoUrl: '',
    cropAddress: defaultAddress,
    basePrice: '7200'
  });

  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Load crops for this farmer
  const loadCrops = () => {
    if (user?.mobileNumber) {
      setCrops(getSellCropsForFarmer(user.mobileNumber));
    }
  };

  useEffect(() => {
    loadCrops();
  }, [user?.mobileNumber]);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (expiresAt) => {
    const remaining = Math.max(0, expiresAt - currentTime);
    if (remaining <= 0) return '00h 00m 00s (24h Ended)';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  // Submit Sell Crop
  const handlePushSubmit = (e) => {
    e.preventDefault();
    if (!form.cropName || !form.quantity) return;

    const photo = form.customPhotoUrl || form.cropPhotos[0] || SAMPLE_CROP_IMAGES[form.cropName] || SAMPLE_CROP_IMAGES.Paddy;

    pushCropForBidding(user, {
      cropName: form.cropName,
      quantity: `${form.quantity} Quintals`,
      quantityNumber: Number(form.quantity),
      cropPhotos: [photo],
      cropAddress: form.cropAddress || defaultAddress,
      basePrice: Number(form.basePrice) || 2500
    });

    loadCrops();
    setShowPushModal(false);
    setFeedbackMsg({
      type: 'success',
      text: `🎉 "${form.cropName}" has been successfully published to the Vendor marketplace for 24-hour bidding!`
    });

    // Reset Form
    setForm({
      cropName: 'Cotton',
      quantity: '30',
      cropPhotos: [SAMPLE_CROP_IMAGES.Cotton],
      customPhotoUrl: '',
      cropAddress: defaultAddress,
      basePrice: '7200'
    });
  };

  // Farmer Decision: Accept Bid
  const handleAcceptBid = (cropId, cropName, vendorCompany) => {
    acceptBidByFarmer(cropId);
    loadCrops();
    setFeedbackMsg({
      type: 'success',
      text: `✅ Bid Accepted for "${cropName}"! Your complete contact and farm details have been securely shared with winning vendor "${vendorCompany}".`
    });
  };

  // Farmer Decision: Reject Bid
  const handleRejectBid = (cropId, cropName) => {
    rejectBidByFarmer(cropId);
    loadCrops();
    setFeedbackMsg({
      type: 'warning',
      text: `❌ Bid Rejected for "${cropName}". Your personal and contact details were NOT shared with any vendor.`
    });
  };

  // Testing helper: Fast-forward 24h
  const handleFastForward24h = (cropId) => {
    finalize24HourBidding(cropId);
    loadCrops();
  };

  return (
    <div className="sell-crop-container">
      {/* Header Banner */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">🏷️ Sell Crop & 24-Hour Bidding</h2>
          <p className="module-desc">
            Push your harvest lots to the live vendor marketplace for a 24-hour bidding cycle. You maintain full control to Accept or Reject the winning bid.
          </p>
        </div>
        <button
          id="btn-open-sell-crop-modal"
          type="button"
          className="btn btn-primary"
          onClick={() => setShowPushModal(true)}
        >
          + Push New Crop for Bidding
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`alert ${feedbackMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>{feedbackMsg.text}</div>
          <button
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => setFeedbackMsg(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* PUSHED CROPS LIST */}
      {crops.length === 0 ? (
        <div className="empty-module-card">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🌾</div>
          <h3>No Crops Listed for Bidding Yet</h3>
          <p style={{ maxWidth: '480px', margin: '0.5rem auto 1.5rem auto', color: 'var(--text-muted)' }}>
            Start selling by pushing your crop with quantity, photos, and address. Vendors will place real-time bids over a 24-hour cycle.
          </p>
          <button
            id="btn-push-first-crop"
            type="button"
            className="btn btn-primary"
            onClick={() => setShowPushModal(true)}
          >
            Push Your First Crop for Bidding
          </button>
        </div>
      ) : (
        <div className="sell-crops-grid">
          {crops.map((crop) => {
            const isBiddingActive = crop.status === 'Bidding Active' && crop.expiresAt > currentTime;
            const isCompletedAwaitingDecision = crop.status === 'Bidding Completed' || (crop.status === 'Bidding Active' && crop.expiresAt <= currentTime);
            const isAccepted = crop.status === 'Bid Accepted';
            const isRejected = crop.status === 'Bid Rejected';

            const winningVendor = crop.winningVendor || (crop.bidsList && crop.bidsList[crop.bidsList.length - 1]);
            const totalEstValue = crop.currentHighestBid * (crop.quantityNumber || 10);

            return (
              <div key={crop.id} className={`sell-crop-card ${crop.status.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="sell-crop-image-wrap">
                  <img
                    src={crop.cropPhotos?.[0] || SAMPLE_CROP_IMAGES.Paddy}
                    alt={crop.cropName}
                    className="sell-crop-img"
                    onError={(e) => {
                      e.target.src = SAMPLE_CROP_IMAGES.Paddy;
                    }}
                  />
                  <div className={`status-pill ${crop.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {crop.status === 'Bidding Active' && <span className="pulse-dot">●</span>}
                    {crop.status}
                  </div>
                </div>

                <div className="sell-crop-content">
                  <div className="sell-crop-header">
                    <div>
                      <h3 className="sell-crop-name">{crop.cropName}</h3>
                      <span className="sell-crop-qty">{crop.quantity}</span>
                    </div>

                    {isBiddingActive && (
                      <div className="timer-pill">
                        <span className="timer-icon">⏱️</span>
                        <span>{formatCountdown(crop.expiresAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="sell-crop-address">
                    📍 <strong>Crop Address:</strong> {crop.cropAddress}
                  </div>

                  {/* Price Banner */}
                  <div className="sell-price-grid">
                    <div className="sp-box">
                      <span className="sp-lbl">Base Starting Price</span>
                      <span className="sp-val">₹{crop.basePrice?.toLocaleString('en-IN')} / Qtl</span>
                    </div>
                    <div className="sp-box highlight">
                      <span className="sp-lbl">
                        {isAccepted ? '🏆 Final Accepted Price' : isCompletedAwaitingDecision ? '⭐ Highest Winning Bid' : '🔥 Current Highest Bid'}
                      </span>
                      <span className="sp-val highlight">
                        ₹{crop.currentHighestBid?.toLocaleString('en-IN')} / Qtl
                      </span>
                    </div>
                    <div className="sp-box">
                      <span className="sp-lbl">Total Lot Value</span>
                      <span className="sp-val">₹{totalEstValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Bids Log */}
                  <div className="bids-history-box" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="history-title">
                      <span>📊 Vendor Bids History ({crop.bidsList?.length || 0})</span>
                      {isBiddingActive && <span className="pulse-indicator">● Live Bidding Open</span>}
                    </div>

                    <div className="bids-list">
                      {crop.bidsList
                        ?.slice()
                        .reverse()
                        .map((b, idx) => (
                          <div key={b.id || idx} className={`bid-entry ${idx === 0 ? 'top-bid' : ''}`}>
                            <div className="bidder-info">
                              <span className="bidder-name">{b.vendorCompany}</span>
                              <span className="bidder-loc">{b.vendorLocation}</span>
                            </div>
                            <div className="bid-amount-wrap">
                              <span className="bid-amt">₹{b.bidAmountPerQuintal?.toLocaleString('en-IN')}</span>
                              {idx === 0 && <span className="highest-tag">Highest</span>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* ========================================================
                      FARMER NOTIFICATION & DECISION SECTION (24h Ended)
                      ======================================================== */}
                  {isCompletedAwaitingDecision && (
                    <div className="farmer-decision-banner">
                      <div className="decision-header">
                        <span className="bell-icon">🔔</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#92400e' }}>
                            24-Hour Bidding Completed!
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.825rem', color: '#78350f' }}>
                            Highest bid of <strong>₹{crop.currentHighestBid?.toLocaleString('en-IN')} / Qtl</strong> was placed by <strong>{winningVendor?.vendorCompany || 'Top Vendor'}</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="decision-actions">
                        <button
                          id={`btn-accept-bid-${crop.id}`}
                          type="button"
                          className="btn btn-primary"
                          style={{ flex: 1, backgroundColor: '#059669' }}
                          onClick={() => handleAcceptBid(crop.id, crop.cropName, winningVendor?.vendorCompany)}
                        >
                          ✓ Accept Bid
                        </button>
                        <button
                          id={`btn-reject-bid-${crop.id}`}
                          type="button"
                          className="btn btn-outline"
                          style={{ flex: 1, borderColor: '#ef4444', color: '#dc2626' }}
                          onClick={() => handleRejectBid(crop.id, crop.cropName)}
                        >
                          ✕ Reject Bid
                        </button>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
                        🔒 <em>If accepted, your full contact details will be revealed strictly to {winningVendor?.vendorCompany}. If rejected, your private details remain 100% hidden.</em>
                      </div>
                    </div>
                  )}

                  {/* ACCEPTED STATE CONFIRMATION */}
                  {isAccepted && (
                    <div className="accepted-confirmation-box">
                      <div className="ac-title">✅ Bid Accepted & Deal Finalized</div>
                      <div className="ac-desc">
                        Selected Winning Buyer: <strong>{winningVendor?.vendorCompany}</strong> ({winningVendor?.vendorLocation}).
                        Your complete contact and farm details have been securely disclosed to this vendor to arrange pickup and settlement.
                      </div>
                    </div>
                  )}

                  {/* REJECTED STATE CONFIRMATION */}
                  {isRejected && (
                    <div className="rejected-confirmation-box">
                      <div className="rc-title">✕ Bid Rejected</div>
                      <div className="rc-desc">
                        You rejected the final bid. Your registration details and personal contact information were <strong>NOT</strong> shared with any vendor.
                      </div>
                    </div>
                  )}

                  {/* ACTIVE BIDDING CONTROLS / TEST FAST-FORWARD */}
                  {isBiddingActive && (
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        id={`btn-ff-24h-${crop.id}`}
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Fast-forward 24 hours to test farmer notification & Accept/Reject decision"
                        onClick={() => handleFastForward24h(crop.id)}
                      >
                        ⚡ Fast-Forward 24h Auction (Test)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL: PUSH CROP FOR BIDDING
          ======================================================== */}
      {showPushModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>🌾 Push Crop for 24-Hour Bidding</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowPushModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Publish your crop lot to registered vendors on AgriTradeX. A 24-hour bidding period will begin immediately.
            </p>

            <form onSubmit={handlePushSubmit}>
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-grid-2col">
                  {/* Crop Name */}
                  <div className="form-group">
                    <label className="form-label">Crop Name *</label>
                    <select
                      className="form-input"
                      value={form.cropName}
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          cropName: name,
                          cropPhotos: [SAMPLE_CROP_IMAGES[name] || SAMPLE_CROP_IMAGES.Paddy]
                        }));
                      }}
                    >
                      {Object.keys(SAMPLE_CROP_IMAGES).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="form-group">
                    <label className="form-label">Quantity (in Quintals) *</label>
                    <input
                      id="input-sell-quantity"
                      type="number"
                      min="1"
                      required
                      className="form-input"
                      placeholder="e.g. 50"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    />
                  </div>
                </div>

                {/* Base Starting Price */}
                <div className="form-group">
                  <label className="form-label">Floor / Base Price (₹ per Quintal) *</label>
                  <input
                    id="input-sell-base-price"
                    type="number"
                    min="500"
                    step="50"
                    required
                    className="form-input"
                    placeholder="e.g. 7200"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  />
                </div>

                {/* Crop Pictures */}
                <div className="form-group">
                  <label className="form-label">Crop Picture *</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <img
                      src={form.customPhotoUrl || form.cropPhotos[0] || SAMPLE_CROP_IMAGES[form.cropName]}
                      alt="Preview"
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
                    />
                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <input
                        type="file"
                        id="input-sell-crop-photo-file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setForm((prev) => ({ ...prev, customPhotoUrl: ev.target.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => document.getElementById('input-sell-crop-photo-file')?.click()}
                        >
                          📷 Upload from Device
                        </button>
                        {form.customPhotoUrl && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.8rem' }}
                            onClick={() => setForm((prev) => ({ ...prev, customPhotoUrl: '' }))}
                          >
                            Reset to Default
                          </button>
                        )}
                      </div>
                      <span className="field-hint" style={{ fontSize: '0.725rem' }}>
                        Upload clear, recent JPG/PNG photo of your actual crop
                      </span>
                    </div>
                  </div>
                </div>

                {/* Crop Address */}
                <div className="form-group">
                  <label className="form-label">Crop Address (Pickup / Farm Location) *</label>
                  <textarea
                    id="input-sell-address"
                    rows={2}
                    required
                    className="form-input"
                    placeholder="Farm Survey Number, Village, Mandal, District, Pincode"
                    value={form.cropAddress}
                    onChange={(e) => setForm({ ...form, cropAddress: e.target.value })}
                  />
                </div>

                {/* ========================================================
                    IMPORTANT NOTE FOR FARMERS: CROP QUALITY & PRICE NOTICE
                    ======================================================== */}
                <div
                  id="notice-crop-quality-and-price"
                  className="crop-quality-notice-card"
                  style={{
                    gridColumn: '1 / -1',
                    background: '#fffbeb',
                    border: '1.5px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '1.1rem 1.25rem',
                    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.35rem' }}>⚠️</span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      IMPORTANT NOTE FOR FARMERS
                    </h4>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#78350f', marginBottom: '0.5rem' }}>
                    Crop Quality & Price Notice
                  </div>

                  <p style={{ fontSize: '0.825rem', color: '#78350f', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
                    The crop pictures uploaded by the farmer should accurately represent the actual quality and condition of the crop.
                  </p>

                  <div
                    style={{
                      fontSize: '0.825rem',
                      color: '#92400e',
                      margin: '0 0 0.5rem 0',
                      fontWeight: 700,
                      lineHeight: 1.5,
                      background: 'rgba(245, 158, 11, 0.18)',
                      borderLeft: '3px solid #d97706',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '0 4px 4px 0'
                    }}
                  >
                    If the actual crop quality is different from the quality shown in the uploaded crop pictures, the final purchase price may vary based on the actual crop quality at the time of purchase.
                  </div>

                  <p style={{ fontSize: '0.825rem', color: '#78350f', margin: '0 0 0.35rem 0', lineHeight: 1.5 }}>
                    The final price may be adjusted after the vendor verifies the actual crop quality.
                  </p>

                  <p style={{ fontSize: '0.825rem', color: '#78350f', margin: 0, lineHeight: 1.5, fontWeight: 700 }}>
                    • The farmer should upload clear and recent pictures of the crop.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPushModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-push-bidding"
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 700 }}
                >
                  ⚡ Push for Bidding (24h)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
