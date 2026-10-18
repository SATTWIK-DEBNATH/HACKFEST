# Supply Chain Resilience Command Center — Architecture & Technical Specification

## 1. System Overview

The **Supply Chain Resilience Command Center** extends the Research Analysis Directorate (RAD) real-time 3D geospatial intelligence console into an explainable, multi-tier supply chain digital twin.

It combines:
- **3D Geospatial Twin**: Visualizes global supplier networks, manufacturing hubs, distribution warehouses, ports, intermodal route legs, and active shipments on a photorealistic 3D Cesium globe.
- **Exposure & Impact Engine**: Pure, deterministic geofencing and H3 discrete global grid indexing that maps physical hazards (typhoons, earthquakes, wildfires, port congestion) to exposed assets and traces blast-radius dependencies.
- **Recovery Scenario Engine**: Heuristic decision-support solver evaluating rerouting, inventory transfer, supplier order splitting, and freight expediting with multi-objective trade-offs.
- **Action Ledger & Audit Trail**: Immutable state ledger tracking actions from proposal through approval, execution, and completion.
- **Enterprise Integrations**: Native standards alignment with GS1 EPCIS 2.0, Apache Kafka, Apache Camel, Eclipse Dataspace Components, OpenTelemetry, PM4Py, and OpenLMIS.

---

## 2. Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                        RAD Geospatial Console (Browser UI)                        |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   Cesium 3D Globe  |  |  Resilience Command  |  |     Evidence Drawer       |  |
|  |  - Facilities      |  |  - Network Health    |  |  - Provenance & Signal    |  |
|  |  - Route Legs      |  |  - Impact Scoring    |  |  - Dependency Graph Path  |  |
|  |  - H3 Hazard Cells |  |  - Recovery Scenarios|  |  - Calculation Inputs     |  |
|  |  - Active Carriers |  |  - Action Ledger     |  |  - Explicit Assumptions   |  |
|  +---------^----------+  +----------^-----------+  +-------------^-------------+  |
+------------|------------------------|----------------------------|----------------+
             |                        |                            |
+------------+------------------------+----------------------------+----------------+
|                        Supply Chain Digital Twin Core                             |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |    Domain Model    |  |  Exposure & Impact   |  |      Recovery Engine      |  |
|  |  - Facilities      |  |  - H3 Spatial Grid   |  |  - Reroute Shipment       |  |
|  |  - Suppliers       |  |  - Geofencing        |  |  - Transfer Inventory     |  |
|  |  - Products        |  |  - Route Intersection|  |  - Split Supplier Order   |  |
|  |  - Inventory (DoC) |  |  - Dependency Graph  |  |  - Expedite Freight       |  |
|  |  - Shipments       |  |  - Component Scoring |  |  - OR-Tools Boundary      |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   Action Ledger    |  |   EPCIS 2.0 Event    |  |    Data Ingestion         |  |
|  |  - State Lifecycle |  |  - ObjectEvent       |  |  - CSV Importer & Mapping |  |
|  |  - Immutable Audit |  |  - CBV Steps & Disps |  |  - JSON Twin Schema       |  |
|  |  - Outcome Tracking|  |  - OpenEPCIS Boundary|  |  - Validation Diagnostics |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------+
                                      |
+-------------------------------------v---------------------------------------------+
|                        Enterprise Integration Layer                               |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |    Apache Kafka    |  |     Apache Camel     |  |    Eclipse Dataspace      |  |
|  |  - Telemetry Topics|  |  - EIP Ingestion     |  |  - Sovereign B2B Sharing  |  |
|  |  - Event Stream    |  |  - SAP/EDI Pipelines |  |  - ODRL Policy Contracts  |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   OpenTelemetry    |  |  PM4Py Process Mining|  |    OpenLMIS Cold-Chain    |  |
|  |  - Traces & Spans  |  |  - Bottleneck Mining |  |  - Excursion Tracking     |  |
|  |  - Latency Metrics |  |  - AGPL-3.0 Isolated |  |  - Vaccine Requisitions   |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Epistemic Classification Framework

To eliminate "hallucinated certainty", every data point, calculation, and visual entity is classified according to its epistemic origin:

| Epistemic Tag | Meaning | Visual Treatment | Operational Use |
| :--- | :--- | :--- | :--- |
| **`OBSERVED`** | Directly measured or ingested fact from an authoritative external system (e.g. ERP inventory reading, USGS seismic telemetry). | Cyan badge / solid marker | Hard factual constraint. |
| **`INFERRED`** | Causally derived or propagated consequence (e.g. delayed arrival time resulting from an upstream berth congestion). | Amber badge / warning border | Probabilistic delay estimate. |
| **`SIMULATED`** | Synthetic scenario alternative or prospective recovery proposal generated by the optimization engine. | Emerald badge / dashed lane | Decision-support recommendation. |
| **`UNKNOWN`** | Field missing from commercial feed; visibly withheld rather than fabricated. | Slate/grey badge | Lowers overall score confidence. |
| **`STALE`** | Ingested observation whose age exceeds the freshness SLA threshold (e.g. >24h old). | Crimson badge | Requires telemetry refresh. |

---

## 4. Component Impact Scoring Engine

Rather than an opaque single machine-learning score, RAD implements **Transparent Component Scoring**:

$$\text{Impact Score} = \text{Hazard Severity} \times \text{Exposure} \times \text{Business Criticality} \times \text{Recovery Difficulty} \times \text{Data Confidence}$$

