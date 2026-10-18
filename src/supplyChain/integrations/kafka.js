/**
 * Apache Kafka Streaming Ingestion Adapter
 *
 * Provides schema-registry-backed event streaming interface for:
 * - `supplychain.shipment.telemetry`
 * - `supplychain.wms.inventory-movements`
 * - `supplychain.erp.purchase-orders`
 * - `supplychain.hazards.geofence-alerts`
 *
 * Local/demo implementation with feature flags and no hard-coded credentials.
 *
 * @module supplyChain/integrations/kafka
 */

export class KafkaStreamAdapter {
  constructor({
    brokers = ['localhost:9092'],
    clientId = 'rad-supplychain-consumer',
    enabled = false,
  } = {}) {
    this.brokers = brokers;
    this.clientId = clientId;
    this.enabled = enabled;
    this.subscribers = new Map();
    this.simulatedBuffer = [];
  }

  /**
   * Subscribes a handler to a topic.
   * @param {string} topic
   * @param {Function} handler
   */
  subscribe(topic, handler) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(handler);
    return () => this.subscribers.get(topic)?.delete(handler);
  }

  /**
   * Publishes an event to a topic.
   * In local/mock mode, dispatches synchronously to registered subscribers.
   * @param {string} topic
   * @param {Object} message
   */
  async produce(topic, message) {
    const envelope = {
      topic,
      timestamp: new Date().toISOString(),
      headers: {
        'content-type': 'application/json',
        'traceparent': `00-${Date.now().toString(16).padStart(32, '0')}-${Math.random().toString(16).slice(2, 18)}-01`,
      },
      key: message.id || message.shipmentId || message.facilityId || null,
      value: message,
    };

    this.simulatedBuffer.push(envelope);

    const handlers = this.subscribers.get(topic);
    if (handlers) {
      for (const h of handlers) {
        try {
          h(envelope);
        } catch (e) {
          console.warn(`[Kafka] Error in topic "${topic}" handler:`, e);
        }
      }
    }

    return { offset: this.simulatedBuffer.length - 1, partition: 0 };
  }

  getStatus() {
    return {
      name: 'Apache Kafka',
      status: this.enabled ? 'CONNECTED' : 'LOCAL_MOCK',
      brokers: this.brokers,
      clientId: this.clientId,
      bufferedCount: this.simulatedBuffer.length,
      activeTopics: Array.from(this.subscribers.keys()),
    };
  }
}
