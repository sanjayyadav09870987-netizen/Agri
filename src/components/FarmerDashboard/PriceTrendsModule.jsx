import React, { useState, useMemo } from 'react';
import { generate30DayPriceHistory } from '../../services/farmerData';

export default function PriceTrendsModule({ farmerCrops = [], onNavigateToCrops }) {
  // Extract unique crops presently cultivated by this farmer only
  const cultivatedCropNames = useMemo(() => {
    const names = farmerCrops.map((c) => c.cropName);
    return Array.from(new Set(names));
  }, [farmerCrops]);

  const [selectedCrop, setSelectedCrop] = useState(cultivatedCropNames[0] || '');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Sync selected crop if list changes
  const activeCropName = cultivatedCropNames.includes(selectedCrop)
    ? selectedCrop
    : cultivatedCropNames[0] || '';

  // 30-Day price history
  const priceData = useMemo(() => {
    if (!activeCropName) return null;
    return generate30DayPriceHistory(activeCropName);
  }, [activeCropName]);

  // Chart dimensions & calculations
  const chartWidth = 700;
  const chartHeight = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };

  const chartPoints = useMemo(() => {
    if (!priceData || !priceData.history.length) return [];
    const minP = priceData.minPrice * 0.97;
    const maxP = priceData.maxPrice * 1.03;
    const priceRange = maxP - minP || 1;

    const usableWidth = chartWidth - padding.left - padding.right;
    const usableHeight = chartHeight - padding.top - padding.bottom;

    return priceData.history.map((pt, i) => {
      const x = padding.left + (i / (priceData.history.length - 1)) * usableWidth;
      const y = padding.top + usableHeight - ((pt.price - minP) / priceRange) * usableHeight;
      return { ...pt, x, y, index: i };
    });
  }, [priceData]);

  // Generate SVG path string
  const svgPathString = useMemo(() => {
    if (!chartPoints.length) return '';
    return chartPoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }, [chartPoints]);

  // Area under line for gradient fill
  const svgAreaString = useMemo(() => {
    if (!chartPoints.length) return '';
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    const bottomY = chartHeight - padding.bottom;
    return `${svgPathString} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;
  }, [svgPathString, chartPoints]);

  if (cultivatedCropNames.length === 0) {
    return (
      <div className="module-container">
        <div className="module-header-row">
          <div>
            <h2 className="module-title">📈 30-Day Cultivated Crop Price Trends</h2>
            <p className="module-desc">
              Market Mandi price fluctuations over the past 1 month for your active cultivated crops.
            </p>
          </div>
        </div>

        <div className="empty-module-card">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
          <h3>No Active Cultivated Crops Found</h3>
          <p>
            Price graphs are exclusively generated for crops you currently cultivate. Add a crop in the <strong>Cultivated Crops</strong> tab to view its 30-day historical trend.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={onNavigateToCrops}
          >
            Add Cultivated Crop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">📈 30-Day Cultivated Crop Price Trends</h2>
          <p className="module-desc">
            Showing past 1 month daily Mandi price trends exclusively for your cultivated crops.
          </p>
        </div>
      </div>

      {/* CULTIVATED CROP SELECTOR TABS */}
      <div className="crop-filter-tabs">
        <span className="tabs-label">Your Active Crops:</span>
        <div className="tabs-buttons-group">
          {cultivatedCropNames.map((name) => (
            <button
              key={name}
              type="button"
              className={`crop-tab-btn ${activeCropName === name ? 'active' : ''}`}
              onClick={() => {
                setSelectedCrop(name);
                setHoveredPoint(null);
              }}
            >
              🌿 {name}
            </button>
          ))}
        </div>
      </div>

      {priceData && (
        <div className="chart-card">
          {/* Summary Metric Stats for Selected Cultivated Crop */}
          <div className="chart-metrics-row">
            <div className="chart-metric-item">
              <span className="cm-lbl">Today's Market Rate</span>
              <span className="cm-val">₹{priceData.currentPrice.toLocaleString('en-IN')} <small>/ Qtl</small></span>
            </div>

            <div className="chart-metric-item">
              <span className="cm-lbl">30-Day High</span>
              <span className="cm-val text-success">₹{priceData.maxPrice.toLocaleString('en-IN')}</span>
            </div>

            <div className="chart-metric-item">
              <span className="cm-lbl">30-Day Low</span>
              <span className="cm-val text-muted">₹{priceData.minPrice.toLocaleString('en-IN')}</span>
            </div>

            <div className="chart-metric-item">
              <span className="cm-lbl">1-Month Fluctuation</span>
              <span className={`cm-val ${priceData.percentChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {priceData.percentChange >= 0 ? `▲ +${priceData.percentChange}%` : `▼ ${priceData.percentChange}%`}
              </span>
            </div>
          </div>

          {/* Interactive SVG Line Graph */}
          <div className="chart-svg-wrapper">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="trend-svg"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
                const y = padding.top + (chartHeight - padding.top - padding.bottom) * ratio;
                return (
                  <line
                    key={idx}
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area fill */}
              <path d={svgAreaString} fill="url(#chartGradient)" />

              {/* Main Line */}
              <path
                d={svgPathString}
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points */}
              {chartPoints.map((pt, i) => (
                <g key={i}>
                  {/* Invisible larger hover circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(pt)}
                  />
                  {/* Visible point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.index === i ? 6 : 3}
                    fill={hoveredPoint?.index === i ? '#047857' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              ))}

              {/* X-Axis Date Labels (Every 5th point) */}
              {chartPoints
                .filter((_, idx) => idx % 5 === 0 || idx === chartPoints.length - 1)
                .map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#64748b"
                    fontFamily="sans-serif"
                  >
                    {pt.date}
                  </text>
                ))}

              {/* Hover Tooltip overlay in SVG */}
              {hoveredPoint && (
                <g transform={`translate(${Math.min(chartWidth - 110, Math.max(70, hoveredPoint.x))}, ${Math.max(35, hoveredPoint.y - 25)})`}>
                  <rect
                    x="-60"
                    y="-30"
                    width="120"
                    height="32"
                    rx="6"
                    fill="#0f172a"
                    opacity="0.9"
                  />
                  <text
                    x="0"
                    y="-18"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {hoveredPoint.date}
                  </text>
                  <text
                    x="0"
                    y="-6"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="700"
                  >
                    ₹{hoveredPoint.price.toLocaleString('en-IN')} / Qtl
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="chart-footer-note">
            ℹ️ Mandi rates recorded daily over 30 days. Showing prices exclusively for farmer cultivated crop: <strong>{activeCropName}</strong>.
          </div>
        </div>
      )}
    </div>
  );
}
