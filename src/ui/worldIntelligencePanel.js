/**
 * Research Analysis Directorate — World Intelligence & Threat Radar UI Controller
 *
 * Progressively integrated with React feature architecture while preserving
 * Cesium 3D camera navigation, vanilla-JS lifecycle, and Alt+I shortcut triggers.
 *
 * @module ui/worldIntelligencePanel
 */

import { mountWorldIntelligenceReact } from './react/features/intelligence/mount.jsx';

export function createWorldIntelligencePanel({ viewer = null, container = document.body } = {}) {
  let activeTab = 'analytics';
  let isOpen = false;
  let toggleCallbacks = [];

  const panel = document.createElement('div');
  panel.id = 'world-intelligence-panel';
  panel.className = 'world-intelligence-panel hidden';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'World Intelligence & Threat Radar');

  function notifyToggle(openState) {
    toggleCallbacks.forEach((cb) => {
      try {
        cb(openState);
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Mount React feature tree
  const reactInstance = mountWorldIntelligenceReact(panel, {
    viewer,
    initialTab: activeTab,
    onClose: () => close(),
  });

  function open(tab = null) {
    if (tab) {
      activeTab = tab;
      reactInstance.renderTab(tab);
    }
    isOpen = true;
    panel.classList.remove('hidden');
    notifyToggle(true);
  }

  function close() {
    isOpen = false;
    panel.classList.add('hidden');
    notifyToggle(false);
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function onToggleState(callback) {
    if (typeof callback === 'function') {
      toggleCallbacks.push(callback);
    }
  }

  container.appendChild(panel);

  return {
    open,
    close,
    toggle,
    isOpen: () => isOpen,
    onToggleState,
    getPanelElement: () => panel,
  };
}