Where:
1. **Hazard Severity ($0.1 - 1.0$)**: Physical magnitude of the disruption (e.g. Category 4 Cyclone $= 0.88$; M6.4 Earthquake $= 0.82$; Port Congestion $= 0.74$).
2. **Spatial Exposure ($0.0 - 1.0$)**: Geometrical proximity:
   - $1.0$: Direct geofence containment of a supplier or manufacturing plant.
   - $0.8$: Intersection with an in-transit route leg.
   - $0.4$: Buffer zone adjacency.
3. **Business Criticality ($0.25 - 1.0$)**: Criticality of affected product lines:
   - `critical` $= 1.0$ (single-point-of-failure semiconductor).
   - `high` $= 0.75$ (precision optical sensor).
   - `medium` $= 0.5$ (custom PCB substrate).
   - `low` $= 0.25$ (mechanical housing).
4. **Recovery Difficulty ($0.2 - 1.0$)**: Ease of alternative fulfillment:
   - $1.0$: Single-sourced with no approved alternate supplier and no secondary route.
   - $0.65$: Alternate maritime route available.
   - $0.55$: Alternate approved supplier qualified.
   - $0.30$: Multi-sourced with available standby allocation.
5. **Data Confidence ($0.5 - 1.0$)**: Penalized by $-0.05$ for every missing commercial attribute (unknown carrier, unknown facility owner, missing capacity).

The raw product is scaled to a standard $0 - 100$ rating:
- **$\ge 45$**: **CRITICAL** (Requires executive approval within 4 hours)
- **$25 - 44$**: **HIGH** (Requires dispatch reallocation)
- **$12 - 24$**: **MODERATE** (Monitored buffer)
- **$< 12$**: **LOW** (Nominal exposure)

---

## 5. Discrete Global Grid Spatial Indexing (Uber H3)

RAD isolates spatial operations in `src/supplyChain/spatialIndex.js` using `h3-js`:
- Facilities are indexed at **H3 Resolution 6** (average hexagon edge length $\sim 3.2\text{ km}$) for instant spatial hash lookups.
- Hazard zones are discretized at **H3 Resolution 5** (edge length $\sim 8.5\text{ km}$) via `gridDisk` expansion matching the hazard's physical radius.
- Route leg polylines are discretized into segment bounding boxes and tested using equirectangular projection distance to avoid spherical edge-case artifacts.
- Multi-hazard heatmaps aggregate simultaneous risks into a normalized spatial density grid.

---

## 6. Recovery Scenario Engine & Optimization Boundary

The recovery engine evaluates 4 distinct operational archetypes:
1. **Reroute Shipment**: Replaces a disrupted leg with a planned alternate route or diverted port call (e.g. Port of Seattle bypass).
2. **Transfer Inventory**: Identifies surplus warehouse nodes with $>10$ days of cover and redistributes stock to stockout-threatened nodes via express freight.
3. **Split Supplier Order**: Reallocates unfulfilled procurement volume across pre-qualified alternate suppliers (e.g. 60% Kyoto / 40% Yokohama).
4. **Expedite Freight**: Mode-shifts ocean cargo to air cargo charter, reducing transit from 14 days to 24 hours.

### Pluggable Optimization Architecture (Google OR-Tools)
While RAD implements a deterministic multi-objective heuristic client-side, the engine defines a clean `OptimizationServiceAdapter` interface:
```typescript
interface OptimizationServiceAdapter {
  solve(context: {
    disruption: Disruption;
    impact: ImpactResult;
    twin: SupplyChainTwin;
    constraints: OperationalConstraints;
  }): Promise<OptimizationSolution>;
}
```
In high-scale enterprise environments, this adapter connects via gRPC to a Python backend service running Google OR-Tools Mixed-Integer Programming (MIP) or Constraint Programming (CP-SAT) solvers.

---

## 7. Action Ledger Lifecycle & Audit Trail

Operational interventions follow an immutable state transition lifecycle:
$$\text{Pending} \longrightarrow \text{Approved} \longrightarrow \text{Executing} \longrightarrow \text{Completed}$$
$$\text{Pending / Approved / Executing} \longrightarrow \text{Rejected}$$

- **Validation**: Illegal transitions (e.g. jumping from `pending` directly to `completed`, or modifying a `completed` action) throw strict validation errors.
- **Audit Trail**: Every state mutation appends an entry `{ timestamp, state, actor, details }`. Existing audit entries are frozen and can never be modified or deleted.

---

## 8. Trust, Privacy & Safety Architecture

1. **AIS / Vessel Telemetry Context**: Live AIS vessel tracking from satellite/terrestrial feeds is treated strictly as **contextual geography**. RAD **never asserts that a vessel carries a commercial shipment** unless an explicit bill-of-lading or shipment-to-vessel reference was supplied by the customer or carrier EDI feed.
2. **Hazard Signals vs Business Reality**: Weather advisories and earthquakes are classified as **exposure signals**, not guaranteed business stoppages. Physical inspection confirmations are marked with distinct epistemic badges.
3. **PM4Py AGPL-3.0 Licence Isolation**: PM4Py is distributed under GNU AGPL-3.0. To preserve RAD's MIT/permissive licence, **PM4Py code is never linked or bundled in-process**. Process mining integration operates strictly across an external, decoupled HTTP/REST microservice boundary.
4. **Sovereignty & Dataspace Policies**: Partner data access is governed through Eclipse Dataspace Components (EDC) using ODRL usage contracts and explicit classifications (`PUBLIC`, `INTERNAL`, `RESTRICTED_PARTNER`, `HIGHLY_CONFIDENTIAL`).
