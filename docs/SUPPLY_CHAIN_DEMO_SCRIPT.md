# Supply Chain Resilience Command Center — Operator Demo Script

This script walks an operator, executive, or evaluator through the explainable resilience workflow in RAD, satisfying all 9 demo acceptance criteria.

---

## Prerequisites
- Node.js environment with Vite dev server:
  ```bash
  npm run dev
  ```
- Open browser at `http://localhost:5173`.
- Press `Alt+R` or click the **RESILIENCE** icon in the bottom command dock or context rail.

---

## Step-by-Step Demo Flow

### Step 1: Open RAD at a Disruption
1. Launch the application.
2. In the top-right Resilience Panel header, observe the **Disruption Scenario** selector:
   - `Super Typhoon Gaemi (Taiwan Strait)` [Default active]
   - `M6.4 Kansai Seismic Event (Japan)`
   - `Port of LA / Long Beach Congestion`
3. The Cesium 3D globe immediately flies to or centers on the active disruption zone in the Taiwan Strait (Lat 23.5°N, Lon 119.5°E).

### Step 2: Inspect Disruption Source & Freshness
1. Click on the **Impact** tab in the Resilience Panel.
2. Under **Active Disruption Trigger**, observe:
   - **Hazard**: Super Typhoon Gaemi
   - **Severity**: Extreme (Category 4 Cyclonic System)
   - **Source**: `PDC_DISASTER_AWARE_LIVE`
   - **Freshness**: 12 mins ago
   - **Data Confidence**: 0.95 (High Confidence)
   - **Epistemic Badge**: `OBSERVED`

### Step 3: Highlight Affected Facilities, Route Legs, and Shipments
1. In the **Impact** tab, examine the **Blast-Radius & Exposed Assets** table:
   - **Exposed Facilities**:
     - `fac-taoyuan-pack` (Taoyuan Packaging, Taiwan) — Category: Supplier / Packaging. Direct geographic proximity to typhoon path.
   - **Exposed Maritime Route Legs**:
     - `leg-1002-1` (Kaohsiung → Singapore) — Route leg intersects typhoon core hazard perimeter (H3 discrete grid cells highlighted on globe).
   - **Disrupted Shipments**:
     - `shp-1002` (Carrier: Evergreen Marine, 10,000 units of MCU-900). Status: `DISRUPTED`.
2. On the globe, observe:
   - Disrupted route `leg-1002-1` rendered as an amber dashed polyline across the Taiwan Strait.
   - Facility `fac-taoyuan-pack` rendered with an animated warning halo.
   - Multi-resolution H3 spatial grid polygons rendered over the hazard footprint.

### Step 4: Show Critical Product Inventory Cover < 5 Days
1. Look at the **Inventory Stockout Projection** card:
   - Product: **Apex Core MCU-900 Industrial** (`prod-mcu-900`)
   - Criticality: `CRITICAL`
   - Facility: Singapore Precision Assembly (`fac-sg-assembly`)
   - Daily Consumption: 1,250 units/day
   - Usable Stock: 4,000 units (8,000 total - 4,000 reserved)
   - **Days of Inventory Cover**: **3.2 Days** (< 5.0 Day Safety Margin — `CRITICAL_ALERT`)
   - **Estimated Stockout Date**: T+3.2 Days (Factory assembly lines face shutdown before delayed maritime shipment arrives).

### Step 5: Simulate Recovery Options
1. Click the **Simulate Recovery** button or navigate to the **Recovery** tab.
2. The deterministic optimization engine evaluates and displays 4 actionable recovery archetypes:
   - **Option 1 (Reroute)**: Divert maritime carrier via East Pacific / Luzon Strait bypass to Port of Singapore.
   - **Option 2 (Transfer)**: Urgent inter-warehouse air/express transfer of 2,500 units from Changi Regional Hub.
   - **Option 3 (Split)**: Allocate 50% purchase order volume to qualified Tier-2 alternate supplier (Yokohama Precision Silicon).
   - **Option 4 (Expedite)**: Emergency air charter from Taipei Taoyuan to Singapore Changi.

