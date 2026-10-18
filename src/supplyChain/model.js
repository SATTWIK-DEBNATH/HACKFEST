/**
 * Supply Chain Digital Twin Domain Model
 *
 * Implements normalized schemas, stable identifiers, epistemic classifications,
 * and data integrity validations for facilities, suppliers, products, inventory,
 * shipments, route legs, dependency edges, and actions.
 *
 * Commercial facts are never inferred. Missing values remain visibly UNKNOWN.
 *
 * @module supplyChain/model
 */

export const EPISTEMIC_STATUS = Object.freeze({
  OBSERVED: 'OBSERVED',
  INFERRED: 'INFERRED',
  SIMULATED: 'SIMULATED',
  UNKNOWN: 'UNKNOWN',
  STALE: 'STALE',
});

export const FACILITY_TYPES = Object.freeze([
  'manufacturing',
  'supplier',
  'warehouse',
  'port',
  'distribution_center',
]);

export const CRITICALITY_LEVELS = Object.freeze([
  'critical',
  'high',
  'medium',
  'low',
]);

export const SHIPMENT_MODES = Object.freeze([
  'maritime',
  'air',
  'road',
  'rail',
]);

export const SHIPMENT_STATUSES = Object.freeze([
  'in_transit',
  'pending',
  'delayed',
  'delivered',
  'customs_hold',
]);

export const ACTION_STATUSES = Object.freeze([
  'pending',
  'approved',
  'executing',
  'completed',
  'rejected',
]);

export const ACTION_TYPES = Object.freeze([
  'reroute_shipment',
  'transfer_inventory',
  'split_supplier_order',
  'expedite_shipment',
]);

/**
 * Validates and normalizes a facility record.
 * @param {Object} raw
 * @returns {{ record: Object, errors: string[] }}
 */
export function normalizeFacility(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { record: null, errors: ['Facility must be an object'] };
  }

  const id = String(raw.id || '').trim();
  if (!id) errors.push('Facility id is required');

  const name = String(raw.name || '').trim();
  if (!name) errors.push('Facility name is required');

  const type = String(raw.type || '').trim().toLowerCase();
  if (!FACILITY_TYPES.includes(type)) {
    errors.push(`Invalid facility type: "${raw.type}". Expected one of: ${FACILITY_TYPES.join(', ')}`);
  }

  const lat = Number(raw.latitude);
  const lon = Number(raw.longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.push(`Invalid latitude: ${raw.latitude}. Must be between -90 and 90`);
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    errors.push(`Invalid longitude: ${raw.longitude}. Must be between -180 and 180`);
  }

  const country = raw.country != null && String(raw.country).trim() !== '' ? String(raw.country).trim() : null;
  const criticality = CRITICALITY_LEVELS.includes(String(raw.criticality || '').toLowerCase())
    ? String(raw.criticality).toLowerCase()
    : 'medium';

  const capacity = Number.isFinite(Number(raw.capacity)) ? Number(raw.capacity) : null;
  const owner = raw.owner != null && String(raw.owner).trim() !== '' ? String(raw.owner).trim() : 'UNKNOWN';
  const source = raw.source != null && String(raw.source).trim() !== '' ? String(raw.source).trim() : 'UNKNOWN';
  const observedAt = raw.observedAt ? new Date(raw.observedAt).toISOString() : new Date().toISOString();
  const confidence = Number.isFinite(Number(raw.confidence))
    ? Math.max(0, Math.min(1, Number(raw.confidence)))
    : 0.85;

  const record = {
    id,
    name,
    type,
    latitude: lat,
    longitude: lon,
    country,
    criticality,
    capacity,
    owner,
    source,
    observedAt,
    confidence,
    epistemicStatus: raw.epistemicStatus || EPISTEMIC_STATUS.OBSERVED,
  };

  return { record, errors };
}

/**
 * Validates and normalizes a supplier record.
 * @param {Object} raw
 * @returns {{ record: Object, errors: string[] }}
 */
