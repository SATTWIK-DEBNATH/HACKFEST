import React from 'react';

/**
 * Reusable Metric Component
 * High-density optical glass tile for operational numbers, trends, and deltas.
 */
export function Metric({
  label,
  value,
  trend = null,
  trendDirection = 'neutral', // 'up' | 'down' | 'neutral'
  subtitle = null,
  badge = null,
  onClick = null,
  className = '',
}) {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`rad-metric ${isClickable ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="rad-metric-header">
        <span className="rad-metric-label">{label}</span>
        {badge}
      </div>

      <div className="rad-metric-value-row">
        <span className="rad-metric-value">{value}</span>
        {trend && (
          <span
            className={`rad-metric-trend ${
              trendDirection === 'up'
                ? 'rad-metric-trend-up'
                : trendDirection === 'down'
                ? 'rad-metric-trend-down'
                : ''
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && <span className="rad-metric-sub">{subtitle}</span>}
    </div>
  );
}
