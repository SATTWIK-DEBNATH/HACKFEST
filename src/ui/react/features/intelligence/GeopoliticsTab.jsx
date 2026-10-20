import React, { useState } from 'react';
import { SectionHeader, Metric, StatusBadge, DataRow, EmptyState } from '../../components/index.js';
import { geopoliticalIntel } from '../../../../intelligence/geopoliticalIntel.js';

export function GeopoliticsTab({ onFlyTo }) {
  const [ciiTable] = useState(() => geopoliticalIntel.calculateAllCII());
  const [selectedCountryCode, setSelectedCountryCode] = useState('TWN');
  const [hotspotFilter, setHotspotFilter] = useState('all');

  const dossier = geopoliticalIntel.getCountryDossier(selectedCountryCode);
  const hotspots = geopoliticalIntel.getHotspots(hotspotFilter);

  // SVG Dial Math
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const scoreVal = dossier ? dossier.ciiScore : 50;
  const strokeDashoffset = circumference - (scoreVal / 100) * circumference;

  const getStatusType = (band) => {
    switch (band) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'warning';
      case 'ELEVATED': return 'brass';
      case 'MODERATE': return 'healthy';
      default: return 'neutral';
    }
  };

  const getDialColor = (band) => {
    switch (band) {
      case 'CRITICAL': return '#EDB08A';
      case 'HIGH': return '#E6C484';
      case 'ELEVATED': return '#DEC38C';
      case 'MODERATE': return '#9ED3BF';
      default: return '#8FA8A6';
    }
  };

  return (
    <div className="rad-tab-content-flow" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Country Deep-Dive Dossier */}
      <div className="intel-card">
        <SectionHeader
          title="Country Deep-Dive Dossier"
          subtitle={dossier?.name}
          icon="🛡️"
          actions={
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                className="intel-input"
                style={{ padding: '2px 6px', fontSize: '10px' }}
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                aria-label="Select Country Dossier"
              >
                {ciiTable.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {c.name} (CII: {c.ciiScore})
                  </option>
                ))}
              </select>
              {dossier && (
                <button
                  type="button"
                  className="intel-fly-btn"
                  onClick={() => onFlyTo?.(dossier.coordinates.lon, dossier.coordinates.lat, 2800000)}
                  title={`Fly globe to ${dossier.name}`}
                >
                  🌐 FLY
                </button>
              )}
            </div>
          }
        />

        {dossier && (
          <div className="intel-dossier-box">
            <div className="intel-dossier-head">
              <div className="intel-dial-wrap">
                <svg className="intel-dial-svg" viewBox="0 0 72 72" aria-hidden="true">
                  <circle className="intel-dial-circle-bg" cx="36" cy="36" r={radius} />
                  <circle
                    className="intel-dial-circle-val"
                    cx="36"
                    cy="36"
                    r={radius}
                    stroke={getDialColor(dossier.severityBand)}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: getDialColor(dossier.severityBand) }}>
                    {dossier.ciiScore} <span style={{ fontSize: '10px' }}>/ 100</span>
                  </div>
                  <StatusBadge status={getStatusType(dossier.severityBand)} label={`${dossier.severityBand} RISK`} />
                  <div style={{ fontSize: '8.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    24h Trend: {dossier.signedDelta}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '9px', color: 'var(--text-secondary)' }}>
                <div>ADVISORY: <strong style={{ color: dossier.stateDeptAdvisory.level >= 3 ? 'var(--state-critical)' : 'var(--signal-cyan-active)' }}>LVL {dossier.stateDeptAdvisory.level}</strong></div>
                <div>THEATER: <strong>{dossier.activeWar ? 'ACTIVE COMBAT' : 'STANDBY'}</strong></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', marginTop: '6px' }}>
              <Metric label="Civil Unrest" value={dossier.components.unrest} subtitle="Protest / Riot index" />
              <Metric label="Kinetic Conflict" value={dossier.components.conflict} subtitle="Active combat sorties" />
              <Metric label="Security Threat" value={dossier.components.security} subtitle="Terror / Infiltration" />
              <Metric label="Info / Cyber" value={dossier.components.information} subtitle="EW / Disinformation" />
            </div>

            {/* 7-Day Multi-Lane Timeline */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--signal-cyan-active)' }}>
                7-DAY MULTI-LANE EVENT TIMELINE (D-6 to D0):
              </div>
              <div className="intel-lanes-wrap">
                {['military', 'diplomatic', 'civil', 'infrastructure'].map((laneKey) => (
                  <div key={laneKey} className="intel-lane-row">
                    <span className="intel-lane-lbl">{laneKey}</span>
                    <div className="intel-lane-bar">
                      {dossier.lanesTimeline[laneKey].map((val, idx) => (
                        <div
                          key={idx}
                          className={`intel-lane-node ${
                            val >= 70 ? 'active-high' : val >= 40 ? 'active-med' : val > 0 ? 'active-low' : ''
                          }`}
                          title={`D-${6 - idx}: Score ${val}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CII v10 Leaderboard */}
      <div className="intel-card">
        <SectionHeader
          title="Country Instability Index (CII v10)"
          subtitle="31 Tier-1 Nations"
          icon="📊"
        />
        <div className="intel-cii-list">
          {ciiTable.map((c, i) => (
            <DataRow
              key={c.countryCode}
              label={`#${i + 1} ${c.name}`}
              description={`Delta: ${c.signedDelta}`}
              value={<strong>{c.ciiScore}</strong>}
              badge={<StatusBadge status={getStatusType(c.severityBand)} label={c.severityBand} />}
              isSelected={c.countryCode === selectedCountryCode}
              onClick={() => setSelectedCountryCode(c.countryCode)}
              action={
                <button
                  type="button"
                  className="intel-fly-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const d = geopoliticalIntel.getCountryDossier(c.countryCode);
                    if (d) onFlyTo?.(d.coordinates.lon, d.coordinates.lat, 2800000);
                  }}
                  title={`Fly globe to ${c.name}`}
                >
                  🌐
                </button>
              }
            />
          ))}
        </div>
      </div>

      {/* Flashpoint Escalation Ladder */}
      <div className="intel-card">
        <SectionHeader
          title="Flashpoint Escalation Ladder"
          subtitle="29+ Scored Hotspots"
          icon="🔥"
          actions={
            <select
              className="intel-input"
              style={{ padding: '1px 4px', fontSize: '9px' }}
              value={hotspotFilter}
              onChange={(e) => setHotspotFilter(e.target.value)}
              aria-label="Filter Hotspots"
            >
              <option value="all">All Levels</option>
              <option value="critical">Level 5 (War)</option>
              <option value="high">Level 4 (Severe)</option>
              <option value="elevated">Level 3 (Tense)</option>
            </select>
          }
        />
        <div className="intel-cii-list" style={{ maxHeight: '180px' }}>
          {hotspots.map((h) => (
            <DataRow
              key={h.id}
              label={h.name}
              description={`${h.region} • ${h.trend.toUpperCase()}`}
              badge={
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="intel-hotspot-level">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`intel-hotspot-pip ${
                          lvl <= h.escalationLevel
                            ? h.escalationLevel >= 5
                              ? 'on-red'
                              : h.escalationLevel >= 4
                              ? 'on-amber'
                              : 'on-cyan'
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  <StatusBadge
                    status={h.escalationLevel >= 5 ? 'critical' : h.escalationLevel >= 4 ? 'warning' : 'healthy'}
                    label={`L${h.escalationLevel}`}
                  />
                </div>
              }
              action={
                <button
                  type="button"
                  className="intel-fly-btn"
                  onClick={() => onFlyTo?.(h.coordinates.lon, h.coordinates.lat, 1200000)}
                  title={`Fly globe to ${h.name}`}
                >
                  🌐
                </button>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
