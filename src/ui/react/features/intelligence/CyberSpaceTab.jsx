import React, { useState } from 'react';
import { SectionHeader, Metric, StatusBadge, DataRow, EmptyState } from '../../components/index.js';
import { cyberSpaceHazards } from '../../../../intelligence/cyberSpaceHazards.js';

export function CyberSpaceTab({ onFlyTo }) {
  const [cables] = useState(() => cyberSpaceHazards.getSubseaCableStatus());
  const [repairFleet] = useState(() => cyberSpaceHazards.getRepairFleet());
  const [spaceWeather] = useState(() => cyberSpaceHazards.getNoaaSpaceWeatherScales());
  const [flares] = useState(() => cyberSpaceHazards.getSolarFlareAlerts());
  const [conjunctions] = useState(() => cyberSpaceHazards.getOrbitalConjunctions());
  const [gpsJamming] = useState(() => cyberSpaceHazards.getGpsJammingZones());
  const [cisaKev] = useState(() => cyberSpaceHazards.getCisaKevThreats());

  // Cascade Simulation State
  const [selectedCascadeCable, setSelectedCascadeCable] = useState('cbl-aae1');
  const [cascadeResult, setCascadeResult] = useState(() =>
    cyberSpaceHazards.simulateInfrastructureCascade('cbl-aae1')
  );

  const handleSimulate = () => {
    const res = cyberSpaceHazards.simulateInfrastructureCascade(selectedCascadeCable);
    setCascadeResult(res);
  };

  return (
    <div className="rad-tab-content-flow" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* NOAA Space Weather Scales (G, R, S) */}
      <div className="intel-card">
        <SectionHeader
          title="NOAA Space Weather Scales"
          subtitle="Solar Cycle 25 Maximum"
          icon="☀️"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
          <Metric
            label="Geomagnetic (G)"
            value={spaceWeather.geomagneticStorms.scale}
            subtitle={spaceWeather.geomagneticStorms.severity}
            badge={<StatusBadge status={spaceWeather.geomagneticStorms.scale === 'G0' ? 'healthy' : 'warning'} label="Grid Alerts" />}
          />
          <Metric
            label="Radiation (S)"
            value={spaceWeather.solarRadiationStorms.scale}
            subtitle={spaceWeather.solarRadiationStorms.severity}
            badge={<StatusBadge status={spaceWeather.solarRadiationStorms.scale === 'S0' ? 'healthy' : 'brass'} label="Bio / Polar" />}
          />
          <Metric
            label="Radio Blackout (R)"
            value={spaceWeather.radioBlackouts.scale}
            subtitle={spaceWeather.radioBlackouts.severity}
            badge={<StatusBadge status={spaceWeather.radioBlackouts.scale === 'R0' ? 'healthy' : 'critical'} label="HF Comms" />}
          />
        </div>

        {flares.length > 0 && (
          <div style={{ fontSize: '9px', color: 'var(--state-warning)', background: 'rgba(230, 196, 132, 0.08)', padding: '5px 8px', borderRadius: '3px', marginTop: '6px' }}>
            ⚠️ Active Flare: <strong>{flares[0].classRating}</strong> from Sunspot {flares[0].sunspotRegion} &bull; Peak: {flares[0].peakTime} (Transatlantic HF aviation radio blackout)
          </div>
        )}
      </div>

      {/* Orbital Debris CDMs & GPS Jamming */}
      <div className="intel-card">
        <SectionHeader
          title="Orbital Conjunctions & GPS Jamming"
          subtitle="Critical Infrastructure Threats"
          icon="🛰️"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {conjunctions.map((c, i) => (
            <DataRow
              key={i}
              label={`LEO Conjunction: ${c.satelliteA} vs ${c.satelliteB}`}
              description={`TCA: ${c.timeOfClosestApproach} • Prob: ${c.probabilityOfCollision.toExponential(1)} • Alt: ${c.altitudeKm}km`}
              badge={
                <StatusBadge
                  status={c.missDistanceMeters < 100 ? 'critical' : 'warning'}
                  label={`MISS: ${c.missDistanceMeters}m`}
                />
              }
            />
          ))}

          {gpsJamming.slice(0, 2).map((j, i) => (
            <DataRow
              key={i}
              label={`GNSS Jamming: ${j.zoneName}`}
              description={`Type: ${j.spoofingType} • Impact: ${j.affectedTraffic}`}
              badge={<StatusBadge status="warning" label={j.intensityLevel} />}
            />
          ))}
        </div>
      </div>

      {/* Subsea Cable Health & Repair Fleet */}
      <div className="intel-card">
        <SectionHeader
          title="Subsea Cable Health & Repair Fleet"
          subtitle={`${cables.length} Monitored Lines`}
          icon="⚓"
        />
        <div className="intel-cii-list" style={{ maxHeight: '160px' }}>
          {cables.map((c) => (
            <DataRow
              key={c.id}
              label={c.cableName}
              description={`${c.route} • ${c.lengthKm.toLocaleString()} km`}
              badge={
                <StatusBadge
                  status={
                    c.status === 'FAULT / SEVERED'
                      ? 'critical'
                      : c.status === 'DEGRADED' || c.status === 'WATCH'
                      ? 'warning'
                      : 'healthy'
                  }
                  label={c.status}
                />
              }
              action={
                <button
                  type="button"
                  className="intel-fly-btn"
                  onClick={() => onFlyTo?.(c.coordinates.lon, c.coordinates.lat, 1800000)}
                  title={`Fly globe to ${c.cableName}`}
                >
                  🌐
                </button>
              }
            />
          ))}
        </div>

        <div style={{ marginTop: '6px', fontSize: '8.5px', color: 'var(--text-secondary)' }}>
          ACTIVE REPAIR VESSELS:
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' }}>
            {repairFleet.map((v) => (
              <span key={v.vesselName} className="intel-vessel-badge">
                {v.vesselName} ({v.operator}) - {v.status}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure Cascade Simulator */}
      <div className="intel-cascade-box">
        <SectionHeader
          title="Infrastructure Cascade Simulator"
          subtitle="Multi-Hop Failure Graph"
          icon="⚡"
        />

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>SELECT OUTAGE:</span>
          <select
            className="intel-input"
            style={{ padding: '2px 6px', fontSize: '9.5px', flex: 1 }}
            value={selectedCascadeCable}
            onChange={(e) => setSelectedCascadeCable(e.target.value)}
            aria-label="Select Infrastructure Outage"
          >
            {cables.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cableName} ({c.route})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rad-panel-btn-icon"
            style={{ background: 'rgba(237, 176, 138, 0.15)', borderColor: 'var(--state-critical)', color: 'var(--state-critical)', fontWeight: 700 }}
            onClick={handleSimulate}
          >
            SIMULATE
          </button>
        </div>

        {cascadeResult && (
          <div className="intel-cascade-tree" style={{ marginTop: '8px' }}>
            <div className="intel-cascade-hop">
              <div className="intel-cascade-hop-title">Hop 1: Critical Landing Stations & Portals</div>
              <div className="intel-cascade-hop-items">
                {cascadeResult.tier1Stations.map((s, idx) => (
                  <div key={idx}>• {s.name} ({s.country}) - {s.status}</div>
                ))}
              </div>
            </div>

            <div className="intel-cascade-hop">
              <div className="intel-cascade-hop-title">Hop 2: Financial Settlements & Core Routing</div>
              <div className="intel-cascade-hop-items">
                {cascadeResult.tier2Exchanges.map((x, idx) => (
                  <div key={idx}>• {x.exchange} - Status: {x.impact}</div>
                ))}
              </div>
            </div>

            <div className="intel-cascade-hop">
              <div className="intel-cascade-hop-title">Hop 3: Cloud Availability Zones & Latency</div>
              <div className="intel-cascade-hop-items">
                {cascadeResult.tier3Cloud.map((cl, idx) => (
                  <div key={idx}>• {cl.region} - Latency: {cl.latencySpike} ({cl.status})</div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '9px', color: 'var(--accent-brass)', marginTop: '4px' }}>
              Estimated Downstream Economic Exposure: <strong>${(cascadeResult.estimatedEconomicLossUsd / 1e6).toFixed(1)}M / hour</strong>
            </div>
          </div>
        )}
      </div>

      {/* CISA KEV Radar */}
      <div className="intel-card">
        <SectionHeader
          title="CISA KEV Exploited Vulnerabilities"
          subtitle="Mandatory Federal Mitigation"
          icon="🛡️"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {cisaKev.map((k) => (
            <DataRow
              key={k.cveId}
              label={`${k.cveId} • ${k.vendorProject} ${k.product}`}
              description={`${k.vulnerabilityName} • Due: ${k.dueDate}`}
              badge={<StatusBadge status="critical" label={`CVSS ${k.cvssScore}`} />}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
