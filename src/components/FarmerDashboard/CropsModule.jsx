import React, { useState } from 'react';
import { SAMPLE_CROP_IMAGES } from '../../services/farmerData';

export default function CropsModule({
  crops,
  onAddCrop,
  onAddProgressPhoto,
  onPushToBidding
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCropForUpdate, setSelectedCropForUpdate] = useState(null);
  const [selectedCropForPush, setSelectedCropForPush] = useState(null);

  // New Crop Form
  const [cropForm, setCropForm] = useState({
    cropName: 'Paddy',
    category: 'Grains & Cereals',
    variety: '',
    acresAllocated: '2.5',
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    photoUrl: SAMPLE_CROP_IMAGES.Paddy,
    customPhotoUrl: ''
  });

  // Progress Update Form
  const [progressForm, setProgressForm] = useState({
    stage: 'Vegetative Growth',
    note: '',
    photoUrl: '',
    customPhotoUrl: ''
  });

  // Push to Bidding Form
  const [biddingForm, setBiddingForm] = useState({
    quantityQuintals: '20',
    basePricePerQuintal: ''
  });

  const handleCropSubmit = (e) => {
    e.preventDefault();
    if (!cropForm.cropName || !cropForm.expectedHarvestDate) return;

    onAddCrop({
      ...cropForm,
      photoUrl: cropForm.customPhotoUrl || cropForm.photoUrl
    });

    setShowAddModal(false);
    setCropForm({
      cropName: 'Paddy',
      category: 'Grains & Cereals',
      variety: '',
      acresAllocated: '2.5',
      sowingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: '',
      photoUrl: SAMPLE_CROP_IMAGES.Paddy,
      customPhotoUrl: ''
    });
  };

  const handleProgressSubmit = (e) => {
    e.preventDefault();
    if (!selectedCropForUpdate) return;

    onAddProgressPhoto(selectedCropForUpdate.id, {
      stage: progressForm.stage,
      note: progressForm.note,
      photoUrl: progressForm.customPhotoUrl || progressForm.photoUrl || selectedCropForUpdate.photoUrl
    });

    setSelectedCropForUpdate(null);
    setProgressForm({
      stage: 'Vegetative Growth',
      note: '',
      photoUrl: '',
      customPhotoUrl: ''
    });
  };

  const handlePushSubmit = (e) => {
    e.preventDefault();
    if (!selectedCropForPush) return;

    onPushToBidding({
      cropId: selectedCropForPush.id,
      cropName: selectedCropForPush.cropName,
      quantityQuintals: biddingForm.quantityQuintals,
      basePricePerQuintal: biddingForm.basePricePerQuintal
    });

    setSelectedCropForPush(null);
  };

  return (
    <div className="module-container">
      {/* Module Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">🌾 Cultivated Crops Management</h2>
          <p className="module-desc">
            Track all your active crops, harvest dates, and maintain dated growth photos from sowing till harvest.
          </p>
        </div>
        <button
          id="btn-add-new-crop"
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Cultivated Crop
        </button>
      </div>

      {/* Crops List */}
      {crops.length === 0 ? (
        <div className="empty-module-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌱</div>
          <h3>No Cultivated Crops Registered Yet</h3>
          <p>Register your current cultivated crops with photos, land area, and expected harvest dates.</p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => setShowAddModal(true)}
          >
            Add Your First Crop
          </button>
        </div>
      ) : (
        <div className="crops-grid">
          {crops.map((crop) => {
            const today = new Date();
            const harvestDate = new Date(crop.expectedHarvestDate);
            const diffTime = harvestDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div key={crop.id} className="crop-card">
                <div className="crop-image-header">
                  <img
                    src={crop.photoUrl}
                    alt={crop.cropName}
                    className="crop-card-img"
                    onError={(e) => {
                      e.target.src = SAMPLE_CROP_IMAGES.Paddy;
                    }}
                  />
                  <span className="crop-badge-status">{crop.stage || 'Cultivating'}</span>
                </div>

                <div className="crop-card-body">
                  <div className="crop-title-row">
                    <h3 className="crop-name">{crop.cropName}</h3>
                    <span className="crop-acres-tag">{crop.acresAllocated} Acres</span>
                  </div>

                  <p className="crop-meta">
                    <strong>Variety:</strong> {crop.variety || 'Hybrid Regular'} | <strong>Category:</strong> {crop.category}
                  </p>

                  <div className="harvest-box">
                    <div className="harvest-label">📅 Expected Harvest Date</div>
                    <div className="harvest-date">
                      {new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                      {diffDays > 0 ? (
                        <span className="days-left-badge">({diffDays} days left)</span>
                      ) : (
                        <span className="days-left-badge ready-badge">Ready for Harvest!</span>
                      )}
                    </div>
                  </div>

                  {/* Growth Progress Timeline / Photos */}
                  <div className="progress-section">
                    <div className="progress-section-header">
                      <span>📸 Growth Progress & Photos ({crop.progressLogs?.length || 0})</span>
                    </div>

                    <div className="progress-thumbnails-row">
                      {crop.progressLogs &&
                        crop.progressLogs.map((log) => (
                          <div key={log.id} className="thumb-item" title={`${log.stage}: ${log.note || ''}`}>
                            <img src={log.photoUrl} alt={log.stage} className="thumb-img" />
                            <span className="thumb-caption">{log.stage.split(' ')[0]}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="crop-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setSelectedCropForUpdate(crop);
                        setProgressForm({
                          stage: 'Flowering Stage',
                          note: '',
                          photoUrl: crop.photoUrl,
                          customPhotoUrl: ''
                        });
                      }}
                    >
                      + Update Growth Photo
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedCropForPush(crop);
                        setBiddingForm({
                          quantityQuintals: String(crop.acresAllocated * 10),
                          basePricePerQuintal: ''
                        });
                      }}
                    >
                      ⚡ Push to Bidding
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Add New Crop */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>🌱 Register Cultivated Crop</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCropSubmit}>
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Crop Name *</label>
                    <select
                      className="form-input"
                      value={cropForm.cropName}
                      onChange={(e) => {
                        const name = e.target.value;
                        setCropForm((prev) => ({
                          ...prev,
                          cropName: name,
                          photoUrl: SAMPLE_CROP_IMAGES[name] || SAMPLE_CROP_IMAGES.Paddy
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

                  <div className="form-group">
                    <label className="form-label">Variety / Type</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sona Masoori, Bt Hybrid"
                      value={cropForm.variety}
                      onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Cultivated Land (Acres) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      className="form-input"
                      value={cropForm.acresAllocated}
                      onChange={(e) => setCropForm({ ...cropForm, acresAllocated: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Harvest Date *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={cropForm.expectedHarvestDate}
                      onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Crop Photo</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img
                      src={cropForm.customPhotoUrl || cropForm.photoUrl}
                      alt="Crop Preview"
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                    />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Custom photo URL (or uses default agritech photo)"
                      value={cropForm.customPhotoUrl}
                      onChange={(e) => setCropForm({ ...cropForm, customPhotoUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Cultivated Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Update Growth Photo & Stage */}
      {selectedCropForUpdate && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>📸 Update Growth Photo & Stage — {selectedCropForUpdate.cropName}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedCropForUpdate(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProgressSubmit}>
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Current Growth Stage *</label>
                  <select
                    className="form-input"
                    value={progressForm.stage}
                    onChange={(e) => setProgressForm({ ...progressForm, stage: e.target.value })}
                  >
                    <option value="Vegetative Growth">Vegetative Growth</option>
                    <option value="Flowering Stage">Flowering Stage</option>
                    <option value="Fruit / Grain Formation">Fruit / Grain Formation</option>
                    <option value="Maturation / Ready to Harvest">Maturation / Ready to Harvest</option>
                    <option value="Harvested">Harvested</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Farmer Observation / Note</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Drip applied, healthy leaves, high grain density."
                    value={progressForm.note}
                    onChange={(e) => setProgressForm({ ...progressForm, note: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Progress Photo URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Paste image link (or uses current crop photo)"
                    value={progressForm.customPhotoUrl}
                    onChange={(e) => setProgressForm({ ...progressForm, customPhotoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCropForUpdate(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Growth Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Push to 24hr Bidding */}
      {selectedCropForPush && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>⚡ Push {selectedCropForPush.cropName} to 24-Hour Bidding</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedCropForPush(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Your crop lot will be listed for live vendor bidding for <strong>24 Hours</strong>.
              Vendors will place real-time bids and the highest final price will lock at the 24-hour mark.
            </p>

            <form onSubmit={handlePushSubmit}>
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity to Sell (Quintals) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={biddingForm.quantityQuintals}
                    onChange={(e) => setBiddingForm({ ...biddingForm, quantityQuintals: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Base Floor Price per Quintal (₹)</label>
                  <input
                    type="number"
                    min="500"
                    className="form-input"
                    placeholder="e.g. 6800 (Auto-filled by Mandi benchmark if blank)"
                    value={biddingForm.basePricePerQuintal}
                    onChange={(e) => setBiddingForm({ ...biddingForm, basePricePerQuintal: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCropForPush(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Start 24-Hour Bidding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
