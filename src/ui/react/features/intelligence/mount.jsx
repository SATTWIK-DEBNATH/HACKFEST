import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorldIntelligenceApp } from './WorldIntelligenceApp.jsx';

/**
 * Adapter to mount the React WorldIntelligenceApp into a DOM container
 * Maintains 100% compatibility with existing Cesium viewer and vanilla-JS application controllers.
 */
export function mountWorldIntelligenceReact(
  container,
  { viewer = null, initialTab = 'analytics', onClose = null } = {}
) {
  let root = createRoot(container);
  let currentTab = initialTab;

  function flyTo(lon, lat, height = 1500000) {
    if (viewer?.camera && typeof Cesium !== 'undefined') {
      try {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
          duration: 1.8,
        });
      } catch (err) {
        console.warn('Cesium flyTo navigation error:', err);
      }
    }
  }

  function render(tab = currentTab) {
    currentTab = tab;
    root.render(
      <React.StrictMode>
        <WorldIntelligenceApp
          initialTab={tab}
          onClose={onClose}
          onFlyTo={flyTo}
        />
      </React.StrictMode>
    );
  }

  // Initial render
  render(initialTab);

  return {
    renderTab: (tab) => render(tab),
    unmount: () => {
      if (root) {
        root.unmount();
        root = null;
      }
    },
  };
}