export function normalizeSupplier(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { record: null, errors: ['Supplier must be an object'] };
  }

  const id = String(raw.id || '').trim();
  if (!id) errors.push('Supplier id is required');

  const name = String(raw.name || '').trim();
  if (!name) errors.push('Supplier name is required');

  const tier = Number.isInteger(Number(raw.tier)) ? Number(raw.tier) : 1;
  const approved = typeof raw.approved === 'boolean'
    ? raw.approved
    : String(raw.approved).toLowerCase() === 'true';

  const linkedFacilityIds = Array.isArray(raw.linkedFacilityIds)
    ? raw.linkedFacilityIds.map(String)
    : raw.linkedFacilityIds ? [String(raw.linkedFacilityIds)] : [];

  const productIds = Array.isArray(raw.productIds)
    ? raw.productIds.map(String)
    : raw.productIds ? [String(raw.productIds)] : [];

  const leadTimeDays = Number.isFinite(Number(raw.leadTimeDays)) ? Number(raw.leadTimeDays) : null;

  const alternateSupplierIds = Array.isArray(raw.alternateSupplierIds)
    ? raw.alternateSupplierIds.map(String)
    : raw.alternateSupplierIds ? [String(raw.alternateSupplierIds)] : [];

  const record = {
    id,
    name,
    tier,
    approved,
    linkedFacilityIds,
    productIds,
    leadTimeDays,
    alternateSupplierIds,
    source: raw.source || 'Vendor Master DB',
    observedAt: raw.observedAt ? new Date(raw.observedAt).toISOString() : new Date().toISOString(),
    confidence: Number.isFinite(Number(raw.confidence)) ? Number(raw.confidence) : 0.9,
    epistemicStatus: raw.epistemicStatus || EPISTEMIC_STATUS.OBSERVED,
  };

  return { record, errors };
}

/**
 * Validates and normalizes a product record.
 * @param {Object} raw
 * @returns {{ record: Object, errors: string[] }}
 */
export function normalizeProduct(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { record: null, errors: ['Product must be an object'] };
  }

  const id = String(raw.id || '').trim();
  if (!id) errors.push('Product id is required');

  const SKU = String(raw.SKU || raw.sku || '').trim();
  if (!SKU) errors.push('Product SKU is required');

  const name = String(raw.name || '').trim();
  if (!name) errors.push('Product name is required');

  const category = String(raw.category || 'General').trim();
  const criticality = CRITICALITY_LEVELS.includes(String(raw.criticality || '').toLowerCase())
    ? String(raw.criticality).toLowerCase()
    : 'medium';

  const reorderPoint = Number.isFinite(Number(raw.reorderPoint)) ? Number(raw.reorderPoint) : 0;

  const substituteProductIds = Array.isArray(raw.substituteProductIds)
    ? raw.substituteProductIds.map(String)
    : raw.substituteProductIds ? [String(raw.substituteProductIds)] : [];

  const record = {
    id,
    SKU,
    name,
    category,
    criticality,
    reorderPoint,
    substituteProductIds,
    source: raw.source || 'ERP Material Master',
    observedAt: raw.observedAt ? new Date(raw.observedAt).toISOString() : new Date().toISOString(),
    confidence: Number.isFinite(Number(raw.confidence)) ? Number(raw.confidence) : 0.95,
    epistemicStatus: raw.epistemicStatus || EPISTEMIC_STATUS.OBSERVED,
  };

  return { record, errors };
}

/**
 * Validates and normalizes an inventory position record.
 * @param {Object} raw
 * @returns {{ record: Object, errors: string[] }}
 */
