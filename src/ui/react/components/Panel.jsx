import React, { useEffect, useRef } from 'react';

/**
 * Reusable Panel Component
 * Dark optical-glass floating/docked window surface aligned with Resilience Lens.
 */
export function Panel({
  title,
  badge = null,
  icon = '🌐',
  onClose = null,
  onMinimize = null,
  isMinimized = false,
  className = '',
  ariaLabel = title,
  actions = null,
  children,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <section
      ref={panelRef}
      className={`rad-panel ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <header className="rad-panel-header">
        <div className="rad-panel-title-group">
          {icon && <span className="rad-panel-icon" aria-hidden="true">{icon}</span>}
          <h2 className="rad-panel-title">{title}</h2>
          {badge && <span className="rad-panel-badge">{badge}</span>}
        </div>
        <div className="rad-panel-controls">
          {actions}
          {onMinimize && (
            <button
              type="button"
              className="rad-panel-btn-icon"
              onClick={onMinimize}
              title={isMinimized ? 'Expand panel' : 'Minimize panel'}
              aria-label={isMinimized ? 'Expand panel' : 'Minimize panel'}
            >
              {isMinimized ? '□' : '—'}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className="rad-panel-btn-icon"
              onClick={onClose}
              title="Close panel (Esc)"
              aria-label="Close panel"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {!isMinimized && (
        <div className="rad-panel-body" role="region">
          {children}
        </div>
      )}
    </section>
  );
}
