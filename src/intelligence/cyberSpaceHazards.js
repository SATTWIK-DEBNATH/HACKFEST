/**
 * Research Analysis Directorate (RAD) — Cyber Threats and Space Hazard Monitoring
 *
 * Implements WorldMonitor cyber & space hazard tracking:
 * 1. Global Internet Disruption Radar (Cloudflare / IODA telemetry)
 * 2. CISA KEV (Known Exploited Vulnerabilities) & Zero-Day Tracking
 * 3. Subsea Fiber-Optic Cable Health & Cable Repair Fleet Tracking
 * 4. Multi-Tier Critical Infrastructure Cascade Simulator
 * 5. NOAA Space Weather Scales (G, R, S) & Solar Flare Watch
 * 6. Orbital Debris Tracking & Conjunction Data Messages (CDMs)
 * 7. GPS/GNSS Jamming & Spoofing Intensity Theaters
 *
 * @module intelligence/cyberSpaceHazards
 */

import { CYBER_AND_SPACE_DATA } from './data/intelligenceData.js';

export class CyberSpaceHazards {
  constructor() {
    this.data = { ...CYBER_AND_SPACE_DATA };
  }

  // ==========================================
  // 1. INTERNET OUTAGES (IODA / CLOUDFLARE RADAR)
  // ==========================================
  getInternetOutages() {
    const list = this.data.internetOutages.map((o, idx) => ({
      id: `outage-${idx + 1}`,
      country: o.country,
      region: o.region,
      severity: o.severity,
      dropPercent: o.dropPct,
      affectedAsns: o.affectedAsns,
      affectedPopulation: o.affectedAsns * 185000,
      cause: o.cause,
      timestamp: o.timestamp,
    }));

    list.activeOutages = list;
    list.totalOutageEvents = list.length;
    list.totalImpactedAsns = list.reduce((acc, o) => acc + o.affectedAsns, 0);
    list.highestSeverity = list.some((o) => o.severity === 'TOTAL' || o.severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH';
    list.globalRoutingStatus = 'DEGRADED_REGIONAL_ISOLATION';

    return list;
  }

  // ==========================================
  // 2. CYBER THREAT RADAR & CISA KEV
  // ==========================================
  getCisaKevThreats() {
    return [
      {
        cveId: 'CVE-2026-3840',
        vendorProject: 'Palo Alto Networks',
        product: 'PAN-OS Gateway Controller',
        vulnerabilityName: 'Command Injection in GlobalProtect Gateway',
        cvssScore: 9.8,
        knownRansomwareUse: true,
        dueDate: '2026-10-24',
        actionRequired: 'Apply emergency vendor patch or isolate gateway edge ports immediately.',
      },
      {
        cveId: 'CVE-2026-21887',
        vendorProject: 'Ivanti',
        product: 'Connect Secure / Policy Secure',
        vulnerabilityName: 'Authentication Bypass in Web Components',
        cvssScore: 9.1,
        knownRansomwareUse: true,
        dueDate: '2026-10-22',
        actionRequired: 'Mandatory CISA Emergency Directive federal mitigation in effect.',
      },
      {
        cveId: 'CVE-2026-38856',
        vendorProject: 'Apache',
        product: 'OFBiz Enterprise ERP',
        vulnerabilityName: 'Pre-Authentication Remote Code Execution',
        cvssScore: 9.8,
        knownRansomwareUse: false,
        dueDate: '2026-10-28',
        actionRequired: 'Upgrade enterprise clusters to patched branch.',
      },
    ];
  }

  getCyberThreats() {
    const kev = this.getCisaKevThreats();
    return {
      threatAlerts: kev,
      ransomwareIndex: {
        activeCampaigns: 4,
        prominentActor: 'LockBit 3.0 / BlackCat Resurgent',
        targetedSectors: ['Healthcare', 'Port Logistics', 'Energy Grids'],
      },
      ddosVolumetricTelemetry: {
        peakRateTbps: 3.8,
        targetRegion: 'Northern & Eastern Europe',
        vector: 'DNS Amplification + QUIC Flood',
      },
      cisaEmergencyDirectiveActive: true,
    };
  }

  // ==========================================
  // 3. SUBSEA CABLE HEALTH & REPAIR FLEET
  // ==========================================
  getSubseaCableStatus() {
    const cables = [
      {
        id: 'cbl-seamewe5',
        cableName: 'SeaMeWe-5',
        route: 'Marseille - Suez - Singapore',
        lengthKm: 20000,
        status: 'FAULT / SEVERED',
        coordinates: { lat: 31.2, lon: 32.3 },
        impact: '4.2 Tbps transit rerouted around Good Hope',
      },
      {
        id: 'cbl-aae1',
        cableName: 'AAE-1 (Asia-Africa-Europe 1)',
        route: 'Hong Kong - Red Sea - France',
        lengthKm: 25000,
        status: 'DEGRADED',
        coordinates: { lat: 12.8, lon: 44.5 },
        impact: 'High latency jitter on Europe-Asia financial routes',
      },
      {
        id: 'cbl-clion1',
        cableName: 'C-Lion1 / Baltic Connector',
        route: 'Helsinki - Rostock',
        lengthKm: 1173,
        status: 'WATCH',
        coordinates: { lat: 59.8, lon: 24.5 },
        impact: 'Finnish Navy active surveillance patrol',
      },
      {
        id: 'cbl-dunant',
        cableName: 'Dunant Trans-Atlantic',
        route: 'Virginia Beach - Saint-Hilaire',
        lengthKm: 6400,
        status: 'OPERATIONAL',
        coordinates: { lat: 40.0, lon: -40.0 },
        impact: 'Operating at 99.98% capacity',
      },
      {
        id: 'cbl-safe',
        cableName: 'SAFE (South Africa Far East)',
        route: 'Melkbosstrand - Penang',
        lengthKm: 13500,
        status: 'OPERATIONAL',
        coordinates: { lat: -20.0, lon: 70.0 },
        impact: 'Absorbing rerouted Red Sea packets',
      },
    ];

    cables.cables = cables;
    cables.repairShips = this.getRepairFleet();
    return cables;
  }

  getRepairFleet() {
    return [
      {
        vesselName: 'CS Reliance',
        operator: 'Marshall Islands / SubCom',
        status: 'ON-STATION SPLICING',
        location: 'Port Said Approach (31.42°N, 32.28°E)',
        eta: '36 hours to complete joint',
      },
      {
        vesselName: 'Île de Bréhat',
        operator: 'France / Louis Dreyfus Armateurs',
        status: 'EN ROUTE (14.2 kts)',
        location: 'Gulf of Oman (24.81°N, 58.12°E)',
        eta: '18 hours to standby coordinate',
      },
      {
        vesselName: 'Cable Innovator',
        operator: 'UK / Global Marine',
        status: 'PATROL STANDBY',
        location: 'Baltic Sea (54.12°N, 19.85°E)',
        eta: 'On active watch',
      },
    ];
  }

  // ==========================================
  // 4. INFRASTRUCTURE CASCADE SIMULATOR
  // ==========================================
  simulateInfrastructureCascade(nodeId = 'cbl-aae1') {
    const isRedSea = nodeId.includes('aae1') || nodeId.includes('seamewe5');

    return {
      triggerNode: isRedSea ? 'Red Sea Subsea Chokepoint (AAE-1 / SMW5)' : 'Trans-Atlantic Gateway Cable',
      tier1Stations: [
        { name: 'Zafarana Cable Landing Station', country: 'Egypt', status: 'OVERLOADED (142% rated bandwidth)' },
        { name: 'Abu Talat Mediterranean Portal', country: 'Egypt', status: 'BUFFER PACKET LOSS (4.8%)' },
        { name: 'Djibouti Telecom Landing Core', country: 'Djibouti', status: 'REROUTED TO CAPE CABLES' },
      ],
      tier2Exchanges: [
        { exchange: 'LINX (London Internet Exchange)', impact: 'Peak latency spike +38ms on APAC traffic' },
        { exchange: 'DE-CIX Frankfurt', impact: 'Transit queueing delay on Gulf bank clearing' },
        { exchange: 'Equinix SG1 Singapore', impact: 'Alternative routing via TGN-IA / SeaMeWe-3' },
      ],
      tier3Cloud: [
        { region: 'AWS eu-central-1 (Frankfurt)', latencySpike: '+42ms', status: 'Degraded Inter-AZ Replication' },
        { region: 'Azure Middle East Central (Dubai)', latencySpike: '+65ms', status: 'Packet Reroute Active' },
        { region: 'Google Cloud europe-west3', latencySpike: '+35ms', status: 'Synthetic Probe Alert' },
      ],
      estimatedEconomicLossUsd: isRedSea ? 4850000 : 1200000,
    };
  }

  simulateCascade(nodeId) {
    return this.simulateInfrastructureCascade(nodeId);
  }

  // ==========================================
  // 5. SPACE WEATHER & SOLAR FLARES
  // ==========================================
  getNoaaSpaceWeatherScales() {
    return {
      geomagneticStorms: { scale: 'G2', severity: 'Moderate', description: 'High-latitude power systems may experience voltage alarms' },
      solarRadiationStorms: { scale: 'S1', severity: 'Minor', description: 'Minor biological impact to astronauts; HF comms degraded at poles' },
      radioBlackouts: { scale: 'R2', severity: 'Moderate', description: 'Limited blackout of HF radio on sunlit side for tens of minutes' },
    };
  }

  getSpaceWeatherStatus() {
    const scales = this.getNoaaSpaceWeatherScales();
    return {
      scales: {
        geomagneticStorm: { scale: scales.geomagneticStorms.scale, label: scales.geomagneticStorms.severity, statusColor: '#ff9500' },
        solarRadiation: { scale: scales.solarRadiationStorms.scale, label: scales.solarRadiationStorms.severity, statusColor: '#ffd60a' },
        radioBlackout: { scale: scales.radioBlackouts.scale, label: scales.radioBlackouts.severity, statusColor: '#ff9500' },
      },
      kpIndex: 5.67,
      solarWindSpeed: '612 km/s',
      activeFlare: { class: 'X1.8', sourceRegion: 'AR3862', peakTime: '45m ago' },
      polarRouteAdvisory: 'Scintillation causing 15-35m L1/L5 positional drift across polar routes above 65°N',
    };
  }

  getSolarFlareAlerts() {
    return [
      {
        classRating: 'X1.8',
        sunspotRegion: 'AR3862',
        peakTime: '45m ago',
        radiationBlackoutScale: 'R2',
        impactDescription: 'High-frequency aviation comms blacked out across North Atlantic tracks.',
      },
      {
        classRating: 'M4.8',
        sunspotRegion: 'AR3858',
        peakTime: '4h ago',
        radiationBlackoutScale: 'R1',
        impactDescription: 'Minor degradation on polar HF communications.',
      },
    ];
  }

  // ==========================================
  // 6. ORBITAL HAZARDS & GPS JAMMING
  // ==========================================
  getOrbitalConjunctions() {
    return [
      {
        satelliteA: 'STARLINK-4122',
        satelliteB: 'COSMOS 1408 DEB',
        missDistanceMeters: 48,
        probabilityOfCollision: 1.2e-4,
        timeOfClosestApproach: 'In 3h 14m',
        altitudeKm: 550,
      },
      {
        satelliteA: 'ISS (ZARYA)',
        satelliteB: 'FENGYUN 1C DEB',
        missDistanceMeters: 1840,
        probabilityOfCollision: 4.8e-6,
        timeOfClosestApproach: 'In 9h 42m',
        altitudeKm: 420,
      },
    ];
  }

  getGpsJammingZones() {
    return [
      {
        zoneName: 'Baltic / Kaliningrad Pocket',
        intensityLevel: 'CRITICAL / EXTREME',
        spoofingType: 'Circle Drift & Alt Spoof',
        affectedTraffic: '78% of commercial flights',
      },
      {
        zoneName: 'Eastern Mediterranean / Cyprus Sector',
        intensityLevel: 'CRITICAL / EXTREME',
        spoofingType: 'Synthetic Ground Clutter',
        affectedTraffic: '92% of commercial flights',
      },
      {
        zoneName: 'Northern Black Sea Corridor',
        intensityLevel: 'SEVERE',
        spoofingType: 'Broadband Noise Jamming',
        affectedTraffic: '84% of commercial maritime/air',
      },
    ];
  }

  getOrbitalAndJammingData() {
    return {
      conjunctionWarnings: this.getOrbitalConjunctions(),
      activeJammingTheaters: this.getGpsJammingZones(),
      totalGpsJammingAffectedFlightsPct: 68,
      primaryJammerLocation: 'Khmeimim Air Base / Kaliningrad EW Battalions',
    };
  }
}

export const cyberSpaceHazards = new CyberSpaceHazards();
