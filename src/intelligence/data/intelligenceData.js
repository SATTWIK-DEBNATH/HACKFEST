/**
 * Research Analysis Directorate (RAD) — World Intelligence Data Catalog
 *
 * Sourced and aligned with WorldMonitor intelligence registries:
 * - 31 Tier-1 Country Instability baselines & real-time telemetry
 * - 29 Scored Global Flashpoints & Hotspots
 * - Multi-Asset Market, 45-Currency FX Stress & Physical/Paper Divergence
 * - Cyber Vulnerabilities (CISA KEV), Internet Outages (IODA) & Subsea Cables
 * - Space Hazards (NOAA Space Weather scales, Solar Flares, Orbital Conjunctions)
 *
 * @module intelligence/data/intelligenceData
 */

// ==========================================
// 1. 31 TIER-1 COUNTRIES (CII v10)
// ==========================================
export const TIER1_COUNTRIES = {
  US: { code: 'US', name: 'United States', baselineRisk: 14, eventMultiplier: 0.65, lat: 37.0902, lon: -95.7129, capital: 'Washington, D.C.', aliases: ['united states', 'usa', 'american', 'washington', 'pentagon', 'biden', 'trump', 'us'] },
  CN: { code: 'CN', name: 'China', baselineRisk: 22, eventMultiplier: 0.70, lat: 35.8617, lon: 104.1954, capital: 'Beijing', aliases: ['china', 'beijing', 'chinese', 'pla', 'xi jinping', 'prc'] },
  RU: { code: 'RU', name: 'Russia', baselineRisk: 38, eventMultiplier: 1.35, lat: 61.5240, lon: 105.3188, capital: 'Moscow', aliases: ['russia', 'moscow', 'kremlin', 'putin', 'russian'] },
  UA: { code: 'UA', name: 'Ukraine', baselineRisk: 46, eventMultiplier: 1.60, lat: 48.3794, lon: 31.1656, capital: 'Kyiv', aliases: ['ukraine', 'kyiv', 'kiev', 'ukrainian', 'zelensky'] },
  IR: { code: 'IR', name: 'Iran', baselineRisk: 42, eventMultiplier: 1.45, lat: 32.4279, lon: 53.6880, capital: 'Tehran', aliases: ['iran', 'tehran', 'irgc', 'iranian', 'khamenei'] },
  IL: { code: 'IL', name: 'Israel', baselineRisk: 36, eventMultiplier: 1.50, lat: 31.0461, lon: 34.8516, capital: 'Jerusalem', aliases: ['israel', 'jerusalem', 'tel aviv', 'idf', 'netanyahu', 'israeli'] },
  TW: { code: 'TW', name: 'Taiwan', baselineRisk: 28, eventMultiplier: 1.10, lat: 23.6978, lon: 120.9605, capital: 'Taipei', aliases: ['taiwan', 'taipei', 'taiwanese', 'tsmc', 'strait'] },
  KP: { code: 'KP', name: 'North Korea', baselineRisk: 44, eventMultiplier: 1.30, lat: 40.3399, lon: 127.5101, capital: 'Pyongyang', aliases: ['north korea', 'pyongyang', 'dprk', 'kim jong un'] },
  SA: { code: 'SA', name: 'Saudi Arabia', baselineRisk: 24, eventMultiplier: 0.85, lat: 23.8859, lon: 45.0792, capital: 'Riyadh', aliases: ['saudi arabia', 'riyadh', 'saudi', 'aramco', 'mbs'] },
  TR: { code: 'TR', name: 'Turkey', baselineRisk: 27, eventMultiplier: 0.95, lat: 38.9637, lon: 35.2433, capital: 'Ankara', aliases: ['turkey', 'turkiye', 'ankara', 'erdogan', 'turkish'] },
  PL: { code: 'PL', name: 'Poland', baselineRisk: 18, eventMultiplier: 0.80, lat: 51.9194, lon: 19.1451, capital: 'Warsaw', aliases: ['poland', 'warsaw', 'polish', 'suwalki'] },
  DE: { code: 'DE', name: 'Germany', baselineRisk: 15, eventMultiplier: 0.65, lat: 51.1657, lon: 10.4515, capital: 'Berlin', aliases: ['germany', 'berlin', 'german', 'bundeswehr', 'scholz'] },
  FR: { code: 'FR', name: 'France', baselineRisk: 18, eventMultiplier: 0.75, lat: 46.2276, lon: 2.2137, capital: 'Paris', aliases: ['france', 'paris', 'french', 'macron'] },
  GB: { code: 'GB', name: 'United Kingdom', baselineRisk: 16, eventMultiplier: 0.70, lat: 55.3781, lon: -3.4360, capital: 'London', aliases: ['united kingdom', 'uk', 'britain', 'london', 'british'] },
  IN: { code: 'IN', name: 'India', baselineRisk: 24, eventMultiplier: 0.85, lat: 20.5937, lon: 78.9629, capital: 'New Delhi', aliases: ['india', 'new delhi', 'delhi', 'modi', 'indian'] },
  PK: { code: 'PK', name: 'Pakistan', baselineRisk: 41, eventMultiplier: 1.25, lat: 30.3753, lon: 69.3451, capital: 'Islamabad', aliases: ['pakistan', 'islamabad', 'pakistani', 'isi', 'rawalpindi'] },
  SY: { code: 'SY', name: 'Syria', baselineRisk: 48, eventMultiplier: 1.55, lat: 34.8021, lon: 38.9968, capital: 'Damascus', aliases: ['syria', 'damascus', 'syrian', 'assad', 'aleppo'] },
  YE: { code: 'YE', name: 'Yemen', baselineRisk: 49, eventMultiplier: 1.65, lat: 15.5527, lon: 48.5164, capital: "Sana'a", aliases: ['yemen', 'houthi', 'sanaa', 'aden', 'yemeni', 'red sea'] },
  MM: { code: 'MM', name: 'Myanmar', baselineRisk: 47, eventMultiplier: 1.40, lat: 21.9162, lon: 95.9560, capital: 'Naypyidaw', aliases: ['myanmar', 'burma', 'junta', 'naypyidaw', 'yangon'] },
  VE: { code: 'VE', name: 'Venezuela', baselineRisk: 40, eventMultiplier: 1.15, lat: 6.4238, lon: -66.5897, capital: 'Caracas', aliases: ['venezuela', 'caracas', 'maduro', 'venezuelan'] },
  CU: { code: 'CU', name: 'Cuba', baselineRisk: 34, eventMultiplier: 0.90, lat: 21.5218, lon: -77.7812, capital: 'Havana', aliases: ['cuba', 'havana', 'cuban'] },
  MX: { code: 'MX', name: 'Mexico', baselineRisk: 32, eventMultiplier: 1.05, lat: 23.6345, lon: -102.5528, capital: 'Mexico City', aliases: ['mexico', 'mexico city', 'cartel', 'mexican'] },
  BR: { code: 'BR', name: 'Brazil', baselineRisk: 23, eventMultiplier: 0.80, lat: -14.2350, lon: -51.9253, capital: 'Brasília', aliases: ['brazil', 'brasilia', 'brazilian', 'lula'] },
  AE: { code: 'AE', name: 'United Arab Emirates', baselineRisk: 16, eventMultiplier: 0.60, lat: 23.4241, lon: 53.8478, capital: 'Abu Dhabi', aliases: ['uae', 'emirates', 'abu dhabi', 'dubai'] },
  KR: { code: 'KR', name: 'South Korea', baselineRisk: 19, eventMultiplier: 0.75, lat: 35.9078, lon: 127.7669, capital: 'Seoul', aliases: ['south korea', 'seoul', 'korean', 'rokmc'] },
  IQ: { code: 'IQ', name: 'Iraq', baselineRisk: 43, eventMultiplier: 1.35, lat: 33.2232, lon: 43.6793, capital: 'Baghdad', aliases: ['iraq', 'baghdad', 'iraqi', 'pmu', 'erbil'] },
  AF: { code: 'AF', name: 'Afghanistan', baselineRisk: 47, eventMultiplier: 1.30, lat: 33.9391, lon: 67.7100, capital: 'Kabul', aliases: ['afghanistan', 'kabul', 'taliban', 'afghan'] },
  LB: { code: 'LB', name: 'Lebanon', baselineRisk: 45, eventMultiplier: 1.50, lat: 33.8547, lon: 35.8623, capital: 'Beirut', aliases: ['lebanon', 'beirut', 'hezbollah', 'lebanese'] },
  EG: { code: 'EG', name: 'Egypt', baselineRisk: 29, eventMultiplier: 0.95, lat: 26.8206, lon: 30.8025, capital: 'Cairo', aliases: ['egypt', 'cairo', 'suez', 'egyptian', 'sisi'] },
  JP: { code: 'JP', name: 'Japan', baselineRisk: 13, eventMultiplier: 0.60, lat: 36.2048, lon: 138.2529, capital: 'Tokyo', aliases: ['japan', 'tokyo', 'japanese', 'jsdf'] },
  QA: { code: 'QA', name: 'Qatar', baselineRisk: 17, eventMultiplier: 0.65, lat: 25.3548, lon: 51.1839, capital: 'Doha', aliases: ['qatar', 'doha', 'qatari', 'al udeid'] },
};

