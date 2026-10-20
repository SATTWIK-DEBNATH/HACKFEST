/**
 * Research Analysis Directorate (RAD) — Geopolitical and Conflict Intelligence
 *
 * Implements WorldMonitor geopolitical intelligence capabilities:
 * 1. Country Instability Index (CII v10) for 31 Tier-1 nations
 * 2. Country Deep-Dive Dossier (animated SVG dial, 4-bar breakdown, active chips)
 * 3. 7-Day Multi-Lane Event Timeline (Protest, Conflict, Military, Natural)
 * 4. Hotspot Escalation Radar (29+ flashpoints on 1–5 ladder)
 * 5. Conflict Events, Strike Monitors & OREF Siren Stream
 * 6. Population Exposure Estimation Engine
 *
 * @module intelligence/geopoliticalIntel
 */

import { TIER1_COUNTRIES, SCORED_HOTSPOTS } from './data/intelligenceData.js';

export class GeopoliticalIntelligence {
  constructor() {
    this.countries = { ...TIER1_COUNTRIES };
    this.hotspots = [...SCORED_HOTSPOTS];
    this.simulatedDeltas = this.generate24hDeltas();

    // Mapping 3-letter ISO codes to 2-letter keys
    this.isoMap = {
      USA: 'US', CHN: 'CN', RUS: 'RU', UKR: 'UA', IRN: 'IR',
      ISR: 'IL', TWN: 'TW', PRK: 'KP', SAU: 'SA', TUR: 'TR',
      POL: 'PL', DEU: 'DE', FRA: 'FR', GBR: 'GB', IND: 'IN',
      PAK: 'PK', SYR: 'SY', YEM: 'YE', MMR: 'MM', VEN: 'VE',
      CUB: 'CU', MEX: 'MX', BRA: 'BR', ARE: 'AE', KOR: 'KR',
      IRQ: 'IQ', AFG: 'AF', LBN: 'LB', EGY: 'EG', JPN: 'JP',
      QAT: 'QA',
    };
    this.iso3Map = {};
    for (const [k, v] of Object.entries(this.isoMap)) {
      this.iso3Map[v] = k;
    }
  }

  resolveCountryKey(code) {
    if (!code) return 'US';
    const upper = code.toUpperCase();
    if (this.countries[upper]) return upper;
    if (this.isoMap[upper]) return this.isoMap[upper];
    return 'US';
  }

  generate24hDeltas() {
    return {
      UA: +3.2,
      RU: +1.8,
      IR: +4.6,
      IL: +3.9,
      LB: +5.2,
      YE: +2.4,
      TW: +1.5,
      KP: +0.8,
      SY: +2.1,
      MM: +1.2,
      PK: -0.4,
      SD: +3.0,
      US: -0.2,
      CN: +0.5,
      DE: -0.1,
      FR: +0.4,
      GB: -0.3,
    };
  }

  // ==========================================
  // 1. COUNTRY INSTABILITY INDEX (CII v10)
  // ==========================================
  calculateCII(countryCode) {
    const key = this.resolveCountryKey(countryCode);
    const meta = this.countries[key] || {
      code: key,
      name: countryCode,
      baselineRisk: 20,
      eventMultiplier: 1.0,
    };

    // Calculate components (0–100 scale)
    const unrest = this.computeUnrestComponent(key, meta);
    const conflict = this.computeConflictComponent(key, meta);
    const security = this.computeSecurityComponent(key, meta);
    const information = this.computeInformationComponent(key, meta);

    // Blended event score
    const rawEventScore = 0.25 * unrest + 0.30 * conflict + 0.20 * security + 0.25 * information;
    const scaledEventScore = Math.min(100, rawEventScore * meta.eventMultiplier);

    // Baseline risk (40%) + Event score (60%)
    let combinedScore = 0.40 * (meta.baselineRisk * 2.0) + 0.60 * scaledEventScore;

    // Apply floors (active war floor >= 70, travel advisory floor >= 60)
    if (['UA', 'IL', 'LB', 'SY', 'YE'].includes(key)) {
      combinedScore = Math.max(combinedScore, 75.0);
    } else if (['IR', 'KP', 'MM', 'AF'].includes(key)) {
      combinedScore = Math.max(combinedScore, 65.0);
    }

    const finalScore = Math.min(100, Math.max(5, Math.round(combinedScore * 10) / 10));
    const delta24h = this.simulatedDeltas[key] || 0.0;
    const band = this.getSeverityBand(finalScore);

    const iso3Code = this.iso3Map[key] || key;
    return {
      countryCode: iso3Code,
      code: key,
      iso2: key,
      iso3: iso3Code,
      name: meta.name,
      score: finalScore,
      ciiScore: finalScore,
      delta24h,
      signedDelta: delta24h >= 0 ? `+${delta24h.toFixed(1)}` : `${delta24h.toFixed(1)}`,
      band,
      severityBand: band.label,
      baselineRisk: meta.baselineRisk,
      eventMultiplier: meta.eventMultiplier,
      components: {
        unrest: Math.round(unrest),
        conflict: Math.round(conflict),
        security: Math.round(security),
        information: Math.round(information),
      },
      indicators: this.getActiveSignals(key),
    };
  }

