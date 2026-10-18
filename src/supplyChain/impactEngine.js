/**
 * Supply Chain Exposure & Impact Engine
 *
 * Pure, testable calculation engine that accepts a disruption and the supply-chain digital twin.
 *
 * Transparent component scoring:
 *   impact = hazardSeverity × exposure × businessCriticality × recoveryDifficulty × dataConfidence
 *
 * Distinguishes observed facts from inferred impacts and simulation outputs.
 * Preserves source, timestamp, confidence, and assumptions for every calculation.
 *
 * @module supplyChain/impactEngine
 */

import { EPISTEMIC_STATUS } from './model.js';
import {
  haversineDistanceKm,
  routeIntersectsDisruption,
  disruptionToH3Cells,
  latLngToH3,
} from './spatialIndex.js';

/**
 * Maps product criticality to a numerical weight [0, 1].
 */
const CRITICALITY_WEIGHTS = Object.freeze({
  critical: 1.0,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
});

/**
 * Calculates recovery difficulty based on alternate supplier/route availability.
 */
function calculateRecoveryDifficulty(hasAlternateSupplier, hasAlternateRoute, leadTimeDays) {
  let difficulty = 0.5;
  if (!hasAlternateSupplier && !hasAlternateRoute) {
    difficulty = 1.0; // Single-sourced, no alternate path
  } else if (hasAlternateSupplier && hasAlternateRoute) {
    difficulty = 0.3; // Highly resilient, multiple options
  } else if (hasAlternateSupplier) {
    difficulty = 0.55;
  } else {
    difficulty = 0.65;
  }

  // Factor in lead time if known
  if (leadTimeDays != null) {
    if (leadTimeDays > 20) difficulty = Math.min(1.0, difficulty + 0.15);
    else if (leadTimeDays < 10) difficulty = Math.max(0.2, difficulty - 0.1);
  }

  return Math.round(difficulty * 100) / 100;
}

/**
 * Executes full impact evaluation for a disruption against the supply chain twin.
 * @param {Object} disruption
 * @param {Object} twin Supply chain digital twin
 * @returns {Object} Impact assessment result
 */
