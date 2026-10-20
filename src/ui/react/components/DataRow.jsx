import React from 'react';

/**
 * Reusable DataRow Component
 * High-density tabular item with keyboard accessibility, hover styling, and action triggers.
 */
export function DataRow({
  label,
  description = null,
  value = null,
  badge = null,
  action = null,
  onClick = null,
  isSelected = false,
  className = '',
}) {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`rad-data-row ${isSelected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="rad-data-cell-key">
        <span>{label}</span>
        {description && <span className="rad-data-cell-desc">{description}</span>}
      </div>

      <div className="rad-data-cell-val">
        {value !== null && <span>{value}</span>}
        {badge}
        {action}
      </div>
    </div>
  );
}