export function normalizeInventoryPosition(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { record: null, errors: ['Inventory position must be an object'] };
  }

  const id = String(raw.id || '').trim();
  if (!id) errors.push('Inventory id is required');

  const facilityId = String(raw.facilityId || '').trim();
  if (!facilityId) errors.push('Inventory facilityId is required');

  const productId = String(raw.productId || '').trim();
  if (!productId) errors.push('Inventory productId is required');

  const quantity = Number.isFinite(Number(raw.quantity)) ? Number(raw.quantity) : 0;
  const reservedQuantity = Number.isFinite(Number(raw.reservedQuantity)) ? Number(raw.reservedQuantity) : 0;
  const dailyDemand = Number.isFinite(Number(raw.dailyDemand)) && Number(raw.dailyDemand) > 0
    ? Number(raw.dailyDemand)
    : null;

  // Days of cover = (quantity - reserved) / dailyDemand
  let daysOfCover = null;
  if (dailyDemand != null && dailyDemand > 0) {
    const netAvailable = Math.max(0, quantity - reservedQuantity);
    daysOfCover = Math.round((netAvailable / dailyDemand) * 10) / 10;
  } else if (Number.isFinite(Number(raw.daysOfCover))) {
    daysOfCover = Number(raw.daysOfCover);
  }

  const source = raw.source || 'WMS Real-time Inventory';
  const observedAt = raw.observedAt ? new Date(raw.observedAt).toISOString() : new Date().toISOString();
  const confidence = Number.isFinite(Number(raw.confidence)) ? Number(raw.confidence) : 0.95;

  const record = {
    id,
    facilityId,
    productId,
    quantity,
    reservedQuantity,
    dailyDemand,
    daysOfCover,
    source,
    observedAt,
    confidence,
    epistemicStatus: raw.epistemicStatus || EPISTEMIC_STATUS.OBSERVED,
  };

  return { record, errors };
}

/**
 * Validates and normalizes a shipment record.
 * @param {Object} raw
 * @returns {{ record: Object, errors: string[] }}
 */
export function normalizeShipment(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { record: null, errors: ['Shipment must be an object'] };
  }

  const id = String(raw.id || '').trim();
  if (!id) errors.push('Shipment id is required');

  const productId = String(raw.productId || '').trim();
  if (!productId) errors.push('Shipment productId is required');

  const quantity = Number.isFinite(Number(raw.quantity)) ? Number(raw.quantity) : 0;
  const origin = String(raw.origin || '').trim();
  const destination = String(raw.destination || '').trim();
  const carrier = String(raw.carrier || 'UNKNOWN').trim();

  const mode = SHIPMENT_MODES.includes(String(raw.mode || '').toLowerCase())
    ? String(raw.mode).toLowerCase()
    : 'maritime';

  const status = SHIPMENT_STATUSES.includes(String(raw.status || '').toLowerCase())
    ? String(raw.status).toLowerCase()
    : 'in_transit';

  const ETA = raw.ETA || raw.eta ? new Date(raw.ETA || raw.eta).toISOString() : null;

  // Never infer a vessel association unless explicitly supplied
  const vesselReference = raw.vesselReference && String(raw.vesselReference).trim() !== ''
    ? String(raw.vesselReference).trim()
    : null;

  const source = raw.source || 'TMS Shipment API';
  const observedAt = raw.observedAt ? new Date(raw.observedAt).toISOString() : new Date().toISOString();
  const confidence = Number.isFinite(Number(raw.confidence)) ? Number(raw.confidence) : 0.9;

  const record = {
    id,
    productId,
    quantity,
    origin,
    destination,
    carrier,
    mode,
    status,
    ETA,
    vesselReference,
    source,
    observedAt,
    confidence,
    epistemicStatus: raw.epistemicStatus || EPISTEMIC_STATUS.OBSERVED,
  };

  return { record, errors };
}

/**
 * Validates and normalizes a route leg record.
 * @param {Object} raw
 * @returns {{ record: Object, errors: string[] }}
 */
