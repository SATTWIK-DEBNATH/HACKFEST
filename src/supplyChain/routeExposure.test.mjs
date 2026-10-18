import test from 'node:test';
import assert from 'node:assert/strict';
import { routeIntersectsDisruption } from './spatialIndex.js';

test('routeIntersectsDisruption identifies when a route leg traverses a hazard zone', () => {
  // Maritime route passing through Taiwan Strait: [120.285, 22.616] -> [124.5, 24.2]
  const geometry = [
    [120.285, 22.616],
    [124.500, 24.200],
    [135.000, 31.000],
  ];

  // Disruption right in the strait
  const disruptionInStrait = {
    latitude: 22.8,
    longitude: 120.4,
    radiusKm: 150,
  };

  const result = routeIntersectsDisruption(geometry, disruptionInStrait);
  assert.equal(result.intersects, true);
  assert.ok(result.minDistanceKm <= 150);
  assert.equal(result.segmentIndex, 0);
});

test('routeIntersectsDisruption returns false when a route leg is safely outside hazard radius', () => {
  // Road leg in Germany: Munich to Rotterdam
  const geometry = [
    [11.576, 48.137],
    [9.180, 48.775],
    [4.477, 51.924],
  ];

  // Disruption in the Mediterranean (far away)
  const farDisruption = {
    latitude: 35.0,
    longitude: 25.0,
    radiusKm: 100,
  };

  const result = routeIntersectsDisruption(geometry, farDisruption);
  assert.equal(result.intersects, false);
  assert.ok(result.minDistanceKm > 1000);
});

test('routeIntersectsDisruption handles degenerate or single-point geometries safely', () => {
  const resultEmpty = routeIntersectsDisruption([], { latitude: 0, longitude: 0, radiusKm: 50 });
  assert.equal(resultEmpty.intersects, false);

  const resultSingle = routeIntersectsDisruption([[0, 0]], { latitude: 0, longitude: 0, radiusKm: 50 });
  assert.equal(resultSingle.intersects, false);
});