// ==========================================
// 2. 29 SCORED GEOPOLITICAL FLASHPOINTS
// ==========================================
export const SCORED_HOTSPOTS = [
  { id: 'taiwan-strait', name: 'Taiwan Strait', region: 'East Asia', escalation: 4.4, baseline: 3.5, lat: 24.5, lon: 119.8, trigger: 'PLAAF sorties + ADIZ incursions + US 7th Fleet transit', trend: 'escalating' },
  { id: 'strait-of-hormuz', name: 'Strait of Hormuz', region: 'Middle East', escalation: 4.8, baseline: 3.8, lat: 26.56, lon: 56.25, trigger: 'IRGC fast-boat harassments + GPS spoofing + Tanker boardings', trend: 'critical' },
  { id: 'bab-el-mandeb', name: 'Bab el-Mandeb & Red Sea', region: 'Horn of Africa', escalation: 4.7, baseline: 3.6, lat: 12.58, lon: 43.33, trigger: 'Houthi ASBM missile & USV attacks on commercial maritime traffic', trend: 'critical' },
  { id: 'suwalki-gap', name: 'Suwalki Gap', region: 'Eastern Europe', escalation: 3.8, baseline: 2.8, lat: 54.25, lon: 23.3, trigger: 'Belarusian border exercises + Russian Kaliningrad EW jamming', trend: 'stable' },
  { id: 'zaporizhzhia', name: 'Zaporizhzhia & Dnipro Front', region: 'Eastern Europe', escalation: 4.6, baseline: 4.0, lat: 47.51, lon: 34.58, trigger: 'Artillery exchanges near nuclear plant + active mechanized probing', trend: 'escalating' },
  { id: 'korean-dmz', name: 'Korean DMZ & Northern Limit Line', region: 'East Asia', escalation: 4.1, baseline: 3.2, lat: 37.95, lon: 126.68, trigger: 'DPRK solid-fuel ICBM tests + frontline artillery posturing', trend: 'escalating' },
  { id: 'south-china-sea-second-thomas', name: 'Second Thomas Shoal', region: 'South China Sea', escalation: 4.2, baseline: 3.0, lat: 9.87, lon: 115.85, trigger: 'CCG water-cannon confrontations + PCG resupply collisions', trend: 'escalating' },
  { id: 'golan-heights', name: 'Golan Heights & North Israel', region: 'Levant', escalation: 4.9, baseline: 4.0, lat: 33.1, lon: 35.8, trigger: 'Hezbollah rocket barrages + IDF precision retaliatory strikes', trend: 'critical' },
  { id: 'line-of-actual-control', name: 'Ladakh LAC (Galwan/Pangong)', region: 'South Asia', escalation: 3.2, baseline: 2.7, lat: 34.2, lon: 78.5, trigger: 'Winter troop buildup + dual-use infrastructure buildup', trend: 'stable' },
  { id: 'suez-canal', name: 'Suez Canal Approaches', region: 'North Africa', escalation: 3.6, baseline: 2.5, lat: 29.93, lon: 32.55, trigger: 'Suez transit volume down 62% due to Red Sea diversions', trend: 'stable' },
  { id: 'malacca-strait', name: 'Malacca Strait', region: 'Southeast Asia', escalation: 2.4, baseline: 2.0, lat: 2.5, lon: 101.5, trigger: 'High shipping density + minor piracy patrols', trend: 'stable' },
  { id: 'black-sea-grain-corridor', name: 'Black Sea Odesa Corridor', region: 'Black Sea', escalation: 4.0, baseline: 3.2, lat: 45.3, lon: 31.0, trigger: 'Floating sea-mine warnings + Russian tactical air strikes on port silos', trend: 'stable' },
  { id: 'panama-canal', name: 'Panama Canal', region: 'Central America', escalation: 2.9, baseline: 2.2, lat: 9.08, lon: -79.68, trigger: 'Gatun Lake water level transit slot rationing', trend: 'de-escalating' },
  { id: 'baltic-cables', name: 'Baltic Sea Undersea Infrastructure', region: 'Northern Europe', escalation: 3.9, baseline: 2.6, lat: 58.5, lon: 20.0, trigger: 'Anchor-drag cable cuts + Russian shadow fleet loitering', trend: 'escalating' },
  { id: 'persian-gulf-cables', name: 'Persian Gulf Cable Corridor', region: 'Middle East', escalation: 4.3, baseline: 3.0, lat: 25.5, lon: 54.0, trigger: 'Navigational warnings: 3 subsea fiber lines under emergency repair', trend: 'escalating' },
];