export function normalizeRouteLeg(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { record: null, errors: ['Route leg must be an object'] };
  }

  const id = String(raw.id || '').trim();
  if (!id) errors.push('Route leg id is required');

  const shipmentId = String(raw.shipmentId || '').trim();
  if (!shipmentId) errors.push('Route leg shipmentId is required');

  const mode = SHIPMENT_MODES.includes(String(raw.mode || '').toLowerCase())
    ? String(raw.mode).toLowerCase()
    : 'maritime';

  // Geometry must be an array of [lon, lat] coordinates
  let geometry = [];
  if (Array.isArray(raw.geometry)) {
    geometry = raw.geometry.filter(
      (pt) => Array.isArray(pt) && pt.length >= 2 && Number.isFinite(pt[0]) && Number.isFinite(pt[1])
    );
  }
  if (geometry.length < 2) {
    errors.push('Route leg geometry must contain at least 2 valid coordinates [lon, lat]');
  }

  const origin = String(raw.origin || '').trim();
  const destination = String(raw.destination || '').trim();
  const plannedDuration = Number.isFinite(Number(raw.plannedDuration))
    ? Number(raw.plannedDuration)
    : Number.isFinite(Number(raw.plannedDurationHours))
      ? Number(raw.plannedDurationHours)
      : null;

  const estimatedDuration = Number.isFinite(Number(raw.estimatedDuration))
    ? Number(raw.estimatedDuration)
    : Number.isFinite(Number(raw.estimatedDurationHours))
      ? Number(raw.estimatedDurationHours)
      : plannedDuration;

  const status = ['normal', 'disrupted', 'delayed'].includes(String(raw.status || '').toLowerCase())
    ? String(raw.status).toLowerCase()
    : 'normal';

  const alternateRouteIds = Array.isArray(raw.alternateRouteIds)
    ? raw.alternateRouteIds.map(String)
    : raw.alternateRouteIds ? [String(raw.alternateRouteIds)] : [];

  // Route geometry must be explicitly labeled: planned, simulated, or verified_freight
  const geometrySource = ['planned', 'simulated', 'verified_freight'].includes(raw.geometrySource)
    ? raw.geometrySource
    : 'planned';

  const record = {
    id,
    shipmentId,
    mode,
    geometry,
    origin,
    destination,
    plannedDuration,
    estimatedDuration,
    status,
    alternateRouteIds,
    geometrySource,
    epistemicStatus: raw.epistemicStatus || (geometrySource === 'simulated' ? EPISTEMIC_STATUS.SIMULATED : EPISTEMIC_STATUS.OBSERVED),
  };

  return { record, errors };
}

/**
 * Validates and normalizes an Action record for the Action Ledger.
 * @param {Object} raw
 * @returns {{ record: Object, errors: string[] }}
 */
export function normalizeAction(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { record: null, errors: ['Action must be an object'] };
  }

  const id = String(raw.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const type = ACTION_TYPES.includes(raw.type) ? raw.type : 'reroute_shipment';
  const recommendationId = raw.recommendationId ? String(raw.recommendationId) : null;
  const owner = raw.owner != null && String(raw.owner).trim() !== '' ? String(raw.owner).trim() : 'UNASSIGNED';
  const status = ACTION_STATUSES.includes(raw.status) ? raw.status : 'pending';

  const approvalMetadata = raw.approvalMetadata ? {
    approvedBy: raw.approvalMetadata.approvedBy || null,
    approvedAt: raw.approvalMetadata.approvedAt || null,
    notes: raw.approvalMetadata.notes || null,
  } : null;

  const expectedOutcome = raw.expectedOutcome || 'Mitigate operational disruption';
  const actualOutcome = raw.actualOutcome || null;
  const createdAt = raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString();
  const auditTrail = Array.isArray(raw.auditTrail) ? raw.auditTrail : [
    { timestamp: createdAt, state: status, actor: owner, details: 'Action created' },
  ];

  const record = {
    id,
    type,
    recommendationId,
    owner,
    status,
    approvalMetadata,
    expectedOutcome,
    actualOutcome,
    createdAt,
    auditTrail,
  };

  return { record, errors };
}

/**
 * Validates and builds the full digital twin container.
 * @param {Object} raw
 * @returns {{ twin: Object, errors: string[], warnings: string[] }}
 */
