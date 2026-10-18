/**
 * Supply Chain Enterprise Integrations Hub
 *
 * Exposes adapters and feature flags for:
 * - GS1 EPCIS / OpenEPCIS (Traceability)
 * - Apache Kafka (Streaming telemetry & ERP/WMS events)
 * - Apache Camel (EIP integration pipelines)
 * - Eclipse Dataspace Components (EDC sovereign data sharing)
 * - OpenTelemetry (Observability, traces & metrics)
 * - PM4Py (Process mining & cycle time analysis with AGPL-3.0 isolation)
 * - OpenLMIS (Health, humanitarian & cold chain tracking)
 *
 * @module supplyChain/integrations
 */

import { MockEpcisAdapter } from '../epcis.js';
import { KafkaStreamAdapter } from './kafka.js';
import { createDefaultCamelPipeline } from './camel.js';
import { EclipseDataspaceConnector } from './edc.js';
import { telemetry } from './telemetry.js';
import { ProcessMiningLogAdapter } from './pm4py.js';
import { OpenLmisAdapter } from './openlmis.js';

export {
  MockEpcisAdapter,
  KafkaStreamAdapter,
  EclipseDataspaceConnector,
  telemetry,
  ProcessMiningLogAdapter,
  OpenLmisAdapter,
};

/**
 * Creates the complete enterprise integrations suite with default mock adapters.
 */
export function createIntegrationsSuite({ featureFlags = {} } = {}) {
  const epcis = new MockEpcisAdapter();
  const kafka = new KafkaStreamAdapter({ enabled: Boolean(featureFlags.kafka) });
  const camel = createDefaultCamelPipeline();
  const edc = new EclipseDataspaceConnector({ enabled: Boolean(featureFlags.edc) });
  const pm4py = new ProcessMiningLogAdapter({ enabled: Boolean(featureFlags.pm4py) });
  const openlmis = new OpenLmisAdapter({ enabled: Boolean(featureFlags.openlmis) });

  return {
    epcis,
    kafka,
    camel,
    edc,
    telemetry,
    pm4py,
    openlmis,
    getSystemStatus() {
      return [
        { id: 'epcis', ...epcis ? { name: 'GS1 EPCIS 2.0', status: 'READY (OpenEPCIS Compatible)' } : {} },
        kafka.getStatus(),
        camel.getStatus(),
        edc.getStatus(),
        telemetry.getStatus(),
        pm4py.getStatus(),
        openlmis.getStatus(),
      ];
    },
  };
}
