import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupplyChainTwin } from './model.js';
import { DEMO_SUPPLY_CHAIN_RAW, DEMO_DISRUPTIONS } from './demoData.js';
import { calculateSupplyChainImpact } from './impactEngine.js';

test('dependency propagation traces upstream disruption down to exposed facilities and shipments', () => {
  const { twin } = createSupplyChainTwin(DEMO_SUPPLY_CHAIN_RAW);
  const cyclone = DEMO_DISRUPTIONS[0]; // Super Typhoon Gaemi in Taiwan Strait

  const impact = calculateSupplyChainImpact(cyclone, twin);

  // Directly exposed facilities: Port of Kaohsiung and Taoyuan Fab
  assert.ok(impact.affectedFacilities.length >= 1);
  const facilityIds = impact.affectedFacilities.map((af) => af.facility.id);
  assert.ok(facilityIds.includes('FAC-PRT-KAO') || facilityIds.includes('FAC-TAO'));

  // Intersecting route legs: Maritime Leg LEG-801-PRIMARY
  assert.ok(impact.affectedRouteLegs.length >= 1);
  const legIds = impact.affectedRouteLegs.map((al) => al.routeLeg.id);
  assert.ok(legIds.includes('LEG-801-PRIMARY'));

  // Affected shipments: SHP-801 carrying MCU-900
  assert.ok(impact.affectedShipments.length >= 1);
  const shipmentIds = impact.affectedShipments.map((as) => as.shipment.id);
  assert.ok(shipmentIds.includes('SHP-801'));
});

test('critical product inventory cover is verified to be under 5 days', () => {
  const { twin } = createSupplyChainTwin(DEMO_SUPPLY_CHAIN_RAW);
  const cyclone = DEMO_DISRUPTIONS[0];

  const impact = calculateSupplyChainImpact(cyclone, twin);

  // Assert that critical stockout count is detected
  assert.ok(impact.criticalStockoutCount >= 1, 'Must detect at least 1 critical stockout risk');

  // Verify specific critical product days of cover
  const lowCoverItem = impact.inventoryImpacts.find((inv) => inv.isBelowThreshold);
  assert.ok(lowCoverItem, 'Expected low-cover inventory item to be found');
  assert.equal(lowCoverItem.product.criticality, 'critical');
  assert.equal(lowCoverItem.product.id, 'PROD-MCU900');
  assert.ok(
    lowCoverItem.currentDaysOfCover < 5.0,
    `Critical product must have < 5.0 days cover; found ${lowCoverItem.currentDaysOfCover} days`
  );
  assert.equal(lowCoverItem.currentDaysOfCover, 3.2); // Exact demo value: (1100 - 300) / 250 = 3.2 days
});

test('dependency paths trace full graph from hazard through facility to warehouse stockout', () => {
  const { twin } = createSupplyChainTwin(DEMO_SUPPLY_CHAIN_RAW);
  const seismic = DEMO_DISRUPTIONS[1]; // M6.4 Kansai Seismic event near Kyoto

  const impact = calculateSupplyChainImpact(seismic, twin);

  assert.ok(impact.affectedFacilities.length >= 1);
  assert.equal(impact.affectedFacilities[0].facility.id, 'FAC-KYO');

  // Traced dependency path exists
  assert.ok(impact.dependencyPaths.length >= 1);
  const pathNodes = impact.dependencyPaths[0].nodes;
  assert.ok(pathNodes.some((n) => n.includes('Kyoto Advanced Semiconductor')));
  assert.ok(pathNodes.some((n) => n.includes('Apex Core MCU-900')));
});