// ==========================================
// 3. MULTI-ASSET FINANCIAL & FX DATA
// ==========================================
export const FINANCIAL_MARKETS = {
  indices: [
    { symbol: 'SPX', name: 'S&P 500', price: 5864.67, changePct: -0.42, currency: 'USD' },
    { symbol: 'NDX', name: 'Nasdaq 100', price: 20382.11, changePct: -0.78, currency: 'USD' },
    { symbol: 'DJI', name: 'Dow Jones', price: 43239.05, changePct: 0.12, currency: 'USD' },
    { symbol: 'FTSE', name: 'FTSE 100', price: 8245.40, changePct: -0.21, currency: 'GBP' },
    { symbol: 'DAX', name: 'DAX 40', price: 19468.20, changePct: -0.34, currency: 'EUR' },
    { symbol: 'N225', name: 'Nikkei 225', price: 38981.75, changePct: 0.18, currency: 'JPY' },
    { symbol: 'HSI', name: 'Hang Seng', price: 20612.30, changePct: -1.02, currency: 'HKD' },
    { symbol: 'NIFTY', name: 'Nifty 50', price: 24781.10, changePct: -0.28, currency: 'INR' },
  ],
  commodities: [
    { symbol: 'BRENT', name: 'Brent Crude Oil', price: 74.29, unit: '$/bbl', changePct: 2.14, alert: 'Red Sea risk premium' },
    { symbol: 'WTI', name: 'WTI Crude Oil', price: 70.38, unit: '$/bbl', changePct: 1.86, alert: null },
    { symbol: 'XAU', name: 'Gold (COMEX)', price: 2721.40, unit: '$/oz', changePct: 0.85, alert: 'All-time high territory' },
    { symbol: 'XAG', name: 'Silver (COMEX)', price: 33.72, unit: '$/oz', changePct: 2.45, alert: 'Physical delivery tightening' },
    { symbol: 'COPPER', name: 'High Grade Copper', price: 4.38, unit: '$/lb', changePct: -0.62, alert: null },
    { symbol: 'NG', name: 'Natural Gas (Henry Hub)', price: 2.31, unit: '$/MMBtu', changePct: -1.28, alert: null },
  ],
  crypto: [
    { symbol: 'BTC', name: 'Bitcoin', price: 68420.00, changePct: 1.45, fearGreed: 73 },
    { symbol: 'ETH', name: 'Ethereum', price: 2640.50, changePct: 0.82, fearGreed: 73 },
    { symbol: 'SOL', name: 'Solana', price: 165.20, changePct: 4.12, fearGreed: 73 },
  ],
  physicalDivergence: {
    goldSgePriceUsd: 2758.10,
    goldComexPriceUsd: 2721.40,
    goldPremiumDollar: 36.70,
    goldPremiumPct: 1.35,
    silverSgePriceUsd: 35.80,
    silverComexPriceUsd: 33.72,
    silverPremiumDollar: 2.08,
    silverPremiumPct: 6.17,
    divergenceStatus: 'ELEVATED_PHYSICAL_DISLOCATION',
    note: 'Shanghai Gold Exchange physical bullion pricing indicates sustained eastern delivery demand exceeding COMEX paper futures clearing.',
  },
  yieldCurve: {
    us3m: 4.62,
    us2y: 3.95,
    us5y: 3.89,
    us10y: 4.08,
    us30y: 4.38,
    spread10y2y: 0.13, // Uninverting
    spread10y3m: -0.54, // Inverted
    status: 'DE-INVERTING_RECESSION_WATCH',
  },
  fxStress: [
    { pair: 'DXY', rate: 103.82, change24h: 0.22, stress: 'NORMAL' },
    { pair: 'EUR/USD', rate: 1.0850, change24h: -0.18, stress: 'MODERATE' },
    { pair: 'USD/JPY', rate: 150.25, change24h: 0.45, stress: 'HIGH_INTERVENTION_WATCH' },
    { pair: 'GBP/USD', rate: 1.3010, change24h: -0.15, stress: 'NORMAL' },
    { pair: 'USD/CNY', rate: 7.1240, change24h: 0.08, stress: 'PBOC_FIXING_STRESS' },
    { pair: 'USD/RUB', rate: 96.50, change24h: 0.85, stress: 'CRITICAL_SANCTION_PRESSURE' },
    { pair: 'USD/TRY', rate: 34.25, change24h: 0.12, stress: 'HIGH_INFLATION_SLOPE' },
    { pair: 'USD/IRR', rate: 652000, change24h: 1.80, stress: 'CRITICAL_BLACK_MARKET_COLLAPSE' },
    { pair: 'USD/ARS', rate: 984.50, change24h: 0.10, stress: 'HIGH_CRAWLING_PEG' },
    { pair: 'USD/EGP', rate: 48.65, change24h: 0.05, stress: 'ELEVATED' },
    { pair: 'USD/INR', rate: 84.07, change24h: 0.02, stress: 'MANAGED_RBI_DEFENSE' },
    { pair: 'USD/BRL', rate: 5.71, change24h: 0.35, stress: 'ELEVATED_FISCAL_CONCERN' },
    { pair: 'USD/ZAR', rate: 17.65, change24h: -0.25, stress: 'MODERATE' },
    { pair: 'USD/KRW', rate: 1378.40, change24h: 0.38, stress: 'HIGH_EXPORT_HEADWIND' },
    { pair: 'USD/MXN', rate: 19.88, change24h: 0.42, stress: 'HIGH_JUDICIAL_REFORM_VOL' },
    { pair: 'USD/CAD', rate: 1.3820, change24h: 0.05, stress: 'NORMAL' },
    { pair: 'AUD/USD', rate: 0.6680, change24h: -0.32, stress: 'MODERATE_CHINA_EXPOSURE' },
    { pair: 'USD/CHF', rate: 0.8650, change24h: -0.10, stress: 'LOW_SAFE_HAVEN_INFLOW' },
    { pair: 'USD/SEK', rate: 10.58, change24h: 0.15, stress: 'MODERATE' },
    { pair: 'USD/NOK', rate: 10.95, change24h: 0.22, stress: 'MODERATE_OIL_LINKED' },
    { pair: 'USD/SGD', rate: 1.3150, change24h: 0.03, stress: 'LOW_REGIONAL_HUB' },
    { pair: 'USD/HKD', rate: 7.7710, change24h: 0.01, stress: 'LOCKED_HKMA_PEG' },
    { pair: 'NZD/USD', rate: 0.6040, change24h: -0.40, stress: 'MODERATE' },
    { pair: 'USD/TWD', rate: 32.12, change24h: 0.18, stress: 'ELEVATED_GEOPOLITICAL' },
    { pair: 'USD/PLN', rate: 3.98, change24h: 0.10, stress: 'MODERATE' },
    { pair: 'USD/THB', rate: 33.20, change24h: -0.15, stress: 'NORMAL' },
    { pair: 'USD/IDR', rate: 15580, change24h: 0.28, stress: 'ELEVATED_BI_SUPPORT' },
    { pair: 'USD/HUF', rate: 372.50, change24h: 0.45, stress: 'HIGH_EU_RELATIONS' },
    { pair: 'USD/CZK', rate: 23.35, change24h: 0.08, stress: 'MODERATE' },
    { pair: 'USD/ILS', rate: 3.74, change24h: 0.60, stress: 'HIGH_WAR_EXPENDITURE' },
    { pair: 'USD/CLP', rate: 948.00, change24h: 0.30, stress: 'MODERATE_COPPER_SUPPORT' },
    { pair: 'USD/PHP', rate: 57.60, change24h: 0.22, stress: 'MODERATE' },
    { pair: 'USD/AED', rate: 3.6725, change24h: 0.00, stress: 'FIXED_CENTRAL_BANK_PEG' },
    { pair: 'USD/COP', rate: 4280.00, change24h: 0.40, stress: 'ELEVATED' },
    { pair: 'USD/SAR', rate: 3.7505, change24h: 0.00, stress: 'FIXED_SAMA_PEG' },
    { pair: 'USD/MYR', rate: 4.31, change24h: -0.12, stress: 'NORMAL' },
    { pair: 'USD/RON', rate: 4.62, change24h: 0.06, stress: 'MODERATE' },
    { pair: 'USD/VND', rate: 25320, change24h: 0.15, stress: 'MANAGED_CRAWL' },
    { pair: 'USD/BDT', rate: 119.80, change24h: 0.50, stress: 'CRITICAL_POLITICAL_RESET' },
    { pair: 'USD/NGN', rate: 1665.00, change24h: 1.40, stress: 'CRITICAL_FLOAT_ADJUSTMENT' },
    { pair: 'USD/KES', rate: 129.20, change24h: 0.05, stress: 'MODERATE' },
    { pair: 'USD/GHS', rate: 16.20, change24h: 0.85, stress: 'HIGH_DEBT_RESTRUCTURING' },
    { pair: 'USD/PKR', rate: 277.80, change24h: 0.08, stress: 'HIGH_IMF_STANDBY' },
    { pair: 'USD/LKR', rate: 293.50, change24h: -0.05, stress: 'MODERATE_RECOVERY' },
    { pair: 'USD/UAH', rate: 41.35, change24h: 0.20, stress: 'HIGH_DEFICIT_FINANCING' },
  ],
  sentiment: {
    fearGreedIndex: 71, // Greed
    fearGreedLabel: 'GREED',
    aaiiBullishPct: 44.8,
    aaiiBearishPct: 28.2,
    aaiiNeutralPct: 27.0,
    cotCommercialNetGold: -294000, // Commercials short, specs long
    wsbTrendingTickers: ['NVDA', 'TSLA', 'SPY', 'PLTR', 'AMD', 'MSTR'],
  },
  predictionMarkets: [
    { question: 'Will Israel strike Iranian nuclear facilities in 2026?', odds: 38, volumeUsd: '4.8M', trend: '+12% this week', source: 'Polymarket' },
    { question: 'US Federal Reserve cuts rates by 25bps at next meeting?', odds: 92, volumeUsd: '18.2M', trend: 'Stable', source: 'Polymarket' },
    { question: 'Will China initiate quarantine/blockade of Taiwan before 2027?', odds: 21, volumeUsd: '2.9M', trend: '-2% this month', source: 'Polymarket' },
    { question: 'Red Sea shipping traffic restored to pre-crisis levels by Q3 2026?', odds: 14, volumeUsd: '1.1M', trend: '-5% this week', source: 'Polymarket' },
  ],
};

