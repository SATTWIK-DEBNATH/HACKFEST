import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupplyChainTwin } from './model.js';
import { DEMO_SUPPLY_CHAIN_RAW, DEMO_DISRUPTIONS } from './demoData.js';
import { calculateSupplyChainImpact } from './impactEngine.js';
import { simulateRecoveryScenarios } from './recoveryEngine.js';

test('simulateRecoveryScenarios generates all 4 recovery scenario archetypes with feasibility reasons', () => {
  const { twin } = createSupplyChainTwin(DEMO_SUPPLY_CHAIN_RAW);
  const cyclone = DEMO_DISRUPTIONS[0];
  const impact = calculateSupplyChainImpact(cyclone, twin);

  const { scenarios, recommendedScenario, comparisonSummary } = simulateRecoveryScenarios(impact, twin);

  assert.ok(scenarios.length >= 3, 'Must simulate at least 3 recovery scenarios');
  assert.equal(scenarios.length, 4);

  const types = scenarios.map((s) => s.type);
  assert.ok(types.includes('reroute_shipment'), 'Must support reroute shipment');
  assert.ok(types.includes('transfer_inventory'), 'Must support transfer inventory');
  assert.ok(types.includes('split_supplier_order'), 'Must support split supplier order');
  assert.ok(types.includes('expedite_shipment'), 'Must support expedite shipment');

  for (const scen of scenarios) {
    // Assert required fields for every scenario
    assert.ok(typeof scen.id === 'string' && scen.id.length > 0);
    assert.ok(typeof scen.name === 'string');
    assert.ok(typeof scen.description === 'string');
    assert.ok(typeof scen.expectedDelayDays === 'number');
    assert.ok(typeof scen.estimatedCostImpactUsd === 'number');
    assert.ok(typeof scen.inventoryDaysProtected === 'number');
    assert.ok(typeof scen.capacityConstraints === 'string');
    assert.ok(typeof scen.confidence === 'number' && scen.confidence > 0 && scen.confidence <= 1.0);
    assert.ok(Array.isArray(scen.operationalAssumptions) && scen.operationalAssumptions.length > 0);
    assert.ok(typeof scen.isFeasible === 'boolean');
    assert.ok(typeof scen.feasibilityReason === 'string' && scen.feasibilityReason.length > 0);

    // Carbon must be a finite number or null ("Not Available")
    assert.ok(scen.carbonEstimateKgCo2 === null || Number.isFinite(scen.carbonEstimateKgCo2));
    assert.ok(typeof scen.carbonLabel === 'string');

    // Route geometry must be explicitly labeled planned or simulated
    assert.ok(['planned', 'simulated', 'verified_freight'].includes(scen.geometrySource));
  }

  // Recommended scenario must be identified with visible trade-offs
  assert.ok(recommendedScenario);
  assert.ok(comparisonSummary.recommendationReason.length > 20);
});

test('carbon footprint displays "Not Available" when supplier energy data is unknown', () => {
  const { twin } = createSupplyChainTwin(DEMO_SUPPLY_CHAIN_RAW);
  const cyclone = DEMO_DISRUPTIONS[0];
  const impact = calculateSupplyChainImpact(cyclone, twin);
  const { scenarios } = simulateRecoveryScenarios(impact, twin);

  const splitScen = scenarios.find((s) => s.type === 'split_supplier_order');
  assert.ok(splitScen);
  assert.equal(splitScen.carbonEstimateKgCo2, null);
  assert.match(splitScen.carbonLabel, /Not Available/i);
});
