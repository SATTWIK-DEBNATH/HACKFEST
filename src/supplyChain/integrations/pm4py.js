/**
 * PM4Py Process Mining Integration Interface & Licensing Architecture
 *
 * Facilitates discovery of operational bottlenecks, repeated route delays,
 * and customs dwell-time distributions across historical EPCIS event logs.
 *
 * ============================================================================
 * CRITICAL LICENSING ARCHITECTURE NOTICE (AGPL-3.0 vs RAD MIT LICENSE):
 *
 * PM4Py is distributed under the GNU Affero General Public License v3.0 (AGPL-3.0).
 *
 * Strict Compliance Guardrails:
 * 1. ZERO IN-PROCESS LINKING: PM4Py code, libraries, or Python modules MUST NEVER
 *    be bundled, compiled into, or imported directly by this browser application
 *    or the RAD core runtime.
 * 2. ISOLATED SERVICE BOUNDARY: In production, PM4Py runs exclusively as an
 *    external, independently deployed backend microservice behind a clean HTTP/REST
 *    or gRPC API boundary. Network service calls over standard protocols do not
 *    infect client application code under AGPL-3.0 terms.
 * 3. PERMISSIVE ALTERNATIVE OPTION: For embedded deployments requiring Apache-2.0
 *    or MIT compatibility without copyleft service dependencies, teams should use
 *    bupaR or custom deterministic Markov transition matrices rather than PM4Py.
 * ============================================================================
 *
 * @module supplyChain/integrations/pm4py
 */

export class ProcessMiningLogAdapter {
  constructor({ serviceEndpoint = null, enabled = false } = {}) {
    this.serviceEndpoint = serviceEndpoint;
    this.enabled = enabled;
  }

  /**
   * Transforms internal EPCIS events into an IEEE XES (Extensible Event Stream)
   * compliant CSV/JSON event log structure for process mining:
   * - case:concept:name (e.g. shipmentId or purchaseOrderId)
   * - concept:name (bizStep activity: shipping, customs_clearance, transit, receiving)
   * - time:timestamp (ISO 8601)
   * - org:resource (carrier, terminal, warehouse)
   */
  exportEventLogToXesJson(epcisEvents = []) {
    return epcisEvents.map((ev) => {
      const caseId = ev.epcList?.[0] || ev.eventID;
      const activity = ev.bizStep ? ev.bizStep.split(':').pop() : 'UNKNOWN_STEP';
      const timestamp = ev.eventTime;
      const resource = ev.readPoint?.id || ev.provenance?.sourceSystem || 'SYSTEM';

      return {
        'case:concept:name': caseId,
        'concept:name': activity,
        'time:timestamp': timestamp,
        'org:resource': resource,
        'lifecycle:transition': 'complete',
        'disposition': ev.disposition,
        'confidence': ev.provenance?.confidence || 1.0,
      };
    });
  }

  /**
   * Deterministic client-side heuristic for transition cycle times
   * (Operates without needing the external AGPL PM4Py Python runtime).
   */
  calculateTransitionCycleTimes(xesEvents = []) {
    const cases = new Map();
    for (const ev of xesEvents) {
      const caseId = ev['case:concept:name'];
      if (!cases.has(caseId)) cases.set(caseId, []);
      cases.get(caseId).push(ev);
    }

    const transitions = [];
    for (const [caseId, caseEvents] of cases.entries()) {
      caseEvents.sort((a, b) => new Date(a['time:timestamp']) - new Date(b['time:timestamp']));

      for (let i = 0; i < caseEvents.length - 1; i++) {
        const fromStep = caseEvents[i]['concept:name'];
        const toStep = caseEvents[i + 1]['concept:name'];
        const start = new Date(caseEvents[i]['time:timestamp']).getTime();
        const end = new Date(caseEvents[i + 1]['time:timestamp']).getTime();
        const durationHours = Math.max(0, (end - start) / 3600000);

        transitions.push({
          caseId,
          fromStep,
          toStep,
          durationHours: Math.round(durationHours * 10) / 10,
        });
      }
    }

    return transitions;
  }

  getStatus() {
    return {
      name: 'PM4Py Process Mining Bridge',
      status: this.enabled ? 'REMOTE_MICROSERVICE' : 'CLIENT_HEURISTIC_MOCK',
      licensingConstraint: 'AGPL-3.0 Isolated Microservice Boundary Only',
      serviceEndpoint: this.serviceEndpoint || 'None configured (Runs mock transition analysis)',
    };
  }
}