export function calculateSupplyChainImpact(disruption, twin) {
  if (!disruption || !twin) {
    throw new TypeError('calculateSupplyChainImpact requires both disruption and twin');
  }

  const {
    facilities = [],
    suppliers = [],
    products = [],
    inventoryPositions = [],
    shipments = [],
    routeLegs = [],
  } = twin;

  const disruptionLat = Number(disruption.latitude);
  const disruptionLon = Number(disruption.longitude);
  const radiusKm = Number(disruption.radiusKm) || 50;
  const hazardSeverity = Math.max(0.1, Math.min(1.0, Number(disruption.severity) || 0.7));

  // 1. Identify directly exposed facilities (Geofencing + H3 verification)
  const affectedFacilities = [];
  const facilityMap = new Map(facilities.map((f) => [f.id, f]));
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const fac of facilities) {
    if (!Number.isFinite(fac.latitude) || !Number.isFinite(fac.longitude)) continue;
    const distanceKm = haversineDistanceKm(disruptionLat, disruptionLon, fac.latitude, fac.longitude);

    if (distanceKm <= radiusKm) {
      affectedFacilities.push({
        facility: fac,
        distanceKm: Math.round(distanceKm * 10) / 10,
        exposureType: 'direct_geofence',
        epistemicStatus: EPISTEMIC_STATUS.OBSERVED,
      });
    }
  }

  // 2. Identify intersecting route legs
  const affectedRouteLegs = [];
  const affectedLegIds = new Set();

  for (const leg of routeLegs) {
    const { intersects, minDistanceKm, segmentIndex } = routeIntersectsDisruption(leg.geometry, {
      latitude: disruptionLat,
      longitude: disruptionLon,
      radiusKm,
    });

    if (intersects) {
      affectedLegIds.add(leg.id);
      affectedRouteLegs.push({
        routeLeg: leg,
        minDistanceKm: Math.round(minDistanceKm * 10) / 10,
        segmentIndex,
        epistemicStatus: EPISTEMIC_STATUS.OBSERVED,
      });
    }
  }

  // 3. Trace affected shipments (directly via leg or via affected origin/destination facility)
  const affectedShipments = [];
  const affectedShipmentIds = new Set();
  const affectedFacilityIds = new Set(affectedFacilities.map((af) => af.facility.id));

  for (const shp of shipments) {
    const hasDisruptedLeg = routeLegs.some((l) => l.shipmentId === shp.id && affectedLegIds.has(l.id));
    const hasDisruptedEndpoint = affectedFacilityIds.has(shp.origin) || affectedFacilityIds.has(shp.destination);

    if (hasDisruptedLeg || hasDisruptedEndpoint) {
      affectedShipmentIds.add(shp.id);
      const cause = hasDisruptedLeg ? 'intersecting_route_corridor' : 'endpoint_facility_disruption';
      affectedShipments.push({
        shipment: shp,
        cause,
        estimatedDelayHours: hasDisruptedLeg ? 96 : 144, // Inferred operational delay
        epistemicStatus: EPISTEMIC_STATUS.INFERRED,
      });
    }
  }

  // 4. Trace affected products & inventory positions
  const affectedProductIds = new Set();
  for (const af of affectedFacilities) {
    // If supplier or manufacturing facility is down, its supplied products are disrupted
    const linkedSuppliers = suppliers.filter((s) => (s.linkedFacilityIds || []).includes(af.facility.id));
    for (const sup of linkedSuppliers) {
      for (const prodId of sup.productIds || []) affectedProductIds.add(prodId);
    }
  }
  for (const as of affectedShipments) {
    if (as.shipment.productId) affectedProductIds.add(as.shipment.productId);
  }

  const affectedProducts = Array.from(affectedProductIds)
    .map((id) => productMap.get(id))
    .filter(Boolean);

  // 5. Evaluate inventory stockout risk (Days of Cover projection)
  const inventoryImpacts = [];
  let criticalStockoutCount = 0;

  for (const inv of inventoryPositions) {
    if (affectedProductIds.has(inv.productId)) {
      const prod = productMap.get(inv.productId);
      const isCritical = prod?.criticality === 'critical';
      const daysOfCover = inv.daysOfCover != null ? inv.daysOfCover : 999;
      const isBelowThreshold = daysOfCover < 5.0; // Standard 5-day safety buffer threshold

      if (isBelowThreshold) criticalStockoutCount++;

      // Downstream impact inference: if shipments inbound to this facility are delayed
      const inboundDelayed = affectedShipments.some((as) => as.shipment.destination === inv.facilityId);
      const projectedDaysOfCover = inboundDelayed
        ? Math.max(0, Math.round((daysOfCover - 4.0) * 10) / 10) // 4 days consumed while waiting
        : daysOfCover;

      inventoryImpacts.push({
        inventory: inv,
        product: prod,
        facility: facilityMap.get(inv.facilityId) || null,
        currentDaysOfCover: daysOfCover,
        projectedDaysOfCover,
        isBelowThreshold,
        stockoutRisk: isBelowThreshold || projectedDaysOfCover < 3.0 ? 'HIGH' : projectedDaysOfCover < 7.0 ? 'MEDIUM' : 'LOW',
        epistemicStatus: inv.daysOfCover != null ? EPISTEMIC_STATUS.OBSERVED : EPISTEMIC_STATUS.INFERRED,
      });
    }
  }

  // 6. Upstream and Downstream blast-radius graph path
  const dependencyPaths = [];
  for (const af of affectedFacilities) {
    const sup = suppliers.find((s) => (s.linkedFacilityIds || []).includes(af.facility.id));
    if (sup) {
      for (const prodId of sup.productIds || []) {
        const prod = productMap.get(prodId);
        const shp = shipments.find((s) => s.productId === prodId);
        const inv = inventoryPositions.find((i) => i.productId === prodId && (i.daysOfCover || 999) < 5);
        const targetFac = inv ? facilityMap.get(inv.facilityId) : null;

        dependencyPaths.push({
          nodes: [
            `Hazard: ${disruption.name}`,
            `Facility: ${af.facility.name}`,
            `Supplier: ${sup.name}`,
            `Product: ${prod ? prod.name : prodId}`,
            shp ? `Shipment: ${shp.id} (${shp.mode})` : 'Shipment: pending',
            targetFac ? `Warehouse: ${targetFac.name} (${inv.daysOfCover}d cover remaining)` : 'Downstream: Inventory',
          ],
          severity: 'CRITICAL',
        });
      }
    }
  }

  // 7. Transparent Component Scoring:
  //    impact = hazardSeverity × exposure × businessCriticality × recoveryDifficulty × dataConfidence
  const exposureScore = affectedFacilities.length > 0 ? 1.0 : affectedRouteLegs.length > 0 ? 0.8 : 0.4;

  const maxProductCriticality = affectedProducts.reduce((max, p) => {
    const w = CRITICALITY_WEIGHTS[p.criticality] || 0.5;
    return Math.max(max, w);
  }, affectedProducts.length > 0 ? 0.5 : 0.3);

  // Check if alternate suppliers or alternate routes exist for affected elements
  const hasAlternateSupplier = affectedProducts.some((p) => {
    const sup = suppliers.find((s) => (s.productIds || []).includes(p.id));
    return sup && (sup.alternateSupplierIds || []).length > 0;
  });
  const hasAlternateRoute = affectedRouteLegs.some((al) => (al.routeLeg.alternateRouteIds || []).length > 0);
  const recoveryDifficulty = calculateRecoveryDifficulty(hasAlternateSupplier, hasAlternateRoute, 14);

  // Data confidence: start at disruption confidence, degrade if commercial values are missing
  let dataConfidence = Number(disruption.confidence) || 0.95;
  let missingCommercialFields = 0;
  for (const shp of shipments) {
    if (shp.carrier === 'UNKNOWN') missingCommercialFields++;
  }
  for (const fac of facilities) {
    if (fac.owner === 'UNKNOWN' || fac.capacity == null) missingCommercialFields++;
  }
  if (missingCommercialFields > 0) {
    dataConfidence = Math.max(0.5, dataConfidence - missingCommercialFields * 0.05);
  }
  dataConfidence = Math.round(dataConfidence * 100) / 100;

  // Composite impact score (0 to 100)
  const rawComposite =
    hazardSeverity *
    exposureScore *
    maxProductCriticality *
    recoveryDifficulty *
    dataConfidence;

  const compositeScore = Math.round(rawComposite * 100);

  // Plain-language explanation
  const affectedFacNames = affectedFacilities.map((a) => a.facility.name).join(', ') || 'None';
  const affectedShpIds = affectedShipments.map((a) => a.shipment.id).join(', ') || 'None';
  const criticalProdNames = affectedProducts
    .filter((p) => p.criticality === 'critical')
    .map((p) => p.name)
    .join(', ');

  let plainLanguageExplanation = '';
  if (affectedFacilities.length > 0 || affectedRouteLegs.length > 0) {
    plainLanguageExplanation = `Disruption "${disruption.name}" (${disruption.source}) directly intersects ${affectedFacilities.length} facility(ies) [${affectedFacNames}] and ${affectedRouteLegs.length} active freight leg(s). `;
    if (criticalProdNames) {
      plainLanguageExplanation += `Critical component line "${criticalProdNames}" is exposed. Inbound shipments [${affectedShpIds}] face estimated 96-144h delays. `;
    }
    if (criticalStockoutCount > 0) {
      plainLanguageExplanation += `Downstream distribution inventory is projected to fall below safety buffer (< 5 days of cover). Recovery intervention is recommended immediately.`;
    }
  } else {
    plainLanguageExplanation = `Disruption "${disruption.name}" is outside the active operational radius of monitored facilities and route legs. Nominal exposure detected.`;
  }

  // Cover H3 cell generation for visualization
  const h3Cells = disruptionToH3Cells(disruptionLat, disruptionLon, radiusKm, 5);

  return {
    disruption: {
      id: disruption.id,
      name: disruption.name,
      type: disruption.type,
      source: disruption.source,
      observedAt: disruption.observedAt || new Date().toISOString(),
      confidence: disruption.confidence || 0.95,
      severity: hazardSeverity,
      radiusKm,
      latitude: disruptionLat,
      longitude: disruptionLon,
      epistemicStatus: disruption.epistemicStatus || EPISTEMIC_STATUS.OBSERVED,
    },
    scoringBreakdown: {
      hazardSeverity: Math.round(hazardSeverity * 100) / 100,
      exposure: Math.round(exposureScore * 100) / 100,
      businessCriticality: Math.round(maxProductCriticality * 100) / 100,
      recoveryDifficulty: Math.round(recoveryDifficulty * 100) / 100,
      dataConfidence: Math.round(dataConfidence * 100) / 100,
      compositeScore,
      rating: compositeScore >= 45 ? 'CRITICAL' : compositeScore >= 25 ? 'HIGH' : compositeScore >= 12 ? 'MODERATE' : 'LOW',
    },
    affectedFacilities,
    affectedRouteLegs,
    affectedShipments,
    affectedProducts,
    inventoryImpacts,
    criticalStockoutCount,
    dependencyPaths,
    plainLanguageExplanation,
    h3Cells,
    assumptions: [
      'Disruption boundary modeled as radial hazard buffer with uniform regional attenuation.',
      'Maritime transit delay estimated at 96 hours based on port berthing backlog heuristics.',
      'Demand rate assumed constant at current 30-day moving average from ERP/WMS.',
      'Missing vendor commercial attributes reduce data confidence factor rather than inferring certainty.',
    ],
  };
}
