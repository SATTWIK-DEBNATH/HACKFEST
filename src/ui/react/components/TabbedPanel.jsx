import React, { useRef } from 'react';

/**
 * Reusable TabbedPanel Component
 * Provides accessible tab switching with Arrow key navigation, role="tablist", and badge counts.
 */
export function TabbedPanel({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
  ariaLabel = 'Panel tabs',
  children,
}) {
  const tabListRef = useRef(null);

  const handleKeyDown = (e, index) => {
    let newIndex = null;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    }

    if (newIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[newIndex];
      onTabChange?.(nextTab.id);
      const buttons = tabListRef.current?.querySelectorAll('button[role="tab"]');
      buttons?.[newIndex]?.focus();
    }
  };

  return (
    <div className={`rad-tabbed-container ${className}`}>
      <div
        ref={tabListRef}
        className="rad-tab-list"
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              id={`rad-tab-${tab.id}`}
              role="tab"
              type="button"
              className={`rad-tab-btn ${isActive ? 'active' : ''}`}
              aria-selected={isActive}
              aria-controls={`rad-tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange?.(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
            >
              {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="rad-tab-count" aria-label={`${tab.count} items`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        id={`rad-tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`rad-tab-${activeTab}`}
        className="rad-tabpanel-content"
      >
        {children}
      </div>
    </div>
  );
}
