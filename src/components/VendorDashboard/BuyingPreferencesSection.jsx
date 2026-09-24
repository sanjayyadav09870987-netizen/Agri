import React, { useState, useEffect } from 'react';
import {
  AVAILABLE_CROP_TYPES,
  getVendorBuyingPreferences,
  saveVendorBuyingPreferences
} from '../../services/vendorPreferencesStore';

export default function BuyingPreferencesSection({ user, onSavedAndContinue }) {
  // Load existing preferences if available, or initialize defaults
  const [distanceKm, setDistanceKm] = useState(50);
  const [selectedCrops, setSelectedCrops] = useState(['Cotton', 'Rice', 'Turmeric', 'Maize']);
  const [minQuantityKg, setMinQuantityKg] = useState('500');
  const [maxQuantityKg, setMaxQuantityKg] = useState('5000');

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      const existing = getVendorBuyingPreferences(user);
      if (existing) {
        setDistanceKm(existing.maxDistanceKm || 50);
        setSelectedCrops(existing.selectedCropTypes || ['Cotton', 'Rice', 'Turmeric']);
        setMinQuantityKg(String(existing.minQuantityKg || '500'));
        setMaxQuantityKg(String(existing.maxQuantityKg || '5000'));
      }
    }
  }, [user]);

  const handleCropToggle = (cropId) => {
    setSelectedCrops((prev) => {
      if (prev.includes(cropId)) {
        return prev.filter((id) => id !== cropId);
      } else {
        return [...prev, cropId];
      }
    });
    if (errors.crops) {
      setErrors((prev) => ({ ...prev, crops: '' }));
    }
  };

  const handleSelectAllCrops = () => {
    setSelectedCrops(AVAILABLE_CROP_TYPES.map((c) => c.id));
    if (errors.crops) {
      setErrors((prev) => ({ ...prev, crops: '' }));
    }
  };

  const handleClearAllCrops = () => {
    setSelectedCrops([]);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg('');

    const newErrors = {};

    // 1. Distance Validation (0 - 100 km)
    const dist = Number(distanceKm);
    if (isNaN(dist) || dist <= 0 || dist > 100) {
      newErrors.distance = 'Please select a valid maximum buying distance between 1 km and 100 km.';
    }

    // 2. Crop Types Validation (at least 1)
    if (!selectedCrops || selectedCrops.length === 0) {
      newErrors.crops = 'Please select at least one crop type preference.';
    }

    // 3. Quantity Range Validation
    const minQ = Number(minQuantityKg);
    const maxQ = Number(maxQuantityKg);

    if (isNaN(minQ) || minQ <= 0) {
      newErrors.minQuantity = 'Minimum quantity must be greater than 0 kg.';
    }

    if (isNaN(maxQ) || maxQ <= 0) {
      newErrors.maxQuantity = 'Maximum quantity must be greater than 0 kg.';
    } else if (minQ > 0 && maxQ <= minQ) {
      newErrors.maxQuantity = `Maximum quantity (${maxQ} kg) must be strictly greater than minimum quantity (${minQ} kg).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save preferences
    const res = saveVendorBuyingPreferences(user, {
      maxDistanceKm: dist,
      selectedCropTypes: selectedCrops,
      minQuantityKg: minQ,
      maxQuantityKg: maxQ
    });

    if (res.success) {
      setSuccessMsg('✓ Buying preferences saved successfully! Redirecting to Section 3: Bidding...');
      setTimeout(() => {
        if (onSavedAndContinue) {
          onSavedAndContinue();
        }
      }, 900);
    } else {
      setErrors({ form: res.message || 'Failed to save preferences.' });
    }
  };

  return (
    <div className="preferences-section-container">
      {/* Header Banner */}
      <div className="preferences-header-card">
        <div className="phc-info">
          <span className="phc-tag">⚙️ Section 2</span>
          <h1 className="phc-title">Vendor Buying Preferences</h1>
          <p className="phc-desc">
            Define your sourcing boundaries, crop categories, and lot volume capacities. The system will strictly filter farmer crop lots matching your exact parameters in the Bidding portal.
          </p>
        </div>
        <div className="mandatory-badge-pill">
          ⚠️ Mandatory Setup Required Before Bidding
        </div>
      </div>

      {errors.form && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          ⚠️ {errors.form}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSaveSubmit} className="preferences-form">
        {/* ========================================================
            MODULE 1: DISTANCE RANGE (0 to 100 km)
            ======================================================== */}
        <div className="pref-module-card">
          <div className="pref-module-header">
            <div className="pmh-left">
              <span className="pref-icon-circle blue">📍</span>
              <div>
                <span className="pmh-tag">MODULE 1</span>
                <h2 className="pmh-title">Maximum Buying Distance Range</h2>
                <p className="pmh-desc">
                  Select the maximum radial distance (<strong>0 km to 100 km</strong>) from your trading hub you are willing to travel and collect crops.
                </p>
              </div>
            </div>
            <div className="current-dist-badge">
              <span>Selected Distance:</span>
              <strong>{distanceKm} km</strong>
            </div>
          </div>

          <div className="distance-slider-wrap">
            <div className="slider-header-row">
              <span className="range-min">0 km (Local Mandi)</span>
              <span className="range-current">Max: {distanceKm} km</span>
              <span className="range-max">100 km (Regional Cap)</span>
            </div>

            <input
              id="slider-buying-distance"
              type="range"
              min="5"
              max="100"
              step="5"
              value={distanceKm}
              className="distance-range-slider"
              onChange={(e) => {
                setDistanceKm(Number(e.target.value));
                if (errors.distance) setErrors((prev) => ({ ...prev, distance: '' }));
              }}
            />

            {/* Quick preset buttons */}
            <div className="dist-preset-pills">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Presets:</span>
              {[15, 25, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-btn ${distanceKm === preset ? 'active' : ''}`}
                  onClick={() => {
                    setDistanceKm(preset);
                    if (errors.distance) setErrors((prev) => ({ ...prev, distance: '' }));
                  }}
                >
                  {preset} km
                </button>
              ))}
            </div>

            {errors.distance && <span className="error-message" style={{ marginTop: '0.5rem', display: 'block' }}>{errors.distance}</span>}
          </div>
        </div>

        {/* ========================================================
            MODULE 2: CROP TYPE PREFERENCES
            ======================================================== */}
        <div className="pref-module-card">
          <div className="pref-module-header">
            <div className="pmh-left">
              <span className="pref-icon-circle green">🌾</span>
              <div>
                <span className="pmh-tag">MODULE 2</span>
                <h2 className="pmh-title">Crop Type Preferences</h2>
                <p className="pmh-desc">
                  Select one or multiple crops you are interested in buying and bidding for. (At least 1 crop type required).
                </p>
              </div>
            </div>

            <div className="crop-select-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.775rem', padding: '0.3rem 0.65rem' }}
                onClick={handleSelectAllCrops}
              >
                ✓ Select All
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.775rem', padding: '0.3rem 0.65rem' }}
                onClick={handleClearAllCrops}
              >
                ✕ Clear All
              </button>
            </div>
          </div>

          <div className="crops-checkbox-grid">
            {AVAILABLE_CROP_TYPES.map((crop) => {
              const isChecked = selectedCrops.includes(crop.id);
              return (
                <label
                  key={crop.id}
                  className={`crop-check-card ${isChecked ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="crop-check-input"
                    checked={isChecked}
                    onChange={() => handleCropToggle(crop.id)}
                  />
                  <span className="crop-check-icon">{crop.icon}</span>
                  <div className="crop-check-text">
                    <span className="crop-check-name">{crop.name}</span>
                  </div>
                  <span className="crop-check-tick">{isChecked ? '✓' : '+'}</span>
                </label>
              );
            })}
          </div>

          {errors.crops && <span className="error-message" style={{ marginTop: '0.75rem', display: 'block' }}>{errors.crops}</span>}
        </div>

        {/* ========================================================
            MODULE 3: QUANTITY RANGE (MIN & MAX)
            ======================================================== */}
        <div className="pref-module-card">
          <div className="pref-module-header">
            <div className="pmh-left">
              <span className="pref-icon-circle amber">⚖️</span>
              <div>
                <span className="pmh-tag">MODULE 3</span>
                <h2 className="pmh-title">Lot Quantity Range Capacity</h2>
                <p className="pmh-desc">
                  Set the minimum and maximum lot quantity (in kg / Quintals) you are willing to purchase per lot.
                </p>
              </div>
            </div>
          </div>

          <div className="qty-range-grid">
            <div className="form-group">
              <label htmlFor="input-min-quantity" className="form-label">
                Minimum Quantity (kg) <span className="required-star">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="input-min-quantity"
                  type="number"
                  min="1"
                  step="10"
                  required
                  placeholder="e.g. 100"
                  className={`form-input ${errors.minQuantity ? 'input-error' : ''}`}
                  value={minQuantityKg}
                  onChange={(e) => {
                    setMinQuantityKg(e.target.value);
                    if (errors.minQuantity) setErrors((prev) => ({ ...prev, minQuantity: '' }));
                  }}
                />
                <span className="input-unit-tag">kg</span>
              </div>
              <span className="field-hint">
                ≈ {minQuantityKg ? (Number(minQuantityKg) / 100).toFixed(1) : 0} Quintals
              </span>
              {errors.minQuantity && <span className="error-message">{errors.minQuantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="input-max-quantity" className="form-label">
                Maximum Quantity (kg) <span className="required-star">*</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="input-max-quantity"
                  type="number"
                  min="10"
                  step="50"
                  required
                  placeholder="e.g. 5000"
                  className={`form-input ${errors.maxQuantity ? 'input-error' : ''}`}
                  value={maxQuantityKg}
                  onChange={(e) => {
                    setMaxQuantityKg(e.target.value);
                    if (errors.maxQuantity) setErrors((prev) => ({ ...prev, maxQuantity: '' }));
                  }}
                />
                <span className="input-unit-tag">kg</span>
              </div>
              <span className="field-hint">
                ≈ {maxQuantityKg ? (Number(maxQuantityKg) / 100).toFixed(1) : 0} Quintals
              </span>
              {errors.maxQuantity && <span className="error-message">{errors.maxQuantity}</span>}
            </div>
          </div>

          <div className="qty-summary-box">
            <span className="qsb-icon">ℹ️</span>
            <span>
              Configured Lot Capacity Range: <strong>{minQuantityKg || 0} kg</strong> to <strong>{maxQuantityKg || 0} kg</strong> ({minQuantityKg ? (Number(minQuantityKg)/100).toFixed(1) : 0} Qtl - {maxQuantityKg ? (Number(maxQuantityKg)/100).toFixed(1) : 0} Qtl).
            </span>
          </div>
        </div>

        {/* ========================================================
            SAVE & CONTINUE ACTION BAR
            ======================================================== */}
        <div className="preferences-submit-bar">
          <div className="psb-info">
            <strong>Ready to explore live crop lots?</strong>
            <span>Saving your preferences will immediately display all matching farmer lots in Section 3: Bidding.</span>
          </div>

          <button
            id="btn-save-preferences-continue"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ minWidth: '260px' }}
          >
            Save & Continue to Bidding →
          </button>
        </div>
      </form>
    </div>
  );
}