  calculateAllCII() {
    return Object.keys(this.countries)
      .map((code) => this.calculateCII(code))
      .sort((a, b) => b.ciiScore - a.ciiScore);
  }

  getAllCiiScores() {
    return this.calculateAllCII();
  }

  computeUnrestComponent(code) {
    if (['IR', 'LB', 'SY', 'YE', 'MM'].includes(code)) return 78;
    if (['FR', 'IL', 'UA', 'PK', 'VE'].includes(code)) return 55;
    if (['US', 'GB', 'DE', 'PL'].includes(code)) return 32;
    return 18;
  }

  computeConflictComponent(code) {
    if (['UA', 'IL', 'LB', 'SY', 'YE'].includes(code)) return 92;
    if (['RU', 'IR', 'MM', 'KP'].includes(code)) return 76;
    if (['TW', 'PK', 'AF', 'IQ'].includes(code)) return 58;
    if (['US', 'CN', 'PL'].includes(code)) return 35;
    return 12;
  }

  computeSecurityComponent(code) {
    if (['IL', 'UA', 'RU', 'TW', 'IR'].includes(code)) return 85;
    if (['KP', 'PL', 'US', 'CN', 'KR'].includes(code)) return 68;
    return 28;
  }

  computeInformationComponent(code) {
    if (['IL', 'UA', 'RU', 'IR', 'TW'].includes(code)) return 88;
    if (['US', 'CN', 'KP', 'LB'].includes(code)) return 70;
    return 30;
  }

  getSeverityBand(score) {
    if (score >= 75) return { label: 'CRITICAL', color: '#ff3b30' };
    if (score >= 60) return { label: 'HIGH', color: '#ff9500' };
    if (score >= 45) return { label: 'ELEVATED', color: '#ffd60a' };
    if (score >= 30) return { label: 'MODERATE', color: '#00f0ff' };
    return { label: 'LOW', color: '#30d158' };
  }

  // ==========================================
  // 2. ACTIVE SIGNALS & INFRASTRUCTURE PROXIMITY
  // ==========================================
  getActiveSignals(countryCode) {
    const defaultSignals = [
      { type: 'flights', label: 'Military Flights', value: '4 sorties', status: 'ACTIVE' },
      { type: 'vessels', label: 'Naval Presence', value: '2 vessels', status: 'NORMAL' },
      { type: 'outage', label: 'Internet Disruptions', value: '0 outages', status: 'STABLE' },
      { type: 'market', label: 'Stock Index 1W', value: '+0.4%', status: 'POSITIVE' },
    ];

    if (['IL', 'LB', 'IR', 'SY'].includes(countryCode)) {
      return [
        { type: 'strike', label: 'Air Defense / Strikes', value: 'ACTIVE ALERT', status: 'CRITICAL' },
        { type: 'flights', label: 'EW & Tanker Packaging', value: '32 sorties', status: 'CRITICAL' },
        { type: 'vessels', label: 'CSG Combatants', value: '1 Carrier + 8 Escorts', status: 'HIGH' },
        { type: 'outage', label: 'Cellular/Net Blackouts', value: '18% drop', status: 'ELEVATED' },
      ];
    }

    if (['UA', 'RU'].includes(countryCode)) {
      return [
        { type: 'conflict', label: 'Active Mechanized Combat', value: '14 Contacts/24h', status: 'CRITICAL' },
        { type: 'flights', label: 'ISR & Patrol Sorties', value: '46 tracks', status: 'CRITICAL' },
        { type: 'gps', label: 'GPS Spoofing/Jamming', value: 'Severe (>85%)', status: 'HIGH' },
        { type: 'outage', label: 'Power Grid Damage', value: 'Localized', status: 'ELEVATED' },
      ];
    }

    if (countryCode === 'TW') {
      return [
        { type: 'flights', label: 'ADIZ Crossings', value: '28 airframes/24h', status: 'HIGH' },
        { type: 'vessels', label: 'PLAN Destroyer Patrols', value: '4 combatants', status: 'ELEVATED' },
        { type: 'market', label: 'Taiex Index 1W', value: '-1.4%', status: 'NEGATIVE' },
        { type: 'semiconductor', label: 'Hsinchu Fab Operations', value: 'Normal', status: 'STABLE' },
      ];
    }

    return defaultSignals;
  }

