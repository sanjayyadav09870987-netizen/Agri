import React, { useState } from 'react';
import { isValidIndianMobile, isNonEmpty } from '../utils/validators';
import { findUserByMobile, generateOtp, verifyOtp, setCurrentUser } from '../services/storage';

export default function LoginView({ initialMobile = '', onBackToHome, onLoginSuccess, onGoToRegister }) {
  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState('');
  
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleSendOtp = () => {
    setMobileError('');
    setGeneralError('');

    if (!isNonEmpty(mobileNumber)) {
      setMobileError('Please enter your registered mobile number.');
      return;
    }

    if (!isValidIndianMobile(mobileNumber)) {
      setMobileError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Check if user is registered
    const user = findUserByMobile(mobileNumber);
    if (!user) {
      setMobileError('Mobile number is not registered. Please register first.');
      return;
    }

    // Generate test/dev OTP
    const generated = generateOtp(mobileNumber);
    setDevOtpCode(generated);
    setOtpSent(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setMobileError('');
    setOtpError('');
    setGeneralError('');

    if (!isNonEmpty(mobileNumber)) {
      setMobileError('Mobile number is required.');
      return;
    }

    if (!isValidIndianMobile(mobileNumber)) {
      setMobileError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const user = findUserByMobile(mobileNumber);
    if (!user) {
      setMobileError('Mobile number not found. Please register first.');
      return;
    }

    if (!isNonEmpty(otp)) {
      setOtpError('Please enter the OTP.');
      return;
    }

    // Verify OTP
    const otpRes = verifyOtp(mobileNumber, otp);
    if (!otpRes.success) {
      setOtpError(otpRes.message);
      return;
    }

    // Successfully verified -> establish session
    setCurrentUser(user);
    onLoginSuccess(user);
  };

  return (
    <div className="flow-container">
      <div className="flow-card card-narrow">
        <header className="flow-header">
          <button
            type="button"
            className="back-btn"
            onClick={onBackToHome}
            aria-label="Back to home"
          >
            ← Back
          </button>
          <h2 className="flow-title">Login</h2>
          <p className="flow-subtitle">Access your AgriTradeX account via Mobile OTP</p>
        </header>

        {generalError && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span>
            <span>{generalError}</span>
          </div>
        )}

        {/* Development Mode OTP Display Note */}
        {otpSent && devOtpCode && (
          <div className="dev-otp-badge">
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>🧪 Development Mode OTP:</div>
            <div>
              Use OTP: <strong>{devOtpCode}</strong> (or test fallback <strong>123456</strong>)
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.85 }}>
              (Simulated OTP for local testing. No real SMS service is connected yet.)
            </div>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} noValidate>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            {/* Registered Mobile Number */}
            <div className="form-group">
              <label htmlFor="login-mobile" className="form-label">
                Registered Mobile Number <span className="required-star">*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="login-mobile"
                  type="tel"
                  maxLength={10}
                  className={`form-input ${mobileError ? 'input-error' : ''}`}
                  placeholder="Enter 10-digit mobile"
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value.replace(/\D/g, ''));
                    if (mobileError) setMobileError('');
                  }}
                />
                <button
                  id="btn-send-otp"
                  type="button"
                  className="btn btn-outline"
                  style={{ minWidth: '105px', padding: '0.75rem 0.9rem', fontSize: '0.875rem' }}
                  onClick={handleSendOtp}
                >
                  {otpSent ? 'Resend' : 'Get OTP'}
                </button>
              </div>
              {mobileError && <span className="error-message">{mobileError}</span>}
            </div>

            {/* OTP Input */}
            <div className="form-group">
              <label htmlFor="login-otp" className="form-label">
                OTP (One-Time Password) <span className="required-star">*</span>
              </label>
              <input
                id="login-otp"
                type="text"
                maxLength={6}
                className={`form-input ${otpError ? 'input-error' : ''}`}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  if (otpError) setOtpError('');
                }}
              />
              {otpError && <span className="error-message">{otpError}</span>}
              {!otpSent && (
                <span className="field-hint">
                  Click 'Get OTP' above to generate your verification code.
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              id="btn-submit-login"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Submit / Login
            </button>

            {/* Quick Demo Helper Box */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginTop: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                ⚡ One-Click Dummy Test Logins:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #10b981',
                    color: '#047857',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setMobileNumber('9876543210');
                    setOtp('123456');
                    setMobileError('');
                    setOtpError('');
                  }}
                >
                  🌾 Farmer: 9876543210
                </button>
                <button
                  type="button"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #0d9488',
                    color: '#0f766e',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setMobileNumber('9123456780');
                    setOtp('123456');
                    setMobileError('');
                    setOtpError('');
                  }}
                >
                  🏢 Vendor: 9123456780
                </button>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
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
                onClick={onGoToRegister}
              >
                Register
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