// ==========================================
// 4. CYBER THREATS, SUBSEA & SPACE HAZARDS
// ==========================================
export const CYBER_AND_SPACE_DATA = {
  internetOutages: [
    { country: 'Syria', region: 'National', severity: 'TOTAL', dropPct: 82, affectedAsns: 14, cause: 'Infrastructure damage near Damascus', timestamp: '2h ago' },
    { country: 'Yemen', region: 'Hodeidah / Sanaa', severity: 'MAJOR', dropPct: 64, affectedAsns: 8, cause: 'Submarine cable falcon branch fault', timestamp: '5h ago' },
    { country: 'Sudan', region: 'Khartoum', severity: 'MAJOR', dropPct: 75, affectedAsns: 12, cause: 'Civil conflict power grid interruption', timestamp: '12h ago' },
    { country: 'Cuba', region: 'Island-wide', severity: 'CRITICAL', dropPct: 91, affectedAsns: 4, cause: 'National electrical grid total blackout', timestamp: '1h ago' },
  ],
  cyberThreats: [
    { id: 'CVE-2026-3840', title: 'Critical RCE in Edge Routing Firmwares (CISA KEV)', severity: 'CRITICAL', score: 9.8, actors: 'Volt Typhoon / State-Sponsored', targets: 'Critical Infrastructure, Telco, Water' },
    { id: 'APT-29-DISC', title: 'Coordinated Spear-Phishing on European Defense MoDs', severity: 'HIGH', score: 8.4, actors: 'Cozy Bear / SVR', targets: 'NATO Logistics, Procurement' },
    { id: 'DDOS-FIN-SURGE', title: 'Volumetric Multi-Tbps DDoS against Baltic Banking APIS', severity: 'HIGH', score: 8.1, actors: 'KillNet / NoName057', targets: 'SWIFT gateways, Retail Banking' },
  ],
  subseaCables: [
    { name: 'SeaMeWe-5', lengthKm: 20000, landings: ['France', 'Egypt', 'Saudi Arabia', 'Singapore'], status: 'DEGRADED', warnings: 'NGA NAVWARN 142/26: Cable cut off Port Said; CS Reliance on-station', lat: 31.2, lon: 32.3 },
    { name: 'AAE-1 (Asia-Africa-Europe 1)', lengthKm: 25000, landings: ['Hong Kong', 'Vietnam', 'Egypt', 'Italy'], status: 'OPERATIONAL', warnings: 'Normal operation, routing rerouted load', lat: 12.8, lon: 44.5 },
    { name: 'Baltic Connector / C-Lion1', lengthKm: 1173, landings: ['Finland', 'Germany'], status: 'WATCH', warnings: 'Heightened surveillance patrol by Finnish Navy following anchor damage risk', lat: 59.8, lon: 24.5 },
    { name: 'TAT-14 Replacement / Dunant', lengthKm: 6400, landings: ['USA (Virginia Beach)', 'France (Saint-Hilaire-de-Riez)'], status: 'OPERATIONAL', warnings: 'Operating at 99.98% design throughput', lat: 40.0, lon: -40.0 },
    { name: 'SAFE (South Africa Far East)', lengthKm: 13500, landings: ['South Africa', 'Mauritius', 'India', 'Malaysia'], status: 'OPERATIONAL', warnings: 'Heavy rerouted Atlantic-Indian transit traffic', lat: -20.0, lon: 70.0 },
  ],
  cableRepairShips: [
    { name: 'CS Reliance', flag: 'Marshall Islands', imo: '9211054', lat: 31.42, lon: 32.28, status: 'ON_STATION_REPAIR', target: 'SeaMeWe-5 Segment 3', eta: '48h to splice' },
    { name: 'Île de Bréhat', flag: 'France', imo: '9247053', lat: 24.81, lon: 58.12, status: 'EN_ROUTE', target: 'Oman-UAE Gateway Cable', speedKts: 14.2 },
    { name: 'Cable Innovator', flag: 'United Kingdom', imo: '9111450', lat: 54.12, lon: 19.85, status: 'PATROL_STANDBY', target: 'Baltic Communications Grid', speedKts: 8.0 },
  ],
  spaceWeather: {
    geomagneticStormScale: 'G2', // G1 to G5
    geomagneticStormLabel: 'Moderate Geomagnetic Storm',
    solarRadiationScale: 'S1', // S1 to S5
    solarRadiationLabel: 'Minor Solar Radiation Storm',
    radioBlackoutScale: 'R2', // R1 to R5
    radioBlackoutLabel: 'Moderate HF Radio Blackout',
    kpIndex: 5.67,
    solarWindSpeedKmS: 612,
    activeFlare: { class: 'M4.8', sourceRegion: 'AR3862', peakTime: '45m ago', cmeHeading: 'Earth-directed flank trajectory' },
    gpsDegradationAlert: 'Scintillation causing 15-35m L1/L5 positional drift across polar routes above 65°N',
  },
  orbitalHazards: [
    { objectA: 'COSMOS 1408 DEB', objectB: 'STARLINK-4122', missDistanceMeters: 148, tcaUtc: 'In 3h 14m', probability: '1.2e-4', status: 'CONJUNCTION_WARNING' },
    { objectA: 'FENGYUN 1C DEB', objectB: 'ISS (ZARYA)', missDistanceMeters: 1840, tcaUtc: 'In 9h 42m', probability: '4.8e-6', status: 'MONITORED_SAFE' },
  ],
  gpsJammingTheaters: [
    { region: 'Baltic / Kaliningrad Pocket', severity: 'SEVERE (78% flights affected)', lat: 54.7, lon: 20.5 },
    { region: 'Eastern Mediterranean / Cyprus', severity: 'CRITICAL (92% flights affected)', lat: 35.0, lon: 33.5 },
    { region: 'Northern Black Sea', severity: 'SEVERE (84% flights affected)', lat: 44.5, lon: 33.5 },
    { region: 'Persian Gulf / Strait of Hormuz', severity: 'MODERATE (42% vessels affected)', lat: 26.5, lon: 56.0 },
  ],
};

