/**
 * Isolated H3 Spatial-Indexing & Geometric Engine
 *
 * Provides discrete global grid indexing, spatial hazard containment,
 * route intersection tests, and aggregated disruption heatmaps using h3-js.
 *
 * @module supplyChain/spatialIndex
 */

import * as h3 from 'h3-js';

const EARTH_RADIUS_KM = 6371.0088;

/**
 * Calculates Great Circle / Haversine distance in kilometers between two points.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in kilometers
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Computes minimum distance from a point to a line segment in kilometers.
 * @param {[number, number]} p [lon, lat]
 * @param {[number, number]} a [lon, lat]
 * @param {[number, number]} b [lon, lat]
 * @returns {number} Distance in kilometers
 */
export function pointToSegmentDistanceKm(p, a, b) {
  const pLon = p[0], pLat = p[1];
  const aLon = a[0], aLat = a[1];
  const bLon = b[0], bLat = b[1];

  const segDist = haversineDistanceKm(aLat, aLon, bLat, bLon);
  if (segDist === 0) return haversineDistanceKm(pLat, pLon, aLat, aLon);

  // Approximate projection on equirectangular plane
  const x = (pLon - aLon) * Math.cos(((aLat + bLat) * Math.PI) / 360);
  const y = pLat - aLat;
  const dx = (bLon - aLon) * Math.cos(((aLat + bLat) * Math.PI) / 360);
  const dy = bLat - aLat;

  const t = Math.max(0, Math.min(1, (x * dx + y * dy) / (dx * dx + dy * dy)));
  const projLat = aLat + t * (bLat - aLat);
  const projLon = aLon + t * (bLon - aLon);

  return haversineDistanceKm(pLat, pLon, projLat, projLon);
}

/**
 * Checks if a polyline route leg intersects a disruption circle.
 * @param {Array<[number, number]>} geometry Array of [lon, lat]
 * @param {{ latitude: number, longitude: number, radiusKm: number }} disruption
 * @returns {{ intersects: boolean, minDistanceKm: number, segmentIndex: number }}
 */
export function routeIntersectsDisruption(geometry, disruption) {
  if (!Array.isArray(geometry) || geometry.length < 2) {
    return { intersects: false, minDistanceKm: Infinity, segmentIndex: -1 };
  }

  let minDistanceKm = Infinity;
  let closestSegment = -1;

  for (let i = 0; i < geometry.length - 1; i++) {
    const p1 = geometry[i];
    const p2 = geometry[i + 1];
    const dist = pointToSegmentDistanceKm(
      [disruption.longitude, disruption.latitude],
      p1,
      p2
    );

    if (dist < minDistanceKm) {
      minDistanceKm = dist;
      closestSegment = i;
    }
  }

  const intersects = minDistanceKm <= disruption.radiusKm;
  return { intersects, minDistanceKm, segmentIndex: closestSegment };
}

/**
 * Converts a lat/lng to an H3 index.
 * @param {number} lat
 * @param {number} lon
 * @param {number} resolution (0-15, default 6)
 * @returns {string} H3 cell index string
 */
export function latLngToH3(lat, lon, resolution = 6) {
  return h3.latLngToCell(lat, lon, resolution);
}

/**
 * Converts a disruption circle to a set of covering H3 cells.
 * @param {number} lat
 * @param {number} lon
 * @param {number} radiusKm
 * @param {number} resolution (default 5)
 * @returns {string[]} Array of H3 cell indexes
 */
export function disruptionToH3Cells(lat, lon, radiusKm, resolution = 5) {
  const centerCell = h3.latLngToCell(lat, lon, resolution);
  // Average edge length for H3 resolution 5 is ~8.5km; radius in cells approx:
  const approxCellRadiusKm = resolution === 4 ? 22 : resolution === 5 ? 8.5 : resolution === 6 ? 3.2 : 1.2;
  const kRingSize = Math.max(1, Math.min(15, Math.ceil(radiusKm / approxCellRadiusKm)));
  return h3.gridDisk(centerCell, kRingSize);
}

/**
 * Converts an H3 cell index to GeoJSON polygon coordinates [[lon, lat], ...].
 * @param {string} cell
 * @returns {Array<[number, number]>}
 */
export function h3CellToCoordinates(cell) {
  const boundary = h3.cellToBoundary(cell);
  // cellToBoundary returns [[lat, lng], ...]; convert to [lon, lat]
  return boundary.map(([lat, lng]) => [lng, lat]);
}

/**
 * Builds an in-memory spatial index of facilities.
 * @param {Array<Object>} facilities
 * @param {number} resolution
 * @returns {Map<string, Array<Object>>} Map of H3 cell -> facilities in that cell
 */
export function buildFacilitySpatialIndex(facilities = [], resolution = 5) {
  const index = new Map();
  for (const fac of facilities) {
    if (Number.isFinite(fac.latitude) && Number.isFinite(fac.longitude)) {
      const cell = h3.latLngToCell(fac.latitude, fac.longitude, resolution);
      if (!index.has(cell)) index.set(cell, []);
      index.get(cell).push(fac);
    }
  }
  return index;
}

/**
 * Generates an aggregated multi-hazard H3 heatmap.
 * @param {Array<Object>} disruptions
 * @param {number} resolution
 * @returns {Array<{ cell: string, intensity: number, coordinates: Array<[number, number]> }>}
 */
export function generateHazardHeatmap(disruptions = [], resolution = 4) {
  const cellScores = new Map();

  for (const d of disruptions) {
    if (!Number.isFinite(d.latitude) || !Number.isFinite(d.longitude)) continue;
    const cells = disruptionToH3Cells(d.latitude, d.longitude, d.radiusKm || 50, resolution);
    const weight = Number(d.severity) || 0.5;

    for (const cell of cells) {
      const prev = cellScores.get(cell) || 0;
      cellScores.set(cell, Math.min(1.0, prev + weight * 0.4));
    }
  }

  const result = [];
  for (const [cell, intensity] of cellScores.entries()) {
    result.push({
      cell,
      intensity: Math.round(intensity * 100) / 100,
      coordinates: h3CellToCoordinates(cell),
    });
  }

  return result;
}
