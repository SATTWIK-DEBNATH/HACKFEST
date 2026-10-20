import React from 'react';

/**
 * Reusable EmptyState Component
 * Clean, restrained zero-state display for filtered lists or unpopulated queries.
 */
export function EmptyState({
  icon = '🔍',
  title = 'No records found',
  description = 'Adjust search parameters or clear filters to view data.',
  actionLabel = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`rad-empty-state ${className}`} role="status">
      <div className="rad-empty-icon" aria-hidden="true">{icon}</div>
      <div className="rad-empty-title">{title}</div>
      {description && <div className="rad-empty-desc">{description}</div>}
      {actionLabel && onAction && (
        <button
          type="button"
          className="rad-panel-btn-icon"
          style={{ marginTop: '4px', padding: '4px 10px', fontWeight: 600 }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
