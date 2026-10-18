import test from 'node:test';
import assert from 'node:assert/strict';
import { EPISTEMIC_STATUS, normalizeFacility, normalizeShipment } from './model.js';
import { calculateSupplyChainImpact } from './impactEngine.js';

test('missing commercial values remain visibly UNKNOWN and are never fabricated', () => {
  const rawFacility = {
    id: 'FAC-TEST-01',
    name: 'Unspecified Partner Warehouse',
    type: 'warehouse',
    latitude: 33.7,
    longitude: -118.2,
    // owner and country omitted
  };

  const { record, errors } = normalizeFacility(rawFacility);
  assert.equal(errors.length, 0);
  assert.equal(record.owner, 'UNKNOWN');
  assert.equal(record.country, null);

  const rawShipment = {
    id: 'SHP-TEST-01',
    productId: 'PROD-1',
    // carrier and vesselReference omitted
  };
  const { record: shpRecord } = normalizeShipment(rawShipment);
  assert.equal(shpRecord.carrier, 'UNKNOWN');
  assert.equal(shpRecord.vesselReference, null);
});

test('epistemic status classifies facts, inferences, and simulations distinctly', () => {
  assert.equal(EPISTEMIC_STATUS.OBSERVED, 'OBSERVED');
  assert.equal(EPISTEMIC_STATUS.INFERRED, 'INFERRED');
  assert.equal(EPISTEMIC_STATUS.SIMULATED, 'SIMULATED');
  assert.equal(EPISTEMIC_STATUS.UNKNOWN, 'UNKNOWN');
  assert.equal(EPISTEMIC_STATUS.STALE, 'STALE');
});

test('missing commercial attributes penalize dataConfidence component score', () => {
  const completeTwin = {
    facilities: [
      { id: 'F1', name: 'Fac 1', type: 'warehouse', latitude: 20, longitude: 20, owner: 'Apex Corp', capacity: 1000 },
    ],
    suppliers: [],
    products: [{ id: 'P1', name: 'Prod 1', criticality: 'high' }],
    inventoryPositions: [],
    shipments: [
      { id: 'S1', productId: 'P1', carrier: 'Maersk Line', origin: 'F1', destination: 'F1' },
    ],
    routeLegs: [],
  };

  const incompleteTwin = {
    facilities: [
      { id: 'F1', name: 'Fac 1', type: 'warehouse', latitude: 20, longitude: 20, owner: 'UNKNOWN', capacity: null },
    ],
    suppliers: [],
    products: [{ id: 'P1', name: 'Prod 1', criticality: 'high' }],
    inventoryPositions: [],
    shipments: [
      { id: 'S1', productId: 'P1', carrier: 'UNKNOWN', origin: 'F1', destination: 'F1' },
    ],
    routeLegs: [],
  };

  const disruption = {
    id: 'D1',
    name: 'Test Disruption',
    source: 'TEST',
    latitude: 20,
    longitude: 20,
    radiusKm: 50,
    severity: 0.8,
    confidence: 0.95,
  };

  const impactComplete = calculateSupplyChainImpact(disruption, completeTwin);
  const impactIncomplete = calculateSupplyChainImpact(disruption, incompleteTwin);

  // Assert confidence degradation: incomplete data must have lower dataConfidence score
  assert.ok(
    impactIncomplete.scoringBreakdown.dataConfidence < impactComplete.scoringBreakdown.dataConfidence,
    `Expected confidence penalty for missing attributes: ${impactIncomplete.scoringBreakdown.dataConfidence} vs ${impactComplete.scoringBreakdown.dataConfidence}`
  );

  // Assert component scoring transparently discloses all 5 factors
  const breakdown = impactComplete.scoringBreakdown;
  assert.ok(breakdown.hazardSeverity > 0);
  assert.ok(breakdown.exposure > 0);
  assert.ok(breakdown.businessCriticality > 0);
  assert.ok(breakdown.recoveryDifficulty > 0);
  assert.ok(breakdown.dataConfidence > 0);
  assert.ok(breakdown.compositeScore >= 0 && breakdown.compositeScore <= 100);
});