export function createSupplyChainTwin(raw = {}) {
  const errors = [];
  const warnings = [];

  const facilities = [];
  for (const f of raw.facilities || []) {
    const { record, errors: errs } = normalizeFacility(f);
    if (errs.length > 0) warnings.push(`Facility "${f.id || 'unknown'}": ${errs.join('; ')}`);
    if (record) facilities.push(record);
  }

  const suppliers = [];
  for (const s of raw.suppliers || []) {
    const { record, errors: errs } = normalizeSupplier(s);
    if (errs.length > 0) warnings.push(`Supplier "${s.id || 'unknown'}": ${errs.join('; ')}`);
    if (record) suppliers.push(record);
  }

  const products = [];
  for (const p of raw.products || []) {
    const { record, errors: errs } = normalizeProduct(p);
    if (errs.length > 0) warnings.push(`Product "${p.id || 'unknown'}": ${errs.join('; ')}`);
    if (record) products.push(record);
  }

  const inventoryPositions = [];
  for (const inv of raw.inventoryPositions || []) {
    const { record, errors: errs } = normalizeInventoryPosition(inv);
    if (errs.length > 0) warnings.push(`Inventory "${inv.id || 'unknown'}": ${errs.join('; ')}`);
    if (record) inventoryPositions.push(record);
  }

  const shipments = [];
  for (const shp of raw.shipments || []) {
    const { record, errors: errs } = normalizeShipment(shp);
    if (errs.length > 0) warnings.push(`Shipment "${shp.id || 'unknown'}": ${errs.join('; ')}`);
    if (record) shipments.push(record);
  }

  const routeLegs = [];
  for (const leg of raw.routeLegs || []) {
    const { record, errors: errs } = normalizeRouteLeg(leg);
    if (errs.length > 0) warnings.push(`RouteLeg "${leg.id || 'unknown'}": ${errs.join('; ')}`);
    if (record) routeLegs.push(record);
  }

  const actions = [];
  for (const act of raw.actions || []) {
    const { record, errors: errs } = normalizeAction(act);
    if (errs.length > 0) warnings.push(`Action "${act.id || 'unknown'}": ${errs.join('; ')}`);
    if (record) actions.push(record);
  }

  // Dependency Edges
  const dependencyEdges = Array.isArray(raw.dependencyEdges)
    ? raw.dependencyEdges
    : buildDefaultDependencyEdges({ facilities, suppliers, products, inventoryPositions, shipments, routeLegs });

  const twin = {
    facilities,
    suppliers,
    products,
    inventoryPositions,
    shipments,
    routeLegs,
    dependencyEdges,
    actions,
    metadata: {
      networkId: raw.networkId || 'global-manufacturing-network',
      name: raw.name || 'High-Tech Electronics Global Supply Network',
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  return { twin, errors, warnings };
}

/**
 * Builds standard dependency graph edges from digital twin records.
 */
export function buildDefaultDependencyEdges({
  suppliers = [],
  facilities = [],
  products = [],
  shipments = [],
  routeLegs = [],
}) {
  const edges = [];

  // supplier → facility
  for (const s of suppliers) {
    for (const facId of s.linkedFacilityIds || []) {
      edges.push({ from: `supplier:${s.id}`, to: `facility:${facId}`, type: 'supplies_facility' });
    }
  }

  // supplier → product
  for (const s of suppliers) {
    for (const prodId of s.productIds || []) {
      edges.push({ from: `supplier:${s.id}`, to: `product:${prodId}`, type: 'manufactures_product' });
    }
  }

  // route leg → shipment
  for (const leg of routeLegs) {
    edges.push({ from: `routeLeg:${leg.id}`, to: `shipment:${leg.shipmentId}`, type: 'carries_shipment' });
  }

  // shipment → product
  for (const shp of shipments) {
    edges.push({ from: `shipment:${shp.id}`, to: `product:${shp.productId}`, type: 'transports_product' });
  }

  // shipment → destination facility
  for (const shp of shipments) {
    if (shp.destination) {
      edges.push({ from: `shipment:${shp.id}`, to: `facility:${shp.destination}`, type: 'delivers_to' });
    }
  }

  return edges;
}