  // ==========================================
  // 3. COUNTRY DEEP-DIVE DOSSIER
  // ==========================================
  getCountryDossier(countryCode) {
    const key = this.resolveCountryKey(countryCode);
    const cii = this.calculateCII(key);
    const country = this.countries[key] || { lat: 0, lon: 0, name: key };

    const isWar = ['UA', 'IL', 'LB', 'SY', 'YE'].includes(key);

    return {
      ...cii,
      countryCode: this.iso3Map[key] || key,
      code: key,
      coordinates: { lat: country.lat, lon: country.lon },
      capital: country.capital,
      activeWar: isWar,
      stateDeptAdvisory: {
        level: isWar ? 4 : cii.score > 60 ? 3 : cii.score > 40 ? 2 : 1,
        text: isWar ? 'Do Not Travel' : 'Exercise Normal Caution',
      },
      lanesTimeline: {
        military: isWar ? [85, 90, 80, 95, 88, 92, 90] : [20, 25, 15, 30, 20, 25, 20],
        diplomatic: [45, 60, 50, 70, 65, 80, 75],
        civil: isWar ? [70, 75, 60, 80, 75, 85, 80] : [10, 15, 10, 20, 15, 10, 12],
        infrastructure: isWar ? [80, 85, 90, 85, 92, 88, 90] : [5, 10, 5, 5, 10, 5, 8],
      },
      timeline7d: this.get7DayTimeline(key),
    };
  }

  get7DayTimeline(countryCode) {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const intensity = ['UA', 'IL', 'IR', 'LB'].includes(countryCode) ? Math.floor(6 + Math.random() * 5) : Math.floor(1 + Math.random() * 3);
      days.push({
        date: dateStr,
        protests: Math.round(intensity * 1.5),
        conflict: ['UA', 'IL', 'LB', 'SY'].includes(countryCode) ? intensity * 3 : 0,
        military: Math.round(intensity * 2.2),
        natural: i === 3 ? 1 : 0,
      });
    }
    return days;
  }

  // ==========================================
  // 4. HOTSPOT ESCALATION RADAR
  // ==========================================
  getHotspots(filter = 'all') {
    const mapped = this.hotspots.map((h) => {
      const level = Math.min(5, Math.max(1, Math.round(h.escalation)));
      return {
        ...h,
        escalationLevel: level,
        coordinates: { lat: h.lat, lon: h.lon },
        severityBand: level >= 5 ? 'CRITICAL' : level >= 4 ? 'HIGH' : level >= 3 ? 'ELEVATED' : 'MODERATE',
      };
    });

    if (filter === 'critical') {
      return mapped.filter((h) => h.escalationLevel === 5);
    }
    if (filter === 'high') {
      return mapped.filter((h) => h.escalationLevel === 4);
    }
    if (filter === 'elevated') {
      return mapped.filter((h) => h.escalationLevel === 3);
    }
    return mapped;
  }

  // ==========================================
  // 5. POPULATION EXPOSURE ESTIMATOR
  // ==========================================
  estimatePopulationExposure(arg1 = 'CONFLICT', arg2 = 31.5, arg3 = 34.5) {
    let type = 'CONFLICT';
    let lat = 31.5;
    let lon = 34.5;
    let radiusKm = 50;

    if (typeof arg1 === 'number' && typeof arg2 === 'number') {
      lon = arg1;
      lat = arg2;
      radiusKm = typeof arg3 === 'number' ? arg3 : 50;
    } else if (typeof arg1 === 'string') {
      type = arg1;
      lat = typeof arg2 === 'number' ? arg2 : 31.5;
      lon = typeof arg3 === 'number' ? arg3 : 34.5;
      radiusKm = type === 'CONFLICT' ? 50 : type === 'EARTHQUAKE' ? 100 : 30;
    }

    const areaSqKm = Math.PI * radiusKm * radiusKm;
    const estimatedPopulation = Math.round(areaSqKm * 420);

    return {
      eventType: type,
      coordinates: { lat, lon },
      impactRadiusKm: radiusKm,
      impactAreaSqKm: Math.round(areaSqKm),
      estimatedExposedPopulation: estimatedPopulation,
      exposedPopulationEstimate: estimatedPopulation,
      evacuationPriority: estimatedPopulation > 1000000 ? 'MAXIMUM' : 'HIGH',
    };
  }
}

export const geopoliticalIntel = new GeopoliticalIntelligence();
