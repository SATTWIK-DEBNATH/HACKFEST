/**
 * GS1 EPCIS 2.0-Compatible Event Model & Adapter Interface
 *
 * Implements standard EPCIS 2.0 event concepts:
 * - WHAT: epcList, parentId, quantityList, item/asset identification
 * - WHEN: eventTime, recordTime, eventTimeZoneOffset
 * - WHERE: readPoint, bizLocation (GLN/SGLN URIs)
 * - WHY: bizStep, disposition (Standard CBV URIs)
 * - HOW: sensorElementList, sensorReport (temperature, humidity, shock)
 * - PROVENANCE: sourceSystem, ingestTime, confidence, accessClassification
 *
 * Provides a clean adapter boundary for OpenEPCIS / GS1 repositories.
 *
 * @module supplyChain/epcis
 */

export const EPCIS_EVENT_TYPES = Object.freeze([
  'ObjectEvent',
  'AggregationEvent',
  'TransactionEvent',
  'TransformationEvent',
  'SensorEvent',
  'DisruptionEvent',
]);

export const CBV_BIZ_STEPS = Object.freeze({
  SHIPPING: 'urn:epcglobal:cbv:bizstep:shipping',
  RECEIVING: 'urn:epcglobal:cbv:bizstep:receiving',
  PACKING: 'urn:epcglobal:cbv:bizstep:packing',
  UNPACKING: 'urn:epcglobal:cbv:bizstep:unpacking',
  HOLDING: 'urn:epcglobal:cbv:bizstep:holding',
  INSPECTING: 'urn:epcglobal:cbv:bizstep:inspecting',
  STOCK_TAKING: 'urn:epcglobal:cbv:bizstep:stock_taking',
  TRANSPORTING: 'urn:epcglobal:cbv:bizstep:transporting',
  DISRUPTED: 'urn:epcglobal:cbv:bizstep:disrupted',
});

export const CBV_DISPOSITIONS = Object.freeze({
  IN_TRANSIT: 'urn:epcglobal:cbv:disp:in_transit',
  ACTIVE: 'urn:epcglobal:cbv:disp:active',
  IN_PROGRESS: 'urn:epcglobal:cbv:disp:in_progress',
  DAMAGED: 'urn:epcglobal:cbv:disp:damaged',
  EXPIRED: 'urn:epcglobal:cbv:disp:expired',
  HELD: 'urn:epcglobal:cbv:disp:held',
  DISRUPTED: 'urn:epcglobal:cbv:disp:disrupted',
  DELAYED: 'urn:epcglobal:cbv:disp:delayed',
  AVAILABLE: 'urn:epcglobal:cbv:disp:available',
});

export const ACCESS_CLASSIFICATIONS = Object.freeze([
  'PUBLIC',
  'INTERNAL',
  'RESTRICTED_PARTNER',
  'HIGHLY_CONFIDENTIAL',
]);

/**
 * Validates and normalizes an EPCIS 2.0 Event Payload.
 * @param {Object} raw
 * @returns {{ event: Object, errors: string[] }}
 */
export function validateAndNormalizeEpcisEvent(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object') {
    return { event: null, errors: ['EPCIS Event must be an object'] };
  }

  const eventType = raw.type || raw.eventType || 'ObjectEvent';
  if (!EPCIS_EVENT_TYPES.includes(eventType)) {
    errors.push(`Invalid EPCIS eventType "${eventType}". Expected one of: ${EPCIS_EVENT_TYPES.join(', ')}`);
  }

  const eventID = String(raw.eventID || raw.id || `urn:uuid:${cryptoRandomUuid()}`);

  // WHEN
  const rawTime = raw.eventTime || raw.when || new Date().toISOString();
  const eventDate = new Date(rawTime);
  if (isNaN(eventDate.getTime())) {
    errors.push(`Invalid eventTime: "${rawTime}"`);
  }
  const eventTime = eventDate.toISOString();
  const recordTime = raw.recordTime ? new Date(raw.recordTime).toISOString() : new Date().toISOString();
  const eventTimeZoneOffset = raw.eventTimeZoneOffset || '+00:00';

  // WHAT
  let epcList = [];
  if (Array.isArray(raw.epcList)) {
    epcList = raw.epcList.map(String);
  } else if (raw.epc) {
    epcList = [String(raw.epc)];
  } else if (raw.what) {
    epcList = Array.isArray(raw.what) ? raw.what.map(String) : [String(raw.what)];
  }

  const quantityList = Array.isArray(raw.quantityList) ? raw.quantityList : [];
  const action = ['ADD', 'OBSERVE', 'DELETE'].includes(raw.action) ? raw.action : 'OBSERVE';

  // WHERE
  const readPoint = raw.readPoint ? (raw.readPoint.id || raw.readPoint) : (raw.where || null);
  const bizLocation = raw.bizLocation ? (raw.bizLocation.id || raw.bizLocation) : (raw.location || null);

  // WHY
  const bizStep = raw.bizStep || raw.why?.bizStep || CBV_BIZ_STEPS.TRANSPORTING;
  const disposition = raw.disposition || raw.why?.disposition || CBV_DISPOSITIONS.ACTIVE;

  // HOW (Sensor / Condition reports)
  const sensorElementList = Array.isArray(raw.sensorElementList)
    ? raw.sensorElementList
    : raw.how
      ? (Array.isArray(raw.how) ? raw.how : [raw.how])
      : [];

  // PROVENANCE & ACCESS
  const sourceSystem = raw.sourceSystem || raw.provenance?.sourceSystem || 'Unknown Ingestion Pipeline';
  const confidence = Number.isFinite(Number(raw.confidence))
    ? Math.max(0, Math.min(1, Number(raw.confidence)))
    : 0.95;
  const accessClassification = ACCESS_CLASSIFICATIONS.includes(raw.accessClassification)
    ? raw.accessClassification
    : 'INTERNAL';

  const event = {
    '@context': [
      'https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld',
      { '@vocab': 'https://gs1.org/voc/' },
    ],
    type: eventType,
    eventID,
    eventTime,
    recordTime,
    eventTimeZoneOffset,
    action,
    epcList,
    quantityList,
    readPoint: readPoint ? { id: readPoint } : null,
    bizLocation: bizLocation ? { id: bizLocation } : null,
    bizStep,
    disposition,
    sensorElementList,
    provenance: {
      sourceSystem,
      ingestTime: new Date().toISOString(),
      confidence,
      accessClassification,
    },
  };

  return { event, errors };
}

