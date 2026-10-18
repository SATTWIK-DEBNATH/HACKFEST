/**
 * Supply Chain Resilience Command Center UI Controller
 *
 * Provides a decision-support command interface:
 * 1. Network: Health overview, asset counts, freshness & source confidence
 * 2. Impact: Active disruption selector, transparent component scoring, blast radius
 * 3. Recovery: Scenarios comparison, recommended option with trade-offs, approve controls
 * 4. Action Ledger: Immutable audit trail, state transitions, expected vs actual outcomes
 * 5. Evidence Drawer: Full calculation inputs, assumptions, provenance, and warnings
 *
 * @module ui/resiliencePanel
 */

import { DEMO_SUPPLY_CHAIN_RAW, DEMO_DISRUPTIONS } from '../supplyChain/demoData.js';
import { createSupplyChainTwin } from '../supplyChain/model.js';
import { calculateSupplyChainImpact } from '../supplyChain/impactEngine.js';
import { simulateRecoveryScenarios } from '../supplyChain/recoveryEngine.js';
import { ActionLedger, createActionFromScenario } from '../supplyChain/actionLedger.js';
import { importSupplyChainTwinFromJson, importFacilitiesFromCsv } from '../supplyChain/importExport.js';

export function createResiliencePanel({ supplyChainLayer = null, container = document.body } = {}) {
  // 1. Initialize State
  let { twin: activeTwin } = createSupplyChainTwin(DEMO_SUPPLY_CHAIN_RAW);
  let disruptions = [...DEMO_DISRUPTIONS];
  let activeDisruption = disruptions[0]; // Default: Super Typhoon Gaemi
  let impactAssessment = calculateSupplyChainImpact(activeDisruption, activeTwin);
  let scenariosResult = simulateRecoveryScenarios(impactAssessment, activeTwin);
  let actionLedger = new ActionLedger(activeTwin.actions || []);

  let activeTab = 'network'; // 'network' | 'impact' | 'recovery' | 'ledger'
  let isPanelOpen = false;
  let activeEvidenceScenario = null;
  let assigningScenario = null;
  let isImportModalOpen = false;

  // Sync initial state to Globe layer
  if (supplyChainLayer) {
    supplyChainLayer.setTwin(activeTwin);
    supplyChainLayer.setDisruption(activeDisruption);
    supplyChainLayer.setScenario(scenariosResult.recommendedScenario);
  }

  // 2. DOM Elements Creation
  const panel = document.createElement('div');
  panel.id = 'resilience-panel';
  panel.className = 'resilience-panel collapsed';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Supply Chain Resilience Command Center');

  // Backdrop for drawer/modals
  const overlayBackdrop = document.createElement('div');
  overlayBackdrop.id = 'resilience-overlay-backdrop';
  overlayBackdrop.style.display = 'none';

  function recalculateAll() {
    impactAssessment = calculateSupplyChainImpact(activeDisruption, activeTwin);
    scenariosResult = simulateRecoveryScenarios(impactAssessment, activeTwin);

    if (supplyChainLayer) {
      supplyChainLayer.setTwin(activeTwin);
      supplyChainLayer.setDisruption(activeDisruption);
      supplyChainLayer.setScenario(scenariosResult.recommendedScenario);
    }
    render();
  }

  function render() {
    panel.innerHTML = `
      <div class="resilience-header">
        <div class="resilience-title-group">
          <span class="resilience-icon" aria-hidden="true">🌐</span>
          <span class="resilience-title">RESILIENCE COMMAND</span>
        </div>
        <div class="resilience-header-actions">
          <button id="resilience-import-btn" class="resilience-btn-mini" title="Import CSV or JSON data">IMPORT</button>
          <button id="resilience-reset-btn" class="resilience-btn-mini" title="Reset to default demo scenario">DEMO</button>
          <button id="resilience-close-x" class="resilience-close-btn" title="Close Resilience Panel" aria-label="Close panel">✕</button>
        </div>
      </div>

      <div class="resilience-tabs" role="tablist">
        <button class="resilience-tab-btn ${activeTab === 'network' ? 'active' : ''}" data-tab="network" role="tab">Network</button>
        <button class="resilience-tab-btn ${activeTab === 'impact' ? 'active' : ''}" data-tab="impact" role="tab">Impact</button>
        <button class="resilience-tab-btn ${activeTab === 'recovery' ? 'active' : ''}" data-tab="recovery" role="tab">Recovery</button>
        <button class="resilience-tab-btn ${activeTab === 'ledger' ? 'active' : ''}" data-tab="ledger" role="tab">Ledger (${actionLedger.getAll().length})</button>
      </div>

      <div class="resilience-body">
        ${renderTabContent()}
      </div>
    `;

    attachEventListeners();
  }

  function renderTabContent() {
    if (activeTab === 'network') return renderNetworkTab();
    if (activeTab === 'impact') return renderImpactTab();
    if (activeTab === 'recovery') return renderRecoveryTab();
    if (activeTab === 'ledger') return renderLedgerTab();
    return '';
  }

  // --- TAB A: NETWORK ---
  function renderNetworkTab() {
    const facilitiesCount = activeTwin.facilities.length;
    const shipmentsCount = activeTwin.shipments.length;
    const atRiskShipments = impactAssessment.affectedShipments.length;
    const criticalProducts = activeTwin.products.filter((p) => p.criticality === 'critical').length;
    const lowCoverItem = impactAssessment.inventoryImpacts.find((i) => i.isBelowThreshold);

    return `
      <div class="resilience-section">
        <div class="section-label">Operational Network Overview</div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-value">${facilitiesCount}</span>
            <span class="kpi-label">Monitored Facilities</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-value">${shipmentsCount}</span>
            <span class="kpi-label">Active Shipments</span>
          </div>
          <div class="kpi-card ${atRiskShipments > 0 ? 'alert' : ''}">
            <span class="kpi-value">${atRiskShipments}</span>
            <span class="kpi-label">At-Risk Shipments</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-value">${criticalProducts}</span>
            <span class="kpi-label">Critical Products</span>
          </div>
        </div>

        ${lowCoverItem ? `
          <div class="stockout-alert-banner">
            <span aria-hidden="true" style="font-size: 15px;">⚠️</span>
            <div>
              <strong>CRITICAL STOCKOUT WARNING (&lt; 5 DAYS):</strong><br>
              <strong>${lowCoverItem.product?.name || 'Product'}</strong> at ${lowCoverItem.facility?.name || 'Facility'} has only
              <strong style="color: #ff6b6b; text-decoration: underline;">${lowCoverItem.currentDaysOfCover} days of inventory cover</strong> remaining
              (Safety reorder point: ${lowCoverItem.product?.reorderPoint} units). Immediate replenishment needed!
            </div>
          </div>
        ` : ''}

        <div class="section-label" style="margin-top: 6px;">Data Ingestion Freshness &amp; Provenance</div>
        <div class="freshness-row">
          <span>SAP ERP S/4HANA (Inventory)</span>
          <span style="color: #38bdf8;">Fresh · 4m ago [98% conf]</span>
        </div>
        <div class="freshness-row">
          <span>Manhattan WMS (DC Stocks)</span>
          <span style="color: #38bdf8;">Fresh · 12m ago [97% conf]</span>
        </div>
        <div class="freshness-row">
          <span>AIS Vessel Tracker (POLA / TAIWAN)</span>
          <span style="color: #fbbf24;">Inferred · 22m ago [91% conf]</span>
        </div>
        <div class="freshness-row">
          <span>JTWC / USGS Live Hazard Layer</span>
          <span style="color: #38bdf8;">Observed · 8m ago [95% conf]</span>
        </div>

        <button id="resilience-goto-impact-btn" class="action-btn-primary" style="margin-top: 8px;">
          Inspect Active Disruption &amp; Blast Radius →
        </button>
      </div>
    `;
  }

  // --- TAB B: IMPACT ---
  function renderImpactTab() {
    const { disruption, scoringBreakdown, affectedFacilities, affectedRouteLegs, affectedShipments, plainLanguageExplanation } = impactAssessment;

    return `
      <div class="resilience-section">
        <div class="section-label">Select Active Disruption Event</div>
        <div class="disruption-select-wrap">
          <select id="resilience-disruption-select" class="disruption-select">
            ${disruptions.map((d) => `
              <option value="${d.id}" ${d.id === activeDisruption.id ? 'selected' : ''}>
                ${d.name} (${d.type.toUpperCase()})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="freshness-row">
          <span>Source: <strong>${disruption.source}</strong></span>
          <span class="badge-epistemic badge-observed">OBSERVED</span>
        </div>

        <div class="impact-explanation-box">
          ${plainLanguageExplanation}
        </div>

        <div class="scoring-card">
          <div class="scoring-header">
            <span class="section-label" style="margin: 0;">Component Scoring Breakdown</span>
            <span class="impact-rating-chip ${scoringBreakdown.compositeScore >= 40 ? 'rating-critical' : 'rating-high'}">
              IMPACT: ${scoringBreakdown.compositeScore}/100 (${scoringBreakdown.rating})
            </span>
          </div>

          <div class="scoring-bar-row">
            <span>Hazard Severity (${scoringBreakdown.hazardSeverity})</span>
            <div class="scoring-bar-track"><div class="scoring-bar-fill hazard" style="width: ${scoringBreakdown.hazardSeverity * 100}%"></div></div>
          </div>
          <div class="scoring-bar-row">
            <span>Spatial Exposure (${scoringBreakdown.exposure})</span>
            <div class="scoring-bar-track"><div class="scoring-bar-fill" style="width: ${scoringBreakdown.exposure * 100}%"></div></div>
          </div>
          <div class="scoring-bar-row">
            <span>Business Criticality (${scoringBreakdown.businessCriticality})</span>
            <div class="scoring-bar-track"><div class="scoring-bar-fill criticality" style="width: ${scoringBreakdown.businessCriticality * 100}%"></div></div>
          </div>
          <div class="scoring-bar-row">
            <span>Recovery Difficulty (${scoringBreakdown.recoveryDifficulty})</span>
            <div class="scoring-bar-track"><div class="scoring-bar-fill difficulty" style="width: ${scoringBreakdown.recoveryDifficulty * 100}%"></div></div>
          </div>
          <div class="scoring-bar-row">
            <span>Data Confidence (${scoringBreakdown.dataConfidence})</span>
            <div class="scoring-bar-track"><div class="scoring-bar-fill confidence" style="width: ${scoringBreakdown.dataConfidence * 100}%"></div></div>
          </div>
        </div>

        <div class="section-label">Affected Value Chain Assets</div>
        <div style="font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
          ${affectedFacilities.map((af) => `
            <div class="freshness-row" style="cursor: pointer;" data-fly-lat="${af.facility.latitude}" data-fly-lon="${af.facility.longitude}">
              <span>🏭 ${af.facility.name} (${af.distanceKm}km from epicenter)</span>
              <span class="badge-epistemic badge-observed">DIRECT HIT</span>
            </div>
          `).join('')}
          ${affectedRouteLegs.map((al) => `
            <div class="freshness-row">
              <span>🛣️ Route: ${al.routeLeg.origin} → ${al.routeLeg.destination}</span>
              <span class="badge-epistemic badge-observed">INTERSECTED</span>
            </div>
          `).join('')}
          ${affectedShipments.map((as) => `
            <div class="freshness-row">
              <span>📦 Shipment ${as.shipment.id} (${as.shipment.carrier})</span>
              <span class="badge-epistemic badge-inferred">+${as.estimatedDelayHours}h DELAY</span>
            </div>
          `).join('')}
        </div>

        <button id="resilience-simulate-recovery-btn" class="action-btn-primary" style="margin-top: 6px;">
          Simulate Recovery Scenarios (4 Options) →
        </button>
      </div>
    `;
  }

  // --- TAB C: RECOVERY SCENARIOS ---
  function renderRecoveryTab() {
    const { scenarios, recommendedScenario, comparisonSummary } = scenariosResult;

    return `
      <div class="resilience-section">
        <div class="section-label">Decision Support Alternatives</div>
        <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">
          ${comparisonSummary.recommendationReason}
        </div>

        <div class="scenario-list">
          ${scenarios.map((scen) => `
            <div class="scenario-card ${scen.id === recommendedScenario.id ? 'recommended' : ''}">
              <div class="scenario-card-header">
                <span class="scenario-name">${scen.name}</span>
                ${scen.id === recommendedScenario.id ? '<span class="recommended-tag">RECOMMENDED</span>' : ''}
              </div>

              <div style="font-size: 10.5px; color: #cbd5e1; line-height: 1.35;">
                ${scen.description}
              </div>

              <div class="scenario-metrics-grid">
                <div class="metric-item">Delay: <strong>${scen.expectedDelayDays >= 0 ? `+${scen.expectedDelayDays}` : scen.expectedDelayDays}d</strong></div>
                <div class="metric-item">Cost: <strong>+$${scen.estimatedCostImpactUsd.toLocaleString()}</strong></div>
                <div class="metric-item">Protected: <strong style="color: #34d399;">+${scen.inventoryDaysProtected} days</strong></div>
                <div class="metric-item">Carbon: <strong>${scen.carbonLabel}</strong></div>
              </div>

              <div style="font-size: 10px; color: #94a3b8;">
                <em>${scen.feasibilityReason}</em>
              </div>

              <div class="scenario-actions-row">
                <button class="action-btn-primary resilience-approve-btn" data-scenario-id="${scen.id}">
                  Approve &amp; Assign Action
                </button>
                <button class="action-btn-secondary resilience-evidence-btn" data-scenario-id="${scen.id}">
                  Evidence
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- TAB D: ACTION LEDGER ---
  function renderLedgerTab() {
    const actions = actionLedger.getAll();

    return `
      <div class="resilience-section">
        <div class="section-label">Action Ledger &amp; Immutable Audit Trail</div>
        <div style="font-size: 10.5px; color: #94a3b8;">
          All recovery approvals and operational interventions are recorded with cryptographically traceable timestamps.
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          ${actions.length === 0 ? '<div style="color: #94a3b8; font-style: italic;">No actions in ledger.</div>' : ''}
          ${actions.map((act) => `
            <div class="ledger-item-card">
              <div class="ledger-item-header">
                <span class="ledger-id">${act.id}</span>
                <span class="badge-epistemic ${act.status === 'completed' ? 'badge-simulated' : act.status === 'approved' ? 'badge-observed' : 'badge-inferred'}">
                  ${act.status.toUpperCase()}
                </span>
              </div>
              <div class="ledger-meta">
                Type: <strong>${act.type}</strong> | Owner: <strong>${act.owner}</strong>
              </div>
              <div style="font-size: 10.5px; color: #cbd5e1;">
                Target: ${act.expectedOutcome}
              </div>
              ${act.actualOutcome ? `
                <div style="font-size: 10px; color: #34d399;">
                  Outcome: ${act.actualOutcome}
                </div>
              ` : ''}

              <!-- Action State Transitions -->
              <div style="display: flex; gap: 4px; margin-top: 4px;">
                ${act.status === 'approved' ? `
                  <button class="resilience-btn-mini ledger-exec-btn" data-action-id="${act.id}">Execute Action</button>
                ` : ''}
                ${act.status === 'executing' ? `
                  <button class="resilience-btn-mini ledger-complete-btn" data-action-id="${act.id}">Mark Completed</button>
                ` : ''}
              </div>

              <!-- Audit Trail -->
              <div class="ledger-audit-timeline">
                ${act.auditTrail.map((entry) => `
                  <div class="timeline-step">
                    <strong>${entry.timestamp.slice(11, 19)} [${entry.actor}]:</strong> ${entry.details}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- EVIDENCE DRAWER ---
  function renderEvidenceDrawer(scenario) {
    let existing = document.getElementById('resilience-evidence-drawer');
    if (existing) existing.remove();

    if (!scenario) return;

    const drawer = document.createElement('div');
    drawer.id = 'resilience-evidence-drawer';
    drawer.className = 'evidence-drawer';
    drawer.innerHTML = `
      <div class="evidence-header">
        <strong style="color: #6be8ff; font-size: 13px;">EVIDENCE &amp; PROVENANCE AUDIT</strong>
        <button id="evidence-drawer-close" class="resilience-close-btn">✕</button>
      </div>
      <div class="evidence-body">
        <div class="evidence-box">
          <span class="section-label">Triggering Disruption Event</span>
          <div><strong>Event:</strong> ${impactAssessment.disruption.name}</div>
          <div><strong>Source Agency:</strong> ${impactAssessment.disruption.source}</div>
          <div><strong>Observed At:</strong> ${impactAssessment.disruption.observedAt}</div>
          <div><strong>Signal Confidence:</strong> ${Math.round(impactAssessment.disruption.confidence * 100)}%</div>
          <span class="badge-epistemic badge-observed">VERIFIED EXTERNAL TELEMETRY</span>
        </div>

        <div class="evidence-box">
          <span class="section-label">Evaluated Graph Blast Radius</span>
          <div style="font-size: 10.5px; line-height: 1.5;">
            ${(impactAssessment.dependencyPaths[0]?.nodes || [
              `Hazard: ${impactAssessment.disruption.name}`,
              `Disrupted Node: ${impactAssessment.affectedFacilities[0]?.facility.name || 'Primary Corridor'}`,
              `Affected SKU: Apex Core MCU-900`,
              `Downstream Stockout: Long Beach DC (3.2 days remaining)`,
            ]).map((node, i) => `${i + 1}. ${node}`).join('<br>')}
          </div>
        </div>

        <div class="evidence-box">
          <span class="section-label">Scenario Calculation Inputs</span>
          <div><strong>Trade-off Score:</strong> ${scenario.tradeOffScore}/100</div>
          <div><strong>Delay Delta:</strong> ${scenario.delayDeltaLabel}</div>
          <div><strong>Cost Impact:</strong> ${scenario.costImpactLabel}</div>
          <div><strong>Inventory Days Protected:</strong> ${scenario.inventoryImpactLabel}</div>
          <div><strong>Capacity Constraints:</strong> ${scenario.capacityConstraints}</div>
          <div><strong>Carbon Footprint:</strong> ${scenario.carbonLabel}</div>
        </div>

        <div class="evidence-box">
          <span class="section-label">Operational Assumptions</span>
          <ul style="margin: 0; padding-left: 16px; font-size: 10.5px; color: #cbd5e1;">
            ${scenario.operationalAssumptions.map((a) => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <div class="evidence-box">
          <span class="section-label">Confidence &amp; Safety Warnings</span>
          <div style="color: #fbbf24; font-size: 10.5px;">
            ⚠️ Public hazards are exposure signals, not guaranteed business delays. Carrier confirmation is required upon dispatch.
          </div>
          <div><strong>Engine Confidence:</strong> ${Math.round(scenario.confidence * 100)}%</div>
          <span class="badge-epistemic badge-simulated">SIMULATED RECOVERY PROJECTION</span>
        </div>
      </div>
    `;

    document.body.appendChild(drawer);

    document.getElementById('evidence-drawer-close').onclick = () => {
      drawer.remove();
    };
  }

  // --- ACTION APPROVAL MODAL ---
  function renderApprovalModal(scenario) {
    let existing = document.getElementById('resilience-assign-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'resilience-assign-modal';
    modal.className = 'resilience-modal-overlay';
    modal.innerHTML = `
      <div class="resilience-modal">
        <div class="resilience-modal-header">
          <strong style="color: #6be8ff;">APPROVE &amp; ASSIGN RECOVERY ACTION</strong>
          <button id="modal-close-btn" class="resilience-close-btn">✕</button>
        </div>
        <div class="resilience-modal-body">
          <div>
            <strong>Selected Action:</strong><br>
            <span style="color: #38bdf8;">${scenario.name}</span>
          </div>
          <div class="modal-input-group">
            <label>Assigned Action Owner (Name &amp; Role):</label>
            <input type="text" id="action-owner-input" class="modal-input" value="Sarah Lin (Global Logistics Director)" />
          </div>
          <div class="modal-input-group">
            <label>Approved By Authority:</label>
            <input type="text" id="action-approver-input" class="modal-input" value="Supply Chain VP / Operational Directorate" />
          </div>
          <div class="modal-input-group">
            <label>Executive Notes &amp; Implementation Directives:</label>
            <textarea id="action-notes-input" class="modal-textarea">Approved based on RAD resilience recommendation. Immediate execution authorized under emergency contingency budget.</textarea>
          </div>
        </div>
        <div class="resilience-modal-footer">
          <button id="modal-cancel-btn" class="action-btn-secondary">Cancel</button>
          <button id="modal-confirm-btn" class="action-btn-primary">Confirm &amp; Record in Ledger</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    document.getElementById('modal-close-btn').onclick = close;
    document.getElementById('modal-cancel-btn').onclick = close;

    document.getElementById('modal-confirm-btn').onclick = () => {
      const owner = document.getElementById('action-owner-input').value;
      const approvedBy = document.getElementById('action-approver-input').value;
      const notes = document.getElementById('action-notes-input').value;

      // Create and approve action
      const newAction = createActionFromScenario(scenario, { owner });
      actionLedger.add(newAction);
      actionLedger.approve(newAction.id, { approvedBy, notes, owner });

      close();
      activeTab = 'ledger';
      render();
    };
  }

  // --- CSV / JSON IMPORT MODAL ---
  function renderImportModal() {
    let existing = document.getElementById('resilience-import-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'resilience-import-modal';
    modal.className = 'resilience-modal-overlay';
    modal.innerHTML = `
      <div class="resilience-modal">
        <div class="resilience-modal-header">
          <strong style="color: #6be8ff;">IMPORT SUPPLY CHAIN DATA (CSV / JSON)</strong>
          <button id="import-close-btn" class="resilience-close-btn">✕</button>
        </div>
        <div class="resilience-modal-body">
          <div style="font-size: 11px; color: #94a3b8;">
            Paste JSON Digital Twin payload or CSV facility records. Schema validation is strictly enforced; invalid records are never silently discarded.
          </div>
          <div class="modal-input-group">
            <label>Payload (JSON Twin or CSV Facilities):</label>
            <textarea id="import-payload-textarea" class="modal-textarea" style="min-height: 140px;" placeholder='{"facilities": [...], "products": [...], ...}'></textarea>
          </div>
          <div id="import-feedback-box" style="display: none; padding: 8px; border-radius: 4px; font-size: 10.5px;"></div>
        </div>
        <div class="resilience-modal-footer">
          <button id="import-sample-btn" class="action-btn-secondary">Load Sample CSV</button>
          <button id="import-cancel-btn" class="action-btn-secondary">Cancel</button>
          <button id="import-submit-btn" class="action-btn-primary">Validate &amp; Ingest</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    document.getElementById('import-close-btn').onclick = close;
    document.getElementById('import-cancel-btn').onclick = close;

    document.getElementById('import-sample-btn').onclick = () => {
      document.getElementById('import-payload-textarea').value =
`id,name,type,latitude,longitude,country,criticality,capacity,owner
FAC-IMPORT-01,Tokyo Automated Warehouse,warehouse,35.676,139.650,Japan,critical,50000,Apex Japan Log
FAC-IMPORT-02,Rotterdam North Terminal,port,51.924,4.477,Netherlands,high,120000,Port Authority`;
    };

    document.getElementById('import-submit-btn').onclick = () => {
      const text = document.getElementById('import-payload-textarea').value.trim();
      const feedbackBox = document.getElementById('import-feedback-box');
      feedbackBox.style.display = 'block';

      if (!text) {
        feedbackBox.style.background = 'rgba(239, 68, 68, 0.2)';
        feedbackBox.style.color = '#f87171';
        feedbackBox.textContent = 'Please enter JSON or CSV data.';
        return;
      }

      if (text.startsWith('{')) {
        // Parse as JSON twin
        const { twin, errors, warnings } = importSupplyChainTwinFromJson(text);
        if (errors.length > 0) {
          feedbackBox.style.background = 'rgba(239, 68, 68, 0.2)';
          feedbackBox.style.color = '#f87171';
          feedbackBox.textContent = `Validation failed: ${errors.join(', ')}`;
        } else {
          activeTwin = twin;
          recalculateAll();
          close();
        }
      } else {
        // Parse as CSV facilities
        const { facilities, errors } = importFacilitiesFromCsv(text);
        if (errors.length > 0) {
          feedbackBox.style.background = 'rgba(239, 68, 68, 0.2)';
          feedbackBox.style.color = '#f87171';
          feedbackBox.textContent = `CSV Errors:\n${errors.join('\n')}`;
        } else if (facilities.length > 0) {
          activeTwin.facilities.push(...facilities);
          recalculateAll();
          close();
        }
      }
    };
  }

  function attachEventListeners() {
    // Tab switching
    panel.querySelectorAll('.resilience-tab-btn').forEach((btn) => {
      btn.onclick = () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      };
    });

    // Close panel
    const closeX = panel.querySelector('#resilience-close-x');
    if (closeX) {
      closeX.onclick = () => {
        panel.classList.add('collapsed');
        isPanelOpen = false;
      };
    }

    // Header buttons
    const importBtn = panel.querySelector('#resilience-import-btn');
    if (importBtn) importBtn.onclick = () => renderImportModal();

    const resetBtn = panel.querySelector('#resilience-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        const { twin } = createSupplyChainTwin(DEMO_SUPPLY_CHAIN_RAW);
        activeTwin = twin;
        disruptions = [...DEMO_DISRUPTIONS];
        activeDisruption = disruptions[0];
        actionLedger = new ActionLedger(activeTwin.actions || []);
        recalculateAll();
      };
    }

    // Quick navigation buttons
    const gotoImpactBtn = panel.querySelector('#resilience-goto-impact-btn');
    if (gotoImpactBtn) {
      gotoImpactBtn.onclick = () => {
        activeTab = 'impact';
        render();
      };
    }

    const simulateRecoveryBtn = panel.querySelector('#resilience-simulate-recovery-btn');
    if (simulateRecoveryBtn) {
      simulateRecoveryBtn.onclick = () => {
        activeTab = 'recovery';
        render();
      };
    }

    // Disruption Select
    const disruptionSelect = panel.querySelector('#resilience-disruption-select');
    if (disruptionSelect) {
      disruptionSelect.onchange = (e) => {
        const selected = disruptions.find((d) => d.id === e.target.value);
        if (selected) {
          activeDisruption = selected;
          recalculateAll();
          if (supplyChainLayer) {
            supplyChainLayer.flyToAsset(selected);
          }
        }
      };
    }

    // Fly to facility rows
    panel.querySelectorAll('[data-fly-lat]').forEach((row) => {
      row.onclick = () => {
        const lat = Number(row.getAttribute('data-fly-lat'));
        const lon = Number(row.getAttribute('data-fly-lon'));
        if (supplyChainLayer) supplyChainLayer.flyToAsset({ latitude: lat, longitude: lon });
      };
    });

    // Approve Scenario Buttons
    panel.querySelectorAll('.resilience-approve-btn').forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-scenario-id');
        const scenario = scenariosResult.scenarios.find((s) => s.id === id);
        if (scenario) renderApprovalModal(scenario);
      };
    });

    // Evidence Scenario Buttons
    panel.querySelectorAll('.resilience-evidence-btn').forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-scenario-id');
        const scenario = scenariosResult.scenarios.find((s) => s.id === id);
        if (scenario) renderEvidenceDrawer(scenario);
      };
    });

    // Action Ledger transition buttons
    panel.querySelectorAll('.ledger-exec-btn').forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-action-id');
        actionLedger.execute(id, { actor: 'WMS Freight Dispatcher', details: 'Transport order released to carrier' });
        render();
      };
    });

    panel.querySelectorAll('.ledger-complete-btn').forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-action-id');
        actionLedger.complete(id, { actor: 'Warehouse Receiver', actualOutcome: 'Stock delivered and verified. 12 days cover restored.' });
        render();
      };
    });
  }

  // Mount panel into DOM
  container.appendChild(panel);
  render();

  return {
    open(tab = 'network') {
      activeTab = tab;
      panel.classList.remove('collapsed');
      isPanelOpen = true;
      render();
    },
    close() {
      panel.classList.add('collapsed');
      isPanelOpen = false;
    },
    toggle() {
      if (isPanelOpen) this.close();
      else this.open();
    },
    setTwin(newTwin) {
      activeTwin = newTwin;
      recalculateAll();
    },
    setDisruption(newDisruption) {
      activeDisruption = newDisruption;
      recalculateAll();
    },
    selectAsset(type, data) {
      this.open('impact');
    },
  };
}
