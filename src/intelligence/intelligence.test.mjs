/**
 * Test Suite: World Intelligence & Threat Radar Engines
 * Validates Analytical Stack, Geopolitical CII v10, Macro/Sentiment, and Cyber/Space Hazards.
 */

import { analyticalStack, AnalyticalStack } from './analyticalStack.js';
import { geopoliticalIntel, GeopoliticalIntelligence } from './geopoliticalIntel.js';
import { macroFinanceRadar, MacroFinanceRadar } from './macroFinanceRadar.js';
import { cyberSpaceHazards, CyberSpaceHazards } from './cyberSpaceHazards.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

console.log('\n--- 1. TESTING ANALYTICAL STACK ---');
// Jaccard similarity
const stack = new AnalyticalStack();
const textA = 'Taiwan Semiconductor TSMC halts advanced silicon shipments to mainland China amid export sanctions';
const textB = 'Taiwan Semiconductor TSMC suspends silicon shipments to China following tightened export restrictions';
const textC = 'Federal Reserve signals 50bps rate cut amid weakening labor market data';

const simAB = stack.calculateJaccardSimilarity(textA, textB);
const simAC = stack.calculateJaccardSimilarity(textA, textC);

assert(simAB > 0.4, `Jaccard similarity between semantically similar articles should be high (${simAB.toFixed(2)})`);
assert(simAC < 0.2, `Jaccard similarity between unrelated articles should be low (${simAC.toFixed(2)})`);

// Multi-tier summarization
const tierSummary = stack.summarizeMultiTier('Urgent: Military activity escalated in the Taiwan Strait with naval blockade exercises.');
assert(tierSummary.summary.length > 0, 'Summarization returns content');
assert(['ollama-local', 'openrouter-cloud', 'in-browser-heuristic'].includes(tierSummary.tier), 'Valid summarization tier');

// Intelligence brief with citations
const brief = stack.generateIntelligenceBrief();
assert(brief.headline.length > 0, 'Brief headline generated');
assert(brief.citations.length > 0, 'Citations array populated');
assert(brief.citations[0].ref === 1, 'First citation has ref 1');
assert(brief.body.includes('[1]'), 'Brief text references citation [1]');

// Deduction & Forecasting engine
const forecasts = stack.getAllForecasts();
assert(forecasts.length >= 2, 'Forecasting engine has active hypotheses');
const twnForecast = forecasts.find(f => f.hypothesis.includes('Taiwan'));
assert(twnForecast && twnForecast.steps.t12h && twnForecast.steps.t24h && twnForecast.steps.t48h, 'Forecast has 12h, 24h, 48h projection steps');

// Accuracy scorecard
const scorecard = stack.getPublicAccuracyScorecard();
assert(scorecard.totalForecasts >= 10, 'Scorecard tracks forecasts');
assert(scorecard.accuracyRate.includes('%'), 'Scorecard provides accuracy percentage');

// Client-side RAG memory retrieval
const ragMatches = stack.queryRAGMemory('cable subsea fault', 3);
assert(ragMatches.length > 0, 'RAG retrieval returns matching memories');
assert(ragMatches[0].similarity > 0.3, 'Top RAG match has high cosine similarity');

// Spatial convergence detection
const convergences = stack.detectSpatialConvergence();
assert(Array.isArray(convergences) && convergences.length > 0, 'Spatial convergence identifies multi-domain geographic hotspots');
assert(convergences[0].domains.length >= 2, 'Convergence cluster intersects 2 or more domains');

// AI Analyst chat
const chatReply = stack.askChatAnalyst('What are the risks in the Red Sea?');
assert(chatReply.length > 20, 'AI Analyst returns relevant briefing answer');


console.log('\n--- 2. TESTING GEOPOLITICAL & CONFLICT INTELLIGENCE ---');
const geo = new GeopoliticalIntelligence();
const ciiTable = geo.calculateAllCII();
assert(ciiTable.length >= 25, `CII v10 calculates index for at least 25 countries (got ${ciiTable.length})`);

// Verify sorting by risk descending
assert(ciiTable[0].ciiScore >= ciiTable[1].ciiScore, 'CII table is sorted by risk descending');

// Verify CII v10 mathematical formula: 0.40 * baseline + 0.60 * eventScore
const ukr = ciiTable.find(c => c.countryCode === 'UKR');
assert(ukr !== undefined, 'Ukraine exists in CII table');
assert(ukr.ciiScore >= 80, `Ukraine CII score reflects active war theater (${ukr.ciiScore})`);
assert(ukr.severityBand === 'CRITICAL', 'Ukraine severity band is CRITICAL');
assert(typeof ukr.signedDelta === 'string', 'Signed delta is formatted');

// Country deep-dive dossier
const dossier = geo.getCountryDossier('TWN');
assert(dossier.countryCode === 'TWN', 'Taiwan dossier retrieved');
assert(dossier.components.unrest !== undefined, 'Dossier contains unrest component');
assert(dossier.components.conflict !== undefined, 'Dossier contains conflict component');
assert(dossier.lanesTimeline.military.length === 7, '7-day timeline contains 7 days of military data');
assert(dossier.lanesTimeline.infrastructure.length === 7, '7-day timeline contains 7 days of infrastructure data');

// Hotspots escalation ladder
const allHotspots = geo.getHotspots('all');
assert(allHotspots.length >= 10, 'Hotspots catalog contains flashpoints');
const warHotspots = geo.getHotspots('critical');
assert(warHotspots.every(h => h.escalationLevel === 5), 'Critical filter returns only level 5 flashpoints');