/**
 * Generates pseudo-UUID fallback if crypto.randomUUID is not in scope.
 */
function cryptoRandomUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Clean EPCIS Adapter Interface definition
 */
export class EpcisAdapterInterface {
  async ingestEvent(eventPayload) {
    throw new Error('EpcisAdapter.ingestEvent not implemented');
  }

  async queryEvents(queryFilters) {
    throw new Error('EpcisAdapter.queryEvents not implemented');
  }

  toEpcisJsonLd(event) {
    throw new Error('EpcisAdapter.toEpcisJsonLd not implemented');
  }

  fromEpcisJsonLd(jsonLd) {
    throw new Error('EpcisAdapter.fromEpcisJsonLd not implemented');
  }
}

/**
 * Local in-memory EPCIS 2.0 Mock Adapter
 * Simulates GS1 EPCIS capture and query endpoints for demonstration and testing.
 */
export class MockEpcisAdapter extends EpcisAdapterInterface {
  constructor({ initialEvents = [] } = {}) {
    super();
    this.events = [];
    for (const ev of initialEvents) {
      const { event, errors } = validateAndNormalizeEpcisEvent(ev);
      if (errors.length === 0) this.events.push(event);
    }
  }

  async ingestEvent(eventPayload) {
    const { event, errors } = validateAndNormalizeEpcisEvent(eventPayload);
    if (errors.length > 0) {
      return { success: false, errors, event: null };
    }
    this.events.push(event);
    return { success: true, errors: [], event };
  }

  async queryEvents({ epc, bizStep, disposition, fromTime, toTime } = {}) {
    return this.events.filter((ev) => {
      if (epc && !ev.epcList.includes(epc)) return false;
      if (bizStep && ev.bizStep !== bizStep) return false;
      if (disposition && ev.disposition !== disposition) return false;
      if (fromTime && new Date(ev.eventTime) < new Date(fromTime)) return false;
      if (toTime && new Date(ev.eventTime) > new Date(toTime)) return false;
      return true;
    });
  }

  toEpcisJsonLd(event) {
    return JSON.stringify(event, null, 2);
  }

  fromEpcisJsonLd(jsonString) {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      return validateAndNormalizeEpcisEvent(parsed);
    } catch (e) {
      return { event: null, errors: [`JSON Parse error: ${e.message}`] };
    }
  }

  /**
   * Generates realistic simulated EPCIS 2.0 events for a disruption scenario.
   */
  generateDisruptionEvents({ disruption, affectedShipment, affectedFacility }) {
    const events = [];

    // 1. Facility disruption event
    if (affectedFacility) {
      events.push({
        type: 'ObjectEvent',
        eventID: `urn:uuid:${cryptoRandomUuid()}`,
        eventTime: disruption.observedAt || new Date().toISOString(),
        action: 'OBSERVE',
        epcList: [`urn:epc:id:sgln:${affectedFacility.id}`],
        bizStep: CBV_BIZ_STEPS.DISRUPTED,
        disposition: CBV_DISPOSITIONS.DISRUPTED,
        readPoint: `urn:epc:id:sgln:${affectedFacility.id}`,
        bizLocation: `urn:epc:id:sgln:${affectedFacility.id}`,
        how: [
          {
            type: 'HazardSignal',
            hazardType: disruption.type,
            severity: disruption.severity,
            source: disruption.source,
          },
        ],
        sourceSystem: 'Disruption Exposure Engine',
        confidence: disruption.confidence || 0.95,
        accessClassification: 'INTERNAL',
      });
    }

    // 2. Shipment delay event
    if (affectedShipment) {
      events.push({
        type: 'ObjectEvent',
        eventID: `urn:uuid:${cryptoRandomUuid()}`,
        eventTime: new Date().toISOString(),
        action: 'OBSERVE',
        epcList: [`urn:epc:id:sscc:${affectedShipment.id}`],
        bizStep: CBV_BIZ_STEPS.TRANSPORTING,
        disposition: CBV_DISPOSITIONS.DELAYED,
        readPoint: affectedShipment.vesselReference ? `urn:epc:id:vessel:${affectedShipment.vesselReference}` : null,
        bizLocation: `urn:epc:id:sgln:${affectedShipment.destination}`,
        how: [
          {
            type: 'DelayEstimate',
            estimatedDelayHours: 96,
            reason: `Disruption ${disruption.name}`,
          },
        ],
        sourceSystem: 'TMS Automated Event Bridge',
        confidence: 0.92,
        accessClassification: 'RESTRICTED_PARTNER',
      });
    }

    return events;
  }
}
