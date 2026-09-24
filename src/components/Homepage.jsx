import React from 'react';

/**
 * AgriTradeX Modern Agricultural Marketplace Homepage
 * 
 * Features:
 * - Custom SVG Logo symbolizing Farmer ↔ Vendor Crop Exchange
 * - Subtle, elegant "YADAV" watermark branding element
 * - Agricultural background with soft green/golden gradients and organic shapes
 * - Central Hero Section: "Connect. Trade. Grow."
 * - 3 Colorful Interactive Cards: Home, Registration, Login with smooth hover animations
 */
export default function Homepage({ onOpenRegister, onOpenLogin }) {
  return (
    <main className="homepage-hero-wrapper">
      {/* Decorative Organic Agricultural Background Blobs */}
      <div className="bg-decor-circle decor-top-left" aria-hidden="true" />
      <div className="bg-decor-circle decor-bottom-right" aria-hidden="true" />
      <div className="bg-decor-circle decor-center-gold" aria-hidden="true" />
      <div className="bg-decor-leaf leaf-1" aria-hidden="true">🌱</div>
      <div className="bg-decor-leaf leaf-2" aria-hidden="true">🌾</div>
      <div className="bg-decor-leaf leaf-3" aria-hidden="true">🍃</div>

      <div className="homepage-inner-content">
        {/* ========================================================
            BRAND & LOGO SECTION WITH SUBTLE YADAV WATERMARK
            ======================================================== */}
        <div className="home-logo-container">
          {/* Subtle, elegant, low-contrast background watermark */}
          <div className="yadav-watermark" aria-hidden="true">
            YADAV
          </div>

          {/* Custom SVG Logo: Farmer ↔ Crop ↔ Vendor Exchange */}
          <div className="agritradex-logo-box">
            <svg
              className="agritradex-svg-logo"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="AgriTradeX Farmer to Vendor Exchange Logo"
            >
              {/* Outer Decorative Gradient Ring */}
              <circle cx="60" cy="60" r="56" stroke="url(#outerRingGrad)" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.85" />
              
              {/* Main Badge Base */}
              <rect x="12" y="12" width="96" height="96" rx="28" fill="url(#badgeBgGrad)" />
              <rect x="14" y="14" width="92" height="92" rx="26" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.2" />

              {/* Left Side: Farmer & Agriculture (Green Growth & Leaf) */}
              <g className="logo-farmer-group">
                {/* Farmer / Sun Arc */}
                <path d="M28 42C28 35 34 30 42 30" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
                {/* Green Leaf */}
                <path
                  d="M32 64C32 46 48 36 58 34C55 48 44 64 32 64Z"
                  fill="url(#farmerLeafGrad)"
                />
                <path
                  d="M32 64C41 55 50 45 58 34"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.9"
                />
                {/* Small Farmer Symbol / Sprout */}
                <circle cx="36" cy="38" r="3.5" fill="#34d399" />
              </g>

              {/* Right Side: Vendor & Marketplace (Golden Wheat & Trading Pillars) */}
              <g className="logo-vendor-group">
                {/* Golden Wheat / Grain Cluster */}
                <path
                  d="M88 64C88 46 72 36 62 34C65 48 76 64 88 64Z"
                  fill="url(#vendorGoldGrad)"
                />
                <path
                  d="M88 64C79 55 70 45 62 34"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.9"
                />
                {/* Small Vendor Trade Symbol */}
                <circle cx="84" cy="38" r="3.5" fill="#fbbf24" />
              </g>

              {/* Exchange Dynamic Arrows (Farmer ↔ Vendor Exchange) */}
              {/* Top Curved Arrow: Farmer Selling Crops to Vendor (Left to Right) */}
              <path
                d="M40 76C48 84 72 84 80 76"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon points="84,74 81,83 74,78" fill="#ffffff" />

              {/* Bottom Curved Arrow: Vendor Settlement to Farmer (Right to Left) */}
              <path
                d="M80 69C72 61 48 61 40 69"
                stroke="#6ee7b7"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon points="36,71 39,62 46,67" fill="#6ee7b7" />

              {/* Center Connection Node (The "X" / Core Marketplace Nexus) */}
              <circle cx="60" cy="56" r="10" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))" />
              <circle cx="60" cy="56" r="6" fill="url(#coreGrad)" />
              <path d="M57 53L63 59M63 53L57 59" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

              {/* Gradients */}
              <defs>
                <linearGradient id="badgeBgGrad" x1="12" y1="12" x2="108" y2="108" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#064e3b" />
                  <stop offset="0.5" stopColor="#065f46" />
                  <stop offset="1" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="farmerLeafGrad" x1="32" y1="34" x2="58" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6ee7b7" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="vendorGoldGrad" x1="62" y1="34" x2="88" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fde047" />
                  <stop offset="1" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="coreGrad" x1="54" y1="50" x2="66" y2="62" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#059669" />
                  <stop offset="1" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="outerRingGrad" x1="4" y1="4" x2="116" y2="116" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#10b981" />
                  <stop offset="0.5" stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Concept Tag */}
            <span className="logo-concept-tag">Farmers Sell Crops ↔ Vendors Buy Crops</span>
          </div>

          <div className="brand-text-block">
            <h1 className="main-brand-title">AgriTradeX</h1>
            <p className="brand-tagline">Connect. Trade. Grow.</p>
          </div>
        </div>

        {/* ========================================================
            HERO NARRATIVE
            ======================================================== */}
        <div className="hero-narrative-box">
          <p className="hero-description">
            A digital marketplace connecting farmers and vendors for smarter crop trading.
          </p>

          <div className="hero-feature-pills">
            <span className="hero-pill green-pill">
              🌾 Direct Crop Selling
            </span>
            <span className="hero-pill amber-pill">
              ⚡ 24h Real-Time Bidding
            </span>
            <span className="hero-pill blue-pill">
              🏢 Verified Vendors
            </span>
            <span className="hero-pill emerald-pill">
              🤝 Crop Finance Hub
            </span>
          </div>
        </div>

        {/* ========================================================
            3 COLORFUL INTERACTIVE CARDS (HOME, REGISTER, LOGIN)
            ======================================================== */}
        <div className="home-cards-grid">
          {/* CARD 1: HOME */}
          <div className="home-action-card card-home" tabIndex={0}>
            <div className="hac-icon-wrap hac-home-icon">
              <span className="hac-emoji">🏡</span>
            </div>
            <div className="hac-content">
              <span className="hac-badge badge-home">Active Hub</span>
              <h3 className="hac-title">Home Portal</h3>
              <p className="hac-desc">
                Welcome to AgriTradeX digital agricultural trading ecosystem and live marketplace.
              </p>
            </div>
            <div className="hac-footer">
              <span className="hac-action-link active-link">
                ✦ Platform Active
              </span>
            </div>
          </div>

          {/* CARD 2: REGISTRATION */}
          <div
            className="home-action-card card-register"
            onClick={onOpenRegister}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenRegister();
              }
            }}
          >
            <div className="hac-icon-wrap hac-register-icon">
              <span className="hac-emoji">📝</span>
            </div>
            <div className="hac-content">
              <span className="hac-badge badge-register">New Account</span>
              <h3 className="hac-title">Registration</h3>
              <p className="hac-desc">
                Join as a Farmer to sell harvest or Vendor to buy quality crops with live auction bidding.
              </p>
            </div>
            <div className="hac-footer">
              <button
                id="btn-register-home"
                type="button"
                className="btn btn-primary hac-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRegister();
                }}
              >
                Register Now →
              </button>
            </div>
          </div>

          {/* CARD 3: LOGIN */}
          <div
            className="home-action-card card-login"
            onClick={onOpenLogin}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenLogin();
              }
            }}
          >
            <div className="hac-icon-wrap hac-login-icon">
              <span className="hac-emoji">🔐</span>
            </div>
            <div className="hac-content">
              <span className="hac-badge badge-login">Secure Access</span>
              <h3 className="hac-title">Account Login</h3>
              <p className="hac-desc">
                Log in to your personalized Farmer or Vendor dashboard using registered mobile & OTP.
              </p>
            </div>
            <div className="hac-footer">
              <button
                id="btn-login-home"
                type="button"
                className="btn btn-outline hac-btn hac-btn-login"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLogin();
                }}
              >
                Login to Portal →
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Trust Footer Bar */}
        <div className="home-trust-footer">
          <span>🔒 Safe & Transparent Agricultural Marketplace</span>
          <span className="dot-divider">•</span>
          <span>⚡ 100% Verified Farmer & Vendor Network</span>
          <span className="dot-divider">•</span>
          <span>🌱 Empowering Smart Farming</span>
        </div>
      </div>
    </main>
  );
}