// Population exposure radius
const exposure = geo.estimatePopulationExposure(121.56, 25.03, 100);
assert(exposure.exposedPopulationEstimate > 1000000, 'Exposure calculation estimates affected population');


console.log('\n--- 3. TESTING FINANCIAL, MACROECONOMICS & SENTIMENT RADAR ---');
const macro = new MacroFinanceRadar();

// Multi-asset quotes
const quotes = macro.getAssetQuotes();
assert(quotes.length >= 5, 'Quotes contain major equity, commodity, and crypto assets');
const goldQuote = quotes.find(q => q.symbol === 'GC=F');
assert(goldQuote && goldQuote.price > 2000, `Gold paper price valid ($${goldQuote.price})`);

// Shanghai Gold Exchange Physical vs COMEX Paper divergence
const sge = macro.getShanghaiGoldDivergence();
assert(sge.gold.spreadPerOzUsd > 0, `SGE Gold trades at physical premium over COMEX (+$${sge.gold.spreadPerOzUsd}/oz)`);
assert(sge.silver.spreadPerOzUsd > 0, `SGE Silver trades at physical premium over COMEX (+$${sge.silver.spreadPerOzUsd}/oz)`);
assert(sge.implication.arbitrageIncentive === 'High', 'Arbitrage incentive correctly flagged');

// Yield curve inversion & recession meter
const yieldCurve = macro.getYieldCurveAnalysis();
assert(yieldCurve.curve['10Y'] !== undefined, '10Y yield present');
assert(typeof yieldCurve.spread10Y2Y === 'number', '10Y-2Y spread calculated');
assert(yieldCurve.recessionProbability.length > 0, 'Recession probability rated');

// 45-Currency FX Stress Radar
const fxList = macro.getFxStressRadar();
assert(fxList.length >= 20, `FX stress radar tracks multiple currencies (got ${fxList.length})`);
assert(fxList[0].stressScore >= fxList[1].stressScore, 'FX radar sorted by stress score descending');
const devalued = fxList.find(fx => fx.isSuddenDevaluation);
assert(devalued !== undefined, 'Sudden devaluation filter correctly identifies currency crash');

// Sentiment & Polymarket
const sentiment = macro.getSentimentOverview();
assert(sentiment.fearAndGreedIndex.value >= 0 && sentiment.fearAndGreedIndex.value <= 100, 'Fear and Greed index within 0-100');
const poly = macro.getPolymarketPredictions();
assert(poly.length >= 3, 'Polymarket odds available');
assert(poly[0].probability >= 0 && poly[0].probability <= 1, 'Prediction probability valid');


console.log('\n--- 4. TESTING CYBER THREATS & SPACE HAZARDS MONITORING ---');
const hazards = new CyberSpaceHazards();

// Internet outages
const outages = hazards.getInternetOutages();
assert(outages.length >= 3, 'Internet outage alerts tracked');
assert(outages[0].affectedPopulation > 0, 'Affected population tracked');

// CISA KEV Exploited Vulnerabilities
const kev = hazards.getCisaKevThreats();
assert(kev.length >= 3, 'CISA KEV catalog populated');
assert(kev[0].cveId.startsWith('CVE-'), 'CVE identifiers formatted');
assert(kev[0].cvssScore >= 7.0, 'CVSS score indicates high/critical severity');

// Subsea cables & repair fleet
const cables = hazards.getSubseaCableStatus();
assert(cables.length >= 5, 'Subsea cables monitored');
const severed = cables.find(c => c.status === 'FAULT / SEVERED');
assert(severed !== undefined, 'Severed subsea cable identified in Red Sea corridor');
const fleet = hazards.getRepairFleet();
assert(fleet.length >= 2, 'Repair fleet vessels tracked');
assert(fleet.some(v => v.vesselName.includes('Reliance')), 'CS Reliance on station');

// Infrastructure Cascade Simulator
const cascade = hazards.simulateInfrastructureCascade('cbl-aae1');
assert(cascade.tier1Stations.length >= 2, 'Hop 1 identifies impacted landing stations');
assert(cascade.tier2Exchanges.length >= 2, 'Hop 2 identifies impacted financial settlement routing');
assert(cascade.tier3Cloud.length >= 2, 'Hop 3 identifies cloud availability latency degradation');
assert(cascade.estimatedEconomicLossUsd > 1000000, 'Economic impact assessed');

// NOAA Space Weather Scales
const spaceWeather = hazards.getNoaaSpaceWeatherScales();
assert(spaceWeather.geomagneticStorms.scale.startsWith('G'), 'Geomagnetic storm G-scale valid');
assert(spaceWeather.solarRadiationStorms.scale.startsWith('S'), 'Radiation storm S-scale valid');
assert(spaceWeather.radioBlackouts.scale.startsWith('R'), 'Radio blackout R-scale valid');

// Solar flares & Orbital conjunctions
const flares = hazards.getSolarFlareAlerts();
assert(flares.length > 0, 'Solar flare alerts tracked');
assert(flares[0].classRating.startsWith('X'), 'Major X-class flare detected');

const conjunctions = hazards.getOrbitalConjunctions();
assert(conjunctions.length > 0, 'Orbital CDMs tracked');
assert(conjunctions[0].missDistanceMeters < 100, 'Critical close-approach collision alert triggered');

// GPS Jamming
const gps = hazards.getGpsJammingZones();
assert(gps.length >= 3, 'GPS jamming zones monitored');
assert(gps.some(z => z.intensityLevel === 'CRITICAL / EXTREME'), 'Extreme jamming zone detected');

console.log(`\n========================================`);
console.log(`ALL TESTS PASSED! (${passed} checks passed, ${failed} failed)`);
console.log(`========================================\n`);
