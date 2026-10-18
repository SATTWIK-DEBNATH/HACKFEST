import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCsvText,
  importFacilitiesFromCsv,
  importSupplyChainTwinFromJson,
} from './importExport.js';

test('parseCsvText detects headers, rows, and reports column count mismatches', () => {
  const validCsv =
`id,name,type,latitude,longitude
FAC-1,Test Warehouse,warehouse,30.5,-97.5
FAC-2,Test Port,port,22.6,120.2`;

  const parsed = parseCsvText(validCsv);
  assert.equal(parsed.errors.length, 0);
  assert.deepEqual(parsed.headers, ['id', 'name', 'type', 'latitude', 'longitude']);
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0].id, 'FAC-1');

  // Mismatched column count line
  const invalidCsv =
`id,name,type
FAC-1,Test
FAC-2,Test,warehouse,extra`;

  const parsedInvalid = parseCsvText(invalidCsv);
  assert.ok(parsedInvalid.errors.length > 0, 'Must record error for mismatched column count');
});

test('importFacilitiesFromCsv validates records and never silently discards invalid rows', () => {
  const csvWithBadRow =
`id,name,type,latitude,longitude,country
FAC-VALID,Valid DC,warehouse,34.0,-118.2,United States
FAC-INVALID,Bad Coordinates,warehouse,INVALID_LAT,999.0,United States
FAC-BAD-TYPE,Unknown Type,space_station,30.0,-90.0,United States`;

  const { facilities, errors } = importFacilitiesFromCsv(csvWithBadRow);

  // Valid record was imported
  assert.equal(facilities.length, 1);
  assert.equal(facilities[0].id, 'FAC-VALID');

  // Both invalid rows were reported with specific reasons, NOT silently discarded
  assert.equal(errors.length, 2);
  assert.ok(errors.some((e) => e.includes('FAC-INVALID') && e.includes('latitude')));
  assert.ok(errors.some((e) => e.includes('FAC-BAD-TYPE') && e.includes('facility type')));
});

test('importSupplyChainTwinFromJson normalizes valid digital twin payload', () => {
  const jsonPayload = {
    networkId: 'test-net',
    facilities: [
      { id: 'F1', name: 'Fac 1', type: 'port', latitude: 22.6, longitude: 120.2, criticality: 'high' },
    ],
    products: [
      { id: 'P1', SKU: 'SKU-01', name: 'Test Microchip', criticality: 'critical' },
    ],
  };

  const { twin, errors } = importSupplyChainTwinFromJson(jsonPayload);
  assert.equal(errors.length, 0);
  assert.equal(twin.facilities.length, 1);
  assert.equal(twin.products.length, 1);
  assert.equal(twin.facilities[0].type, 'port');
  assert.equal(twin.products[0].criticality, 'critical');
});

test('importSupplyChainTwinFromJson reports JSON syntax errors cleanly', () => {
  const malformedJson = '{ "facilities": [ incomplete json';
  const { twin, errors } = importSupplyChainTwinFromJson(malformedJson);
  assert.equal(twin, null);
  assert.ok(errors.length > 0);
  assert.match(errors[0], /JSON parse failure/i);
});