### Step 6: Recommend One Option with Transparent Trade-Offs & Confidence
1. Observe the **RECOMMENDED** badge on **Option 1 (Maritime Bypass)**:
   - **Expected Delay**: +1.5 days (vs +7.0 days if waiting out the storm).
   - **Estimated Cost**: +$18,500 USD (Bunker fuel adjustment).
   - **Inventory Days Protected**: **+12.0 Days** (Arrives at T+2.5 days, preventing stockout).
   - **Carbon Estimate**: 24.2 tCO2e.
   - **Feasibility Reason**: Feasible. Vessel has 24 knot capacity; Luzon corridor is outside 35-knot wind radius.
   - **Data Confidence**: 89% (`OBSERVED` AIS + `INFERRED` nautical corridor).
2. Contrast with **Option 2 (Inventory Transfer)**:
   - Feasible, but only protects 2.0 days of cover.
3. Click the **Evidence** button on the recommended card:
   - Inspect the **Evidence Drawer** showing:
     - Component Score Breakdown: $\text{Severity } 0.95 \times \text{Exposure } 0.88 \times \text{Criticality } 0.95 \times \text{Difficulty } 0.70 \times \text{Confidence } 0.92 = 0.511$.
     - Explicit assumptions: Port of Singapore berth availability unconstrained.
     - Graph path: `Gaemi → leg-1002-1 → shp-1002 → prod-mcu-900 → fac-sg-assembly`.

### Step 7: Approve Recommendation & Assign Owner
1. Click **Approve Action** on the recommended scenario card.
2. An **Action Approval Modal** opens:
   - Preset Owner: `Logistics Operations Lead`
   - Approval Authority: `Director of Global Supply Chain Operations`
   - Approval Rationale: `Avoids assembly line stoppage at Singapore fab. Feasible bypass route.`
3. Click **Confirm Approval & Record in Ledger**.

### Step 8: View Action in Ledger with Evidence & Expected Outcome
1. Navigate to the **Ledger** tab.
2. Observe the newly created immutable action card:
   - **ID**: `act-...`
   - **Status**: `approved` (Green badge)
   - **Owner**: `Logistics Operations Lead`
   - **Timestamp**: Exact UTC approval moment
   - **Expected Outcome**: Delay +1.5d, Cost +$18,500 USD, Days Protected +12.0d.
   - **Audit Timeline**: Shows initial creation followed immediately by `approved` transition with signed actor.
3. Click **View Evidence**: The Evidence Drawer re-opens directly from the ledger, proving complete end-to-end traceability from the initial typhoon hazard to the final recorded decision.

---

## Step 9: Acceptance Verification Summary
| Criterion | Verified Module | Status |
|---|---|---|
| 1. Open RAD at disruption | `demoData.js`, `resiliencePanel.js` | PASS |
| 2. Disruption source & freshness visible | `impactEngine.js`, `resiliencePanel.js` | PASS |
| 3. Highlight affected facilities, routes, shipments | `spatialIndex.js`, `supplyChainLayer.js` | PASS |
| 4. Critical product inventory cover < 5 days (3.2d) | `demoData.js`, `impactEngine.js` | PASS |
| 5. Simulate >= 3 recovery options (4 evaluated) | `recoveryEngine.js` | PASS |
| 6. Recommend one option with trade-offs & confidence | `recoveryEngine.js`, `resiliencePanel.js` | PASS |
| 7. Approve recommendation and assign owner | `actionLedger.js`, `resiliencePanel.js` | PASS |
| 8. Show action in ledger with immutable audit | `actionLedger.js`, `resiliencePanel.js` | PASS |
| 9. Evidence drawer with source, graph, and assumptions | `resiliencePanel.js` | PASS |
