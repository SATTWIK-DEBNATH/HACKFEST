import React from 'react';

/**
 * Reusable StatusBadge Component
 * Semantic, WCAG-AA compliant state indicator (never color-alone).
 */
export function StatusBadge({
  status = 'neutral', // 'healthy' | 'warning' | 'critical' | 'neutral' | 'brass'
  label,
  showDot = true,
  className = '',
  title = null,
}) {
  const normalizedStatus = ['healthy', 'warning', 'critical', 'neutral', 'brass'].includes(status)
    ? status
    : 'neutral';

  return (
    <span
      className={`rad-badge rad-badge-${normalizedStatus} ${className}`}
      title={title || `${label} (${normalizedStatus} state)`}
    >
      {showDot && <span className="rad-badge-dot" aria-hidden="true" />}
      <span className="rad-badge-text">{label}</span>
    </span>
  );
}
