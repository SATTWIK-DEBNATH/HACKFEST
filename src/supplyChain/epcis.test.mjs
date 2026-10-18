import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAndNormalizeEpcisEvent,
  MockEpcisAdapter,
  CBV_BIZ_STEPS,
  CBV_DISPOSITIONS,
} from './epcis.js';

test('validateAndNormalizeEpcisEvent constructs compliant EPCIS 2.0 JSON-LD event', () => {
  const rawEvent = {
    type: 'ObjectEvent',
    action: 'OBSERVE',
    epcList: ['urn:epc:id:sgtin:0614141.107346.2017'],
    bizStep: CBV_BIZ_STEPS.SHIPPING,
    disposition: CBV_DISPOSITIONS.IN_TRANSIT,
    readPoint: 'urn:epc:id:sgln:0614141.00777.0',
    bizLocation: 'urn:epc:id:sgln:0614141.00888.0',
    how: [{ type: 'Temperature', value: -18.5, unit: 'CEL' }],
    sourceSystem: 'Port Terminal RFID Scanner',
    confidence: 0.98,
    accessClassification: 'RESTRICTED_PARTNER',
  };

  const { event, errors } = validateAndNormalizeEpcisEvent(rawEvent);
  assert.equal(errors.length, 0);
  assert.equal(event.type, 'ObjectEvent');
  assert.ok(event['@context'].length >= 2);
  assert.equal(event.bizStep, CBV_BIZ_STEPS.SHIPPING);
  assert.equal(event.disposition, CBV_DISPOSITIONS.IN_TRANSIT);
  assert.equal(event.readPoint.id, 'urn:epc:id:sgln:0614141.00777.0');
  assert.equal(event.sensorElementList[0].value, -18.5);
  assert.equal(event.provenance.accessClassification, 'RESTRICTED_PARTNER');
});

test('MockEpcisAdapter ingests and queries events by business step and epc', async () => {
  const adapter = new MockEpcisAdapter();

  // Ingest shipping event
  const res1 = await adapter.ingestEvent({
    type: 'ObjectEvent',
    epcList: ['urn:epc:id:sscc:SHP-801'],
    bizStep: CBV_BIZ_STEPS.SHIPPING,
    disposition: CBV_DISPOSITIONS.IN_TRANSIT,
  });
  assert.equal(res1.success, true);

  // Ingest receiving event
  const res2 = await adapter.ingestEvent({
    type: 'ObjectEvent',
    epcList: ['urn:epc:id:sscc:SHP-802'],
    bizStep: CBV_BIZ_STEPS.RECEIVING,
    disposition: CBV_DISPOSITIONS.ACTIVE,
  });
  assert.equal(res2.success, true);

  // Query by bizStep
  const shippingEvents = await adapter.queryEvents({ bizStep: CBV_BIZ_STEPS.SHIPPING });
  assert.equal(shippingEvents.length, 1);
  assert.equal(shippingEvents[0].epcList[0], 'urn:epc:id:sscc:SHP-801');

  // Query by EPC
  const shp802Events = await adapter.queryEvents({ epc: 'urn:epc:id:sscc:SHP-802' });
  assert.equal(shp802Events.length, 1);
  assert.equal(shp802Events[0].bizStep, CBV_BIZ_STEPS.RECEIVING);
});

test('MockEpcisAdapter generates disruption telemetry events', () => {
  const adapter = new MockEpcisAdapter();
  const events = adapter.generateDisruptionEvents({
    disruption: { id: 'D-01', name: 'Cyclone Alert', type: 'cyclone', severity: 0.85, source: 'JTWC' },
    affectedFacility: { id: 'FAC-KAO' },
    affectedShipment: { id: 'SHP-801', destination: 'FAC-LBC', vesselReference: 'IMO 9811000' },
  });

  assert.equal(events.length, 2);
  assert.equal(events[0].bizStep, CBV_BIZ_STEPS.DISRUPTED);
  assert.equal(events[1].disposition, CBV_DISPOSITIONS.DELAYED);
});
