# Research Analysis Directorate (RAD) — Supply Chain Resilience Command Center

An industry-grade, explainable supply chain resilience command center built on top of the Research Analysis Directorate (RAD) 3D geospatial intelligence console.

Turn real-world disruptions visible on the globe into evidence-backed operational decisions:
$$\text{Hazard} \longrightarrow \text{Exposed Facilities / Routes / Shipments} \longrightarrow \text{Product \& Inventory Impact} \longrightarrow \text{Recovery Scenarios} \longrightarrow \text{Approved Action} \longrightarrow \text{Measured Outcome}$$

---

## 🌐 Overview & Core Capabilities

The RAD Resilience Command Center equips supply chain directors, logistics controllers, and crisis response teams with an interactive 3D digital twin of their end-to-end supply chain network. When physical hazards occur, RAD calculates exact spatial exposure, traces multi-tier dependency propagation, projects inventory stockouts, simulates actionable recovery alternatives, and records approved decisions in an immutable audit ledger.

### Key Modules:
- **Supply Chain Digital Twin**: Normalized graph model representing Facilities (manufacturing, warehouses, suppliers, ports), Products, Inventory Positions, Consignments/Shipments, and Intermodal Route Legs.
- **GS1 EPCIS 2.0 Traceability**: Internal event engine standardizing WHAT, WHEN, WHERE, WHY, HOW, and PROVENANCE concepts across logistics nodes.
- **Exposure & Impact Engine**: Pure, deterministic geofencing utilizing Uber H3 discrete global grid indexing ($res \text{ } 4\text{--}7$) and transparent component scoring:
  $$\text{Impact} = \text{Hazard Severity} \times \text{Asset Exposure} \times \text{Business Criticality} \times \text{Recovery Difficulty} \times \text{Data Confidence}$$
- **Recovery Scenario Engine**: Heuristic decision-support solver evaluating four actionable archetypes:
  1. *Reroute Shipment* (alternate maritime or intermodal corridor)
  2. *Transfer Inventory* (lateral stock transfer from surplus warehouse)
  3. *Split Supply Order* (dual-sourcing across qualified Tier-2 alternate suppliers)
  4. *Expedite Freight* (emergency air charter conversion)
- **Action Ledger & Audit Trail**: Immutable state tracking (`pending` $\to$ `approved` $\to$ `executing` $\to$ `completed` / `rejected`) with assigned operational owners and cryptographic evidence drawers.
- **Enterprise Integrations**: Interface boundaries and adapters for Apache Kafka, Apache Camel, Eclipse Dataspace Components (EDC), OpenTelemetry, PM4Py process mining, and OpenLMIS.

---

## 🗺️ Geospatial Environment & Layer Infrastructure

Twenty layers and map sources. **Eighteen have a keyless path.**

- **Sits on the real ground.** Entity heights are aligned to work with Google 3D tiles, so aircraft park on aprons and cameras stand on street corners instead of floating.
- **Live Environmental Hazards**: Real-time cyclonic tracking, USGS seismic telemetry, and NASA FIRMS thermal anomaly detection.
- **Vessel & Flight Context**: Live maritime AIS positions and ADS-B flight tracks provide real-world context for supply chain corridors.
- **Spatial Grid Aggregation**: Multi-resolution Uber H3 cells compute and render dynamic hazard heatmaps.
- DISPLAY ▸ **Draw** annotations, boundary markers, and measurement tools allow operators to mark corridors directly on the Cesium ellipsoid without exporting external geometry.

---

## ⚡ Quickstart

### Prerequisites
- Node.js >= 24.14.0
- Modern Chromium or WebGL2-compatible browser

### Installation & Launch
```bash
# Clone the repository
git clone https://github.com/SATTWIK-DEBNATH/HACKFEST.git
cd HACKFEST

# Install dependencies (including h3-js and Cesium)
npm install

# Start the local development server
npm run dev
```

Visit `http://localhost:5173` to launch the RAD Resilience Command Center. Press `Alt+R` or click **RESILIENCE** in the bottom command dock to open the operations panel.

---

## 🧪 Testing & Verification

Run the comprehensive unit test suite:
```bash
# Run supply chain resilience test suite (27 tests)
node --test src/supplyChain/*.test.mjs

# Run package boundary and module ownership checks
npm run check:boundaries

# Run production build
npm run build
```

---

## 📚 Technical Documentation

- [Architecture & Technical Specification](docs/SUPPLY_CHAIN_ARCHITECTURE.md): Complete system overview, data flow diagrams, mathematical formulas, and integration boundaries.
- [Data Dictionary](docs/SUPPLY_CHAIN_DATA_DICTIONARY.md): Complete schema definitions for Facility, Supplier, Product, InventoryPosition, Shipment, RouteLeg, and Action entities.
- [Operator Demo Script](docs/SUPPLY_CHAIN_DEMO_SCRIPT.md): Step-by-step verification walkthrough demonstrating the end-to-end hazard-to-action workflow.

---

## 🔒 Security & Privacy

RAD operates on an epistemic classification model:
- `OBSERVED`: Direct telemetry, ERP facts, or verified sensor readings.
- `INFERRED`: Derived via spatial geofencing or dependency path traversal.
- `SIMULATED`: Hypothetical intervention output.
- `UNKNOWN`: Visibly missing commercial data (never synthesized or hallucinated).
- `STALE`: Data whose age exceeds configured TTL.

All partner data and commercial shipment records maintain policy-controlled boundaries conforming to Eclipse Dataspace standards.
