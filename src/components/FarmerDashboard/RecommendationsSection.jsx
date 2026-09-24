import React, { useState } from 'react';
import { getCropRecommendations } from '../../services/recommendationsStore';

export default function RecommendationsSection() {
  const recommendations = getCropRecommendations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState(null);

  const categories = ['All', 'Cereals & Grains', 'Cash Crops / Fiber', 'Coarse Grains / Feed', 'Spices & Commercial', 'Oilseeds', 'Horticulture / Vegetables'];

  const filtered = recommendations.filter((item) => {
    const matchesSearch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) || item.variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="sell-crop-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">💡 Crop Price Recommendations & Future Predictions</h2>
          <p className="module-desc">
            Compare real-time Mandi benchmark prices against AI-modeled price forecasts to optimize your harvesting and selling decisions.
          </p>
        </div>
        <div className="privacy-guarantee-pill" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#92400e' }}>
          🤖 AI Market Forecasting (Demo / Example Data)
        </div>
      </div>

      {/* AI Model Notice Banner */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem 1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
        <div style={{ fontSize: '0.825rem', color: '#475569' }}>
          <strong>Notice for Farmers:</strong> The predicted prices shown below are algorithmic estimates based on seasonal arrival trends, rainfall patterns, and national APMC trading velocity. They are designed as decision guidance, not guaranteed future prices.
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search crops (e.g. Rice, Cotton, Turmeric)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`crop-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 1. CROP PRICE COMPARISON TABLE (AS SPECIFIED IN PROMPT) */}
      <div className="chart-card" style={{ marginBottom: '2rem', padding: '1.25rem', overflowX: 'auto' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
          📊 Crop Price Forecast & Trend Table
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>CROP NAME</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>CURRENT PRICE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>PREDICTED FUTURE PRICE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>EXPECTED CHANGE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>PRICE TREND</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>LAST UPDATED</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isInc = item.trend === 'Increasing';
              const isDec = item.trend === 'Decreasing';

              return (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease', cursor: 'pointer' }}
                  onClick={() => setSelectedCrop(item)}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.cropName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.variety}</div>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                    ₹{item.currentPrice.toLocaleString('en-IN')}<small style={{ color: 'var(--text-muted)' }}>/quintal</small>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: isInc ? '#059669' : isDec ? '#dc2626' : '#2563eb' }}>
                    ₹{item.predictedPrice.toLocaleString('en-IN')}<small style={{ color: 'var(--text-muted)' }}>/quintal</small>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                    <span style={{ color: isInc ? '#059669' : isDec ? '#dc2626' : '#64748b' }}>
                      {item.expectedChange > 0 ? `+₹${item.expectedChange}` : item.expectedChange < 0 ? `-₹${Math.abs(item.expectedChange)}` : '₹0'}
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: isInc ? '#ecfdf5' : isDec ? '#fef2f2' : '#f1f5f9',
                        color: isInc ? '#047857' : isDec ? '#b91c1c' : '#334155'
                      }}
                    >
                      {isInc && '🟢 ▲ Increasing'}
                      {isDec && '🔴 ▼ Decreasing'}
                      {!isInc && !isDec && '🔵 ▬ Stable'}
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {item.lastUpdated}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. CROP-WISE INDIVIDUAL CARDS & COMPARISON VIEW */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
          🌾 Individual Crop Decision Cards
        </h3>

        <div className="sell-crops-grid">
          {filtered.map((item) => {
            const isInc = item.trend === 'Increasing';
            const isDec = item.trend === 'Decreasing';

            return (
              <div key={item.id} className="sell-crop-card" style={{ borderTop: `4px solid ${isInc ? '#10b981' : isDec ? '#ef4444' : '#3b82f6'}` }}>
                <div className="sell-crop-content">
                  <div className="sell-crop-header">
                    <div>
                      <h4 className="sell-crop-name" style={{ fontSize: '1.2rem' }}>{item.cropName}</h4>
                      <span className="sell-crop-qty">{item.category}</span>
                    </div>

                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: isInc ? '#ecfdf5' : isDec ? '#fef2f2' : '#f1f5f9',
                        color: isInc ? '#047857' : isDec ? '#b91c1c' : '#334155'
                      }}
                    >
                      {isInc ? '▲ Increasing' : isDec ? '▼ Decreasing' : '▬ Stable'}
                    </span>
                  </div>

                  {/* Price Comparison Block */}
                  <div className="sell-price-grid" style={{ margin: '0.75rem 0' }}>
                    <div className="sp-box">
                      <span className="sp-lbl">Current Price</span>
                      <span className="sp-val">₹{item.currentPrice.toLocaleString('en-IN')} / Qtl</span>
                    </div>

                    <div className="sp-box highlight">
                      <span className="sp-lbl">Predicted Future Price</span>
                      <span className="sp-val highlight" style={{ color: isInc ? '#047857' : isDec ? '#dc2626' : '#2563eb' }}>
                        ₹{item.predictedPrice.toLocaleString('en-IN')} / Qtl
                      </span>
                    </div>

                    <div className="sp-box">
                      <span className="sp-lbl">Expected Change</span>
                      <span className="sp-val" style={{ color: isInc ? '#047857' : isDec ? '#dc2626' : '#64748b' }}>
                        {item.expectedChange > 0 ? `+₹${item.expectedChange}` : item.expectedChange < 0 ? `-₹${Math.abs(item.expectedChange)}` : '₹0'}
                      </span>
                    </div>
                  </div>

                  {/* Market AI Insight & Action Tip */}
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    <strong>Market Analysis:</strong> {item.marketInsight}
                  </div>

                  <div style={{ background: '#ecfdf5', padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem', color: '#065f46', lineHeight: '1.4' }}>
                    💡 <strong>Farmer Action Tip:</strong> {item.actionTip}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'right' }}>
                    Confidence: {item.confidenceScore} • {item.forecastPeriod}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