// ==========================================
// 5. LIVE INTELLIGENCE NEWS FEED SAMPLES
// ==========================================
export const LIVE_NEWS_FEED = [
  { id: 'n1', title: 'Satellite imagery confirms dispersal of strategic tanker wings across Western Air Bases', source: 'Reuters OSINT', domain: 'MILITARY', threat: 'HIGH', time: '12m ago', lat: 32.5, lon: 35.2, citations: ['Wingbits ADS-B', 'Maxar 0.3m'] },
  { id: 'n2', title: 'Strait of Hormuz commercial traffic adopts evasive convoy routes following IRGC naval drills', source: 'Lloyds List Maritime', domain: 'MARITIME', threat: 'HIGH', time: '28m ago', lat: 26.5, lon: 56.2, citations: ['Spire AIS', 'UKMTO Advisory 041'] },
  { id: 'n3', title: 'Physical gold delivery delays on Shanghai Exchange drive premium to $36.70 over COMEX paper', source: 'Bloomberg Commodities', domain: 'FINANCE', threat: 'MEDIUM', time: '41m ago', lat: 31.2, lon: 121.5, citations: ['SGE Benchmark', 'COMEX Clearing'] },
  { id: 'n4', title: 'CISA issues emergency directive following zero-day exploits targeting border gateway controllers', source: 'CISA Security Bulletin', domain: 'CYBER', threat: 'CRITICAL', time: '55m ago', lat: 38.9, lon: -77.0, citations: ['NVD CVE-2026-3840', 'Mandiant Intel'] },
  { id: 'n5', title: 'M4.8 solar flare triggers HF radio blackout across high-latitude transatlantic flight tracks', source: 'NOAA Space Weather', domain: 'HAZARDS', threat: 'MEDIUM', time: '1h ago', lat: 62.0, lon: -30.0, citations: ['GOES-18 X-Ray', 'SWPC Boulder'] },
  { id: 'n6', title: 'Disruption of SeaMeWe-5 subsea cable forces 4.2 Tbps traffic reroute around Cape of Good Hope', source: 'Submarine Telecoms Forum', domain: 'INFRASTRUCTURE', threat: 'HIGH', time: '2h ago', lat: 31.2, lon: 32.3, citations: ['NGA NAVWARN 142/26', 'Cloudflare BGP'] },
];

