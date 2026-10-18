import test from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineDistanceKm,
  pointToSegmentDistanceKm,
  latLngToH3,
  disruptionToH3Cells,
  h3CellToCoordinates,
  buildFacilitySpatialIndex,
  generateHazardHeatmap,
} from './spatialIndex.js';

test('haversineDistanceKm measures real-world surface distance accurately', () => {
  // Distance from Kaohsiung (22.616, 120.285) to Taoyuan (24.993, 121.301) is ~280 km
  const dist = haversineDistanceKm(22.616, 120.285, 24.993, 121.301);
  assert.ok(dist > 270 && dist < 290, `Expected ~280km, received ${dist}km`);

  // Same point distance must be 0
  assert.equal(haversineDistanceKm(34.985, 135.758, 34.985, 135.758), 0);
});

test('pointToSegmentDistanceKm calculates perpendicular distance to line segment', () => {
  // Segment along equator from [0, 0] to [10, 0]
  // Point at [5, 1] (1 degree north of midpoint, ~111km)
  const dist = pointToSegmentDistanceKm([5, 1], [0, 0], [10, 0]);
  assert.ok(dist > 105 && dist < 115, `Expected ~111km, received ${dist}km`);

  // Point before start of segment clamps to point A
  const distBefore = pointToSegmentDistanceKm([-2, 0], [0, 0], [10, 0]);
  const directA = haversineDistanceKm(0, -2, 0, 0);
  assert.ok(Math.abs(distBefore - directA) < 1);
});

test('latLngToH3 indexes coordinates into valid H3 discrete global grid cells', () => {
  const cell = latLngToH3(34.985, 135.758, 6);
  assert.equal(typeof cell, 'string');
  assert.ok(cell.length >= 15, `Expected H3 hex string, got ${cell}`);

  const coords = h3CellToCoordinates(cell);
  assert.ok(Array.isArray(coords) && coords.length >= 6, 'H3 cell boundary must be a hexagon');
});

test('disruptionToH3Cells produces spatial coverage for a hazard zone', () => {
  const cells = disruptionToH3Cells(22.8, 120.4, 150, 5);
  assert.ok(Array.isArray(cells));
  assert.ok(cells.length > 10, `Expected multi-cell disk, got ${cells.length} cells`);
});

test('buildFacilitySpatialIndex indexes facilities and enables O(1) cell lookup', () => {
  const facilities = [
    { id: 'FAC-1', latitude: 34.985, longitude: 135.758 },
    { id: 'FAC-2', latitude: 35.443, longitude: 139.638 },
  ];
  const index = buildFacilitySpatialIndex(facilities, 5);
  const cell1 = latLngToH3(34.985, 135.758, 5);
  assert.ok(index.has(cell1));
  assert.equal(index.get(cell1)[0].id, 'FAC-1');
});

test('generateHazardHeatmap aggregates multi-hazard intensities into grid cells', () => {
  const disruptions = [
    { latitude: 22.8, longitude: 120.4, radiusKm: 100, severity: 0.8 },
    { latitude: 23.0, longitude: 120.5, radiusKm: 80, severity: 0.7 },
  ];
  const heatmap = generateHazardHeatmap(disruptions, 4);
  assert.ok(Array.isArray(heatmap));
  assert.ok(heatmap.length > 0);
  assert.ok(heatmap[0].intensity > 0 && heatmap[0].intensity <= 1.0);
  assert.ok(Array.isArray(heatmap[0].coordinates));
});
