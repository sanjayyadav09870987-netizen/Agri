import React, { useState } from 'react';
import {
  isValidIndianMobile,
  isValidAadhaar,
  isValidPAN,
  isValidPincode,
  isValidPositiveNumber,
  isNonEmpty
} from '../utils/validators';
import { registerUser } from '../services/storage';

export default function RegisterView({ onBackToHome, onGoToLogin }) {
  const [userType, setUserType] = useState('farmer'); // 'farmer' | 'vendor'
  
  // Form State
  const [formData, setFormData] = useState({
    // Common fields
    fullName: '',
    mobileNumber: '',
    aadhaarNumber: '',
    panNumber: '',
    // Farmer fields
    landAcres: '',
    landSurveyNumber: '',
    // Vendor fields
    companyName: '',
    companyId: '',
    // Common location fields
    village: '',
    mandal: '',
    district: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const errs = {};

    // 1. Common Fields
    if (!isNonEmpty(formData.fullName)) {
      errs.fullName = 'Full Name is required.';
    }

    if (!isNonEmpty(formData.mobileNumber)) {
      errs.mobileNumber = 'Mobile Number is required.';
    } else if (!isValidIndianMobile(formData.mobileNumber)) {
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, 9).';
    }

    if (!isNonEmpty(formData.aadhaarNumber)) {
      errs.aadhaarNumber = 'Aadhaar Number is required.';
    } else if (!isValidAadhaar(formData.aadhaarNumber)) {
      errs.aadhaarNumber = 'Aadhaar Number must be exactly 12 digits.';
    }

    if (!isNonEmpty(formData.panNumber)) {
      errs.panNumber = 'PAN Card Number is required.';
    } else if (!isValidPAN(formData.panNumber)) {
      errs.panNumber = 'Enter valid PAN (e.g. ABCDE1234F - 5 letters, 4 digits, 1 letter).';
    }

    // 2. Role Specific Fields
    if (userType === 'farmer') {
      if (!isNonEmpty(formData.landAcres)) {
        errs.landAcres = 'Land Acres is required.';
      } else if (!isValidPositiveNumber(formData.landAcres)) {
        errs.landAcres = 'Land Acres must be a valid positive number.';
      }

      if (!isNonEmpty(formData.landSurveyNumber)) {
        errs.landSurveyNumber = 'Land Survey Number is required.';
      }
    } else if (userType === 'vendor') {
      if (!isNonEmpty(formData.companyName)) {
        errs.companyName = 'Company Name is required.';
      }

      if (!isNonEmpty(formData.companyId)) {
        errs.companyId = 'Company ID is required.';
      }
    }

    // 3. Location Fields (Common to both)
    if (!isNonEmpty(formData.village)) {
      errs.village = 'Village is required.';
    }

    if (!isNonEmpty(formData.mandal)) {
      errs.mandal = 'Mandal is required.';
    }

    if (!isNonEmpty(formData.district)) {
      errs.district = 'District is required.';
    }

    if (!isNonEmpty(formData.pincode)) {
      errs.pincode = 'Pincode is required.';
    } else if (!isValidPincode(formData.pincode)) {
      errs.pincode = 'Pincode must be exactly 6 digits (e.g. 500001).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const payload = {
      userType,
      fullName: formData.fullName.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      aadhaarNumber: formData.aadhaarNumber.replace(/\s+/g, '').trim(),
      panNumber: formData.panNumber.trim().toUpperCase(),
      village: formData.village.trim(),
      mandal: formData.mandal.trim(),
      district: formData.district.trim(),
      pincode: formData.pincode.trim(),
      ...(userType === 'farmer'
        ? {
            landAcres: formData.landAcres.trim(),
            landSurveyNumber: formData.landSurveyNumber.trim()
          }
        : {
            companyName: formData.companyName.trim(),
            companyId: formData.companyId.trim()
          })
    };

    const res = registerUser(payload);
    if (res.success) {
      setRegisteredUser(res.user);
      setIsSuccess(true);
    } else {
      setServerError(res.message);
    }
  };

  if (isSuccess) {
    return (
      <div className="flow-container">
        <div className="flow-card success-card">
          <div className="success-icon-wrap">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2 className="flow-title" style={{ color: 'var(--primary-hover)', marginBottom: '0.5rem' }}>
            Registration Successful!
          </h2>
          <p className="flow-subtitle" style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            Welcome to <strong>AgriTradeX</strong>, {registeredUser?.fullName}.
            Your account has been registered as a <strong>{registeredUser?.userType === 'farmer' ? 'Farmer' : 'Vendor'}</strong>.
          </p>

          <div className="user-info-box">
            <div className="info-row">
              <span className="info-label">Account Type:</span>
              <span className="info-val">{registeredUser?.userType?.toUpperCase()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Registered Mobile:</span>
              <span className="info-val">{registeredUser?.mobileNumber}</span>
            </div>
            {registeredUser?.userType === 'farmer' ? (
              <div className="info-row">
                <span className="info-label">Land Survey No:</span>
                <span className="info-val">{registeredUser?.landSurveyNumber}</span>
              </div>
            ) : (
              <div className="info-row">
                <span className="info-label">Company Name:</span>
                <span className="info-val">{registeredUser?.companyName}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              id="btn-goto-login-from-success"
              type="button"
              className="btn btn-primary"
              onClick={() => onGoToLogin(registeredUser?.mobileNumber)}
            >
              Proceed to Login
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBackToHome}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flow-container">
      <div className="flow-card">
        <header className="flow-header">
          <button
            type="button"
            className="back-btn"
            onClick={onBackToHome}
            aria-label="Back to home"
          >
            ← Back
          </button>
          <h2 className="flow-title">Create an Account</h2>
          <p className="flow-subtitle">Join AgriTradeX to start agricultural trading</p>
        </header>

        {serverError && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* COMMON REGISTRATION FIELDS */}
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="reg-fullName" className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="reg-fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label htmlFor="reg-mobile" className="form-label">
                Mobile Number <span className="required-star">*</span>
              </label>
              <input
                id="reg-mobile"
                type="tel"
                maxLength={10}
                className={`form-input ${errors.mobileNumber ? 'input-error' : ''}`}
                placeholder="10-digit Indian Mobile Number"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
              />
              {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
            </div>

            {/* Aadhaar Number & PAN Card Number in 2 columns */}
            <div className="form-grid-2col">
              <div className="form-group">
                <label htmlFor="reg-aadhaar" className="form-label">
                  Aadhaar Number <span className="required-star">*</span>
                </label>
                <input
                  id="reg-aadhaar"
                  type="text"
                  maxLength={12}
                  className={`form-input ${errors.aadhaarNumber ? 'input-error' : ''}`}
                  placeholder="12-digit Aadhaar Number"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                />
                {errors.aadhaarNumber && <span className="error-message">{errors.aadhaarNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-pan" className="form-label">
                  PAN Card Number <span className="required-star">*</span>
                </label>
                <input
                  id="reg-pan"
                  type="text"
                  maxLength={10}
                  className={`form-input ${errors.panNumber ? 'input-error' : ''}`}
                  placeholder="e.g. ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                />
                {errors.panNumber && <span className="error-message">{errors.panNumber}</span>}
              </div>
            </div>
          </div>

          {/* USER TYPE SELECTION */}
          <section className="user-type-section">
            <h3 className="user-type-header">Select User Type <span className="required-star">*</span></h3>
            <div className="user-type-options">
              <label className={`type-radio-card ${userType === 'farmer' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="farmer"
                  checked={userType === 'farmer'}
                  onChange={() => {
                    setUserType('farmer');
                    setErrors({});
                  }}
                />
                <div>
                  <div className="type-title">Farmer</div>
                  <div className="type-desc">Agricultural Producer</div>
                </div>
              </label>

              <label className={`type-radio-card ${userType === 'vendor' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="vendor"
                  checked={userType === 'vendor'}
                  onChange={() => {
                    setUserType('vendor');
                    setErrors({});
                  }}
                />
                <div>
                  <div className="type-title">Vendor</div>
                  <div className="type-desc">Buyer / Trade Company</div>
                </div>
              </label>
            </div>
          </section>

          {/* ROLE SPECIFIC FIELDS */}
          {userType === 'farmer' ? (
            <div className="role-section">
              <h4 className="role-section-title">🌾 Farmer Information</h4>
              <div className="form-grid-2col" style={{ marginBottom: '1.15rem' }}>
                <div className="form-group">
                  <label htmlFor="reg-landAcres" className="form-label">
                    Land Acres <span className="required-star">*</span>
                  </label>
                  <input
                    id="reg-landAcres"
                    type="number"
                    step="0.1"
                    min="0.1"
                    className={`form-input ${errors.landAcres ? 'input-error' : ''}`}
                    placeholder="e.g. 5.5"
                    value={formData.landAcres}
                    onChange={(e) => handleInputChange('landAcres', e.target.value)}
                  />
                  {errors.landAcres && <span className="error-message">{errors.landAcres}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="reg-landSurvey" className="form-label">
                    Land Survey Number <span className="required-star">*</span>
                  </label>
                  <input
                    id="reg-landSurvey"
                    type="text"
                    className={`form-input ${errors.landSurveyNumber ? 'input-error' : ''}`}
                    placeholder="e.g. SY-102/4B"
                    value={formData.landSurveyNumber}
                    onChange={(e) => handleInputChange('landSurveyNumber', e.target.value)}
                  />
                  {errors.landSurveyNumber && <span className="error-message">{errors.landSurveyNumber}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="role-section">
              <h4 className="role-section-title">🏢 Vendor Information</h4>
              <div className="form-grid-2col" style={{ marginBottom: '1.15rem' }}>
                <div className="form-group">
                  <label htmlFor="reg-companyName" className="form-label">
                    Company Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="reg-companyName"
                    type="text"
                    className={`form-input ${errors.companyName ? 'input-error' : ''}`}
                    placeholder="e.g. Kisan Agro Traders Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                  />
                  {errors.companyName && <span className="error-message">{errors.companyName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="reg-companyId" className="form-label">
                    Company ID <span className="required-star">*</span>
                  </label>
                  <input
                    id="reg-companyId"
                    type="text"
                    className={`form-input ${errors.companyId ? 'input-error' : ''}`}
                    placeholder="e.g. CIN/GSTIN/REG-9812"
                    value={formData.companyId}
                    onChange={(e) => handleInputChange('companyId', e.target.value)}
                  />
                  {errors.companyId && <span className="error-message">{errors.companyId}</span>}
                </div>
              </div>
            </div>
          )}

          {/* COMMON LOCATION FIELDS */}
          <div className="form-grid-2col" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="reg-village" className="form-label">
                Village <span className="required-star">*</span>
              </label>
              <input
                id="reg-village"
                type="text"
                className={`form-input ${errors.village ? 'input-error' : ''}`}
                placeholder="Village / Town"
                value={formData.village}
                onChange={(e) => handleInputChange('village', e.target.value)}
              />
              {errors.village && <span className="error-message">{errors.village}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-mandal" className="form-label">
                Mandal <span className="required-star">*</span>
              </label>
              <input
                id="reg-mandal"
                type="text"
                className={`form-input ${errors.mandal ? 'input-error' : ''}`}
                placeholder="Mandal / Tehsil"
                value={formData.mandal}
                onChange={(e) => handleInputChange('mandal', e.target.value)}
              />
              {errors.mandal && <span className="error-message">{errors.mandal}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-district" className="form-label">
                District <span className="required-star">*</span>
              </label>
              <input
                id="reg-district"
                type="text"
                className={`form-input ${errors.district ? 'input-error' : ''}`}
                placeholder="District"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
              {errors.district && <span className="error-message">{errors.district}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-pincode" className="form-label">
                Pincode <span className="required-star">*</span>
              </label>
              <input
                id="reg-pincode"
                type="text"
                maxLength={6}
                className={`form-input ${errors.pincode ? 'input-error' : ''}`}
                placeholder="6-digit Pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
              />
              {errors.pincode && <span className="error-message">{errors.pincode}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              id="btn-submit-registration"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Submit Registration
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => onGoToLogin()}
              >
                Log In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