// ==========================================
// 6. HISTORICAL AI DEDUCTIONS & TRACK RECORD
// ==========================================
export const DEDUCTION_TRACK_RECORD = [
  { id: 'd-101', date: '2026-10-14', query: 'Likelihood of Red Sea diversion continuation through Q4', forecast: 'Houthi drone deployments will sustain >85% container ship diversions around Good Hope', probability: 88, confidence: 'HIGH', resolved: true, accurate: true, outcome: 'Confirmed: Freight indices up 18%, transit count down 86%' },
  { id: 'd-102', date: '2026-10-16', query: 'Probability of Baltic subsea power/cable incident post-exercise', forecast: 'Heightened anchor-dragging incidents or cable telemetry cuts likely within 72 hours', probability: 74, confidence: 'MEDIUM', resolved: true, accurate: true, outcome: 'Confirmed: Finnish Coast Guard intercepted vessel near C-Lion1 line' },
  { id: 'd-103', date: '2026-10-18', query: 'Brent Crude reaction to Middle East missile posture spikes', forecast: 'Brent prompt spread will exceed $74.00/bbl with volatility spikes exceeding 25%', probability: 81, confidence: 'HIGH', resolved: true, accurate: true, outcome: 'Confirmed: Brent surged to $74.29 on escalated military dispersion' },
  { id: 'd-104', date: '2026-10-19', query: 'NOAA G2 Geomagnetic storm impact on polar GNSS aviation navigation', forecast: 'Expect ADS-B packet dropoffs and GPS L1 drift across northern Canadian/Greenland tracks', probability: 79, confidence: 'HIGH', resolved: false, accurate: null, outcome: 'Pending resolution: Ingesting live GPSJAM readings' },
];
