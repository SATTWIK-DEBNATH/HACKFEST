import React from 'react';

/**
 * Reusable LoadingState Component
 * Restrained optical spinner with WCAG-compliant live status.
 */
export function LoadingState({
  label = 'Loading operational telemetry...',
  detail = null,
  className = '',
}) {
  return (
    <div
      className={`rad-loading-state ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="rad-loading-spinner" aria-hidden="true" />
      <span className="rad-loading-label">{label}</span>
      {detail && <span className="rad-metric-sub">{detail}</span>}
    </div>
  );
}
