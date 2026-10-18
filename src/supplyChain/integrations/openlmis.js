/**
 * OpenLMIS Humanitarian & Health Supply Chain Adapter
 *
 * Provides specialized adapter patterns for health, humanitarian,
 * and pharmaceutical cold chains (vaccines, biologics, emergency relief):
 * - Cold-chain temperature excursion alerts (-20°C / +2°C to +8°C)
 * - Programmatic facility requisitions & consumption tracking
 * - Batch lot traceability & shelf-life degradation
 *
 * @module supplyChain/integrations/openlmis
 */

export class OpenLmisAdapter {
  constructor({ apiEndpoint = null, enabled = false } = {}) {
    this.apiEndpoint = apiEndpoint;
    this.enabled = enabled;
  }

  /**
   * Normalizes an OpenLMIS Electronic Logistics Management Information System
   * stock status payload into the RAD Digital Twin Inventory schema.
   */
  transformStockCardToInventory(stockCard) {
    const quantity = Number(stockCard.stockOnHand) || 0;
    const reserved = Number(stockCard.allocatedQuantity) || 0;
    const dailyDemand = Number(stockCard.averageMonthlyConsumption) ? stockCard.averageMonthlyConsumption / 30 : 10;
    const available = Math.max(0, quantity - reserved);
    const daysOfCover = Math.round((available / dailyDemand) * 10) / 10;

    return {
      id: `INV-LMIS-${stockCard.programCode}-${stockCard.productCode}`,
      facilityId: stockCard.facilityCode,
      productId: stockCard.productCode,
      quantity,
      reservedQuantity: reserved,
      dailyDemand: Math.round(dailyDemand * 10) / 10,
      daysOfCover,
      source: 'OpenLMIS v3 Requisition & Stock Service',
      observedAt: stockCard.lastUpdated || new Date().toISOString(),
      confidence: 0.95,
      coldChainStatus: stockCard.temperatureExcursion ? 'EXCURSION_RISK' : 'NOMINAL',
    };
  }

  /**
   * Evaluates vaccine cold-chain vulnerability during logistical disruptions.
   */
  evaluateColdChainIntegrity({ product, disruptionDurationHours, packagingType = 'PASSIVE_COOLER' }) {
    const thermalHoldHours = packagingType === 'ACTIVE_REEFER' ? 72 : packagingType === 'PASSIVE_COOLER' ? 36 : 12;
    const atRisk = disruptionDurationHours > thermalHoldHours;

    return {
      productName: product?.name || 'Cold Chain Asset',
      packagingType,
      thermalHoldHours,
      disruptionDurationHours,
      atRisk,
      actionRequired: atRisk
        ? 'EXPEDITE_OR_REFRIGERATE: Transfer immediately to cold-storage depot.'
        : 'NOMINAL: Passive insulation duration sufficient.',
    };
  }

  getStatus() {
    return {
      name: 'OpenLMIS Health & Vaccine Bridge',
      status: this.enabled ? 'ONLINE' : 'LOCAL_MOCK',
      targetSector: 'Humanitarian / Public Health / Cold-Chain Logistics',
    };
  }
}
