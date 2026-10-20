import React, { useState } from 'react';
import { Panel, TabbedPanel } from '../../components/index.js';
import { AnalyticsTab } from './AnalyticsTab.jsx';
import { GeopoliticsTab } from './GeopoliticsTab.jsx';
import { MacroTab } from './MacroTab.jsx';
import { CyberSpaceTab } from './CyberSpaceTab.jsx';

export function WorldIntelligenceApp({
  initialTab = 'analytics',
  onClose = null,
  onFlyTo = null,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMinimized, setIsMinimized] = useState(false);

  const tabs = [
    { id: 'analytics', label: 'ANALYTICS', icon: '🧠', count: 6 },
    { id: 'geopolitics', label: 'GEOPOLITICS', icon: '🌐', count: 31 },
    { id: 'macro', label: 'MACRO / FX', icon: '📈', count: 45 },
    { id: 'cyber_space', label: 'CYBER / SPACE', icon: '⚡', count: 5 },
  ];

  return (
    <Panel
      title="World Intel & Threat Radar"
      badge="LIVE FEED"
      icon="⚡"
      isMinimized={isMinimized}
      onMinimize={() => setIsMinimized((prev) => !prev)}
      onClose={onClose}
      ariaLabel="World Intelligence and Threat Radar Command Panel"
    >
      <TabbedPanel
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ariaLabel="Intelligence Sections"
      >
        {activeTab === 'analytics' && <AnalyticsTab onFlyTo={onFlyTo} />}
        {activeTab === 'geopolitics' && <GeopoliticsTab onFlyTo={onFlyTo} />}
        {activeTab === 'macro' && <MacroTab onFlyTo={onFlyTo} />}
        {activeTab === 'cyber_space' && <CyberSpaceTab onFlyTo={onFlyTo} />}
      </TabbedPanel>
    </Panel>
  );
}
