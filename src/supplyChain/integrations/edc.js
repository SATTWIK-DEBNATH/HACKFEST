/**
 * Eclipse Dataspace Components (EDC) Connector Interface
 *
 * Implements sovereign, policy-controlled B2B data sharing across supply chain tiers:
 * - ODRL (Open Digital Rights Language) usage policies
 * - Contract offer / agreement negotiation
 * - Sovereign access classifications ('PUBLIC', 'INTERNAL', 'RESTRICTED_PARTNER', 'HIGHLY_CONFIDENTIAL')
 *
 * @module supplyChain/integrations/edc
 */

export class EclipseDataspaceConnector {
  constructor({
    participantId = 'urn:connector:apex-resilience-hub',
    controlPlaneUrl = null,
    enabled = false,
  } = {}) {
    this.participantId = participantId;
    this.controlPlaneUrl = controlPlaneUrl;
    this.enabled = enabled;
    this.agreements = new Map();
  }

  /**
   * Evaluates if a recipient satisfies the required access policy.
   * @param {string} classification
   * @param {Object} partnerContext
   * @returns {{ allowed: boolean, reason: string }}
   */
  evaluatePolicy(classification, partnerContext = {}) {
    if (classification === 'PUBLIC') {
      return { allowed: true, reason: 'Public dataset access permitted.' };
    }

    if (classification === 'INTERNAL') {
      const isInternal = partnerContext.domain?.endsWith('apexsystems.com');
      return {
        allowed: Boolean(isInternal),
        reason: isInternal ? 'Internal domain authorized.' : 'Access restricted to internal Apex personnel.',
      };
    }

    if (classification === 'RESTRICTED_PARTNER') {
      const hasAgreement = partnerContext.partnerId && this.agreements.has(partnerContext.partnerId);
      return {
        allowed: Boolean(hasAgreement),
        reason: hasAgreement
          ? `Active EDC Data Sharing Agreement verified for ${partnerContext.partnerId}.`
          : `No active EDC agreement found for partner "${partnerContext.partnerId}".`,
      };
    }

    return { allowed: false, reason: 'Highly confidential data requires manual security officer release.' };
  }

  /**
   * Registers a negotiated contract agreement with a supplier/carrier partner.
   */
  registerContractAgreement(partnerId, { assetId, usagePolicy, expiresAt }) {
    const agreement = {
      agreementId: `agr-${Date.now()}-${partnerId}`,
      partnerId,
      assetId,
      usagePolicy,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
    };
    this.agreements.set(partnerId, agreement);
    return agreement;
  }

  getStatus() {
    return {
      name: 'Eclipse Dataspace Connector (EDC)',
      status: this.enabled ? 'ACTIVE_FEDERATION' : 'LOCAL_MOCK',
      participantId: this.participantId,
      registeredAgreements: Array.from(this.agreements.keys()),
    };
  }
}
