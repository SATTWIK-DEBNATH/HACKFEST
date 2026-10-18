# Resilience Lens Design System & Theme Specification

The **Resilience Lens** visual theme restyles the Research Analysis Directorate (RAD) / God's Eye View interface into a cinematic spatial-intelligence operations environment inspired by high-end reconnaissance cockpits, aerospace avionics, and modern geospatial defense systems.

It delivers a dark, calm, expensive, precise, and immersive aesthetic while strictly preserving all existing layouts, component hierarchies, screen orientations, and interaction workflows.

---

## 1. Design Principles

- **Operational Calm**: Deep, non-reflective surfaces that minimize eye strain during long analytical sessions.
- **Signal-to-Noise Ratio**: Eliminates generic SaaS cards, neon gamer glow, saturated gradients, and rounded pills in favor of quiet, embedded operational readouts.
- **Epistemic Honesty**: Critical distinction between facts (`OBSERVED`), model projections (`INFERRED`), simulations (`SIMULATED`), and active disruption (`CRITICAL`) using explicit typography and calibrated semantic hues.
- **Spatial Subordination**: The Cesium 3D globe is the visual hero. Panels are subtle optical-glass sheets floating over the scene without obscuring the operational picture.

---

## 2. Color System Tokens

Defined centrally in `src/ui/styles/foundation.css` and exposed globally:

### Base Surfaces
| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--surface-base` / `--resilience-base` | `#070B0C` | Deep charcoal-black base viewport background |
| `--surface-elevated` / `--resilience-surface` | `#0D1516` | Primary elevated optical-glass panel surface |
| `--surface-secondary` / `--resilience-surface-secondary` | `#142021` | Secondary elevated surface, headers, active card wells |
| `--surface-border` / `--resilience-border` | `rgba(167, 215, 209, 0.18)` | Fine, low-contrast structural borders |
| `--resilience-border-subtle` | `rgba(167, 215, 209, 0.08)` | Internal dividers and table row borders |

### Primary Signals
| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--signal-cyan-muted` / `--resilience-signal-muted` | `#9CCFCA` | Muted sea-glass cyan; live stream indicators, calm telemetry |
| `--signal-cyan-active` / `--resilience-signal-active` | `#B6E4DE` | Strong active cyan; active sensors, high-priority telemetry |

### Strategic Accents
| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--accent-brass` / `--resilience-brass` | `#DEC38C` | Aged brass / sand; deliberate selections, approved actions |
| `--accent-brass-highlight` / `--resilience-brass-highlight` | `#E8CE9D` | Highlight brass; selected asset halo, active scenario focus |

### Operational States
| Token | Hex / Value | Semantic State & Meaning |
| :--- | :--- | :--- |
| `--state-healthy` / `--resilience-healthy` | `#9ED3BF` | Healthy / Confirmed state; nominal inventory, verified routes |
| `--state-warning` / `--resilience-warning` | `#E6C484` | Warning / Inferred; exposure risk, estimated time of arrival |
| `--state-critical` / `--resilience-critical` | `#EDB08A` | Critical / Disruption; warm orange, stockout breach, hazard cut |
| `--text-secondary` / `--resilience-neutral-text` | `#8FA8A6` | Neutral secondary text, metadata labels, unit tags |
| `--text-primary` | `#DDE6E5` | High-contrast readable body text (never pure white `#FFFFFF`) |

---

## 3. Typography & Numerals

- **Primary UI Sans**: Modern, clean sans-serif (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`) at medium weights (400–500) for high legibility without heavy bulk.
- **Monospace Telemetry**: Monospace typography (`ui-monospace`, `Consolas`, `SF Mono`, `Courier New`) reserved strictly for:
  - Geographic coordinates (`lat`, `lon`, `alt`, H3 indexes)
  - Timestamps, durations, and ETA projections
  - Confidence ratings and score percentages
  - Financial, inventory, and telemetry tabular numerals (`font-variant-numeric: tabular-nums`)
- **Metadata Labels**: Compact uppercase typography with restrained letter-spacing (`0.06em` to `0.08em`) for technical badges and state tags.

---

## 4. Optical-Glass Panels & Surfaces

- **Glassmorphic Materiality**:
  - `background: rgba(13, 21, 22, 0.88);`
  - `backdrop-filter: blur(12px);`
  - `border: 1px solid rgba(167, 215, 209, 0.18);`
  - Subtle internal edge highlight: `box-shadow: inset 0 1px 0 rgba(167, 215, 209, 0.08), 0 8px 32px rgba(0, 0, 0, 0.45);`
- **Corner Curvature**:
  - Lightly softened rectangular corners (`--panel-radius: 8px`, `--btn-radius: 6px`).
  - No bloated "pill" or gamer card radii.

---

## 5. Controls, Buttons & Interaction States

| Control Type | Resting State | Hover State | Selected / Active State |
| :--- | :--- | :--- | :--- |
| **Default Control** | Deep charcoal (`#0D1516`), subtle border (`rgba(167, 215, 209, 0.18)`), muted text (`#8FA8A6`) | Luminance lift (`#142021`), fine cyan edge (`rgba(156, 207, 202, 0.4)`) | Aged brass border (`#DEC38C`), sea-glass text |
| **Consequential Primary Action** (`.btn-primary`, `.btn-approve-action`) | Aged brass background (`#DEC38C`), near-black text (`#070B0C`), weight 600 | Highlight brass (`#E8CE9D`), slight shadow | Active press feedback, no neon pulsing |
| **Hazard / Danger Action** (`.btn-critical`) | Transparent background, warm-orange border (`#EDB08A`), warm-orange text | Restrained warm-orange background (`rgba(237, 176, 138, 0.15)`) | Subdued border lift, no loud red badges |

---

## 6. Map & Globe Integration

- **Atmospheric Reconnaissance Vignette**:
  - A subtle radial vignette overlay on the viewport edge (`#cesiumContainer::after`) provides cockpit canopy depth without obstructing navigation controls.
  - Radial gradient: `rgba(7, 11, 12, 0) 58%, rgba(7, 11, 12, 0.52) 88%, rgba(7, 11, 12, 0.82) 100%`.
  - Non-interactive (`pointer-events: none`) to preserve Cesium 3D camera pan/tilt/zoom.
- **Cesium 3D Entities**:
  - Facilities and route legs use the restrained operational palette:
    - Normal / Sea-glass Cyan: `#9CCFCA`
    - Manufacturing / Aged Brass: `#DEC38C`
    - Warehouse / Healthy Green: `#9ED3BF`
    - Supplier / Strong Cyan: `#B6E4DE`
    - Disruption Zone / Warm Orange: `#EDB08A`
    - Selected Asset Outline: Highlight Brass `#E8CE9D`
  - Complies strictly with the Cesium DOM overlay invariant (no `label:` entity graphics).

---

## 7. Motion & Accessibility

- **Subtle Transitions**: Micro-interactions timed strictly between 120ms and 180ms (`--transition-fast: 140ms`, `--transition-smooth: 180ms`).
- **Reduced Motion**: Full `@media (prefers-reduced-motion: reduce)` support instantly disables transitions, radar sweeps, and haze animations.
- **Accessibility & Contrast**:
  - Text-to-surface contrast meets WCAG AA standards (minimum 4.5:1 for body copy).
  - Every operational status pair displays an explicit semantic text label (`CONFIRMED`, `INFERRED`, `SIMULATED`, `CRITICAL`, `STALE`, `OBSERVED`) alongside its hue, ensuring information is never communicated through color alone.
