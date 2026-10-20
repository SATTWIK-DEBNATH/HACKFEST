import React from 'react';

/**
 * Reusable SectionHeader Component
 * Clean hierarchy separator with subtitle, icon, and contextual action slots.
 */
export function SectionHeader({
  title,
  subtitle = null,
  icon = null,
  actions = null,
  className = '',
}) {
  return (
    <div className={`rad-section-header ${className}`}>
      <div className="rad-section-title-wrap">
        {icon && <span aria-hidden="true">{icon}</span>}
        <h3 className="rad-section-title">{title}</h3>
        {subtitle && <span className="rad-section-sub">&bull; {subtitle}</span>}
      </div>
      {actions && <div className="rad-section-actions">{actions}</div>}
    </div>
  );
}
