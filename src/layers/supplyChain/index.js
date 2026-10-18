/**
 * Supply Chain Digital Twin Cesium 3D Globe Layer
 *
 * Renders facilities, warehouses, ports, route legs, active shipments,
 * and H3 disruption zones directly on the 3D globe with interactive selection.
 *
 * @module layers/supplyChain
 */

import * as Cesium from 'cesium';
import { EPISTEMIC_STATUS } from '../../supplyChain/model.js';
import { h3CellToCoordinates } from '../../supplyChain/spatialIndex.js';

export const SUPPLY_CHAIN_LAYER_ID = 'supply-chain-twin';

const COLOR_CRITICAL = Cesium.Color.fromCssColorString('#ef4444');
const COLOR_HIGH = Cesium.Color.fromCssColorString('#f59e0b');
const COLOR_NORMAL = Cesium.Color.fromCssColorString('#06b6d4');
const COLOR_SIMULATED = Cesium.Color.fromCssColorString('#10b981');
const COLOR_PORT = Cesium.Color.fromCssColorString('#3b82f6');
const COLOR_MFG = Cesium.Color.fromCssColorString('#a855f7');
const COLOR_WAREHOUSE = Cesium.Color.fromCssColorString('#10b981');
const COLOR_SUPPLIER = Cesium.Color.fromCssColorString('#06b6d4');

/**
 * Creates the Supply Chain Twin 3D globe layer
 */
export function createSupplyChainLayer({ twin = null, onSelectAsset = null } = {}) {
  let _viewer = null;
  let _dataSource = null;
  let _enabled = false;
  let _twin = twin;
  let _activeDisruption = null;
  let _activeScenario = null;
  let _selectedAssetId = null;
  let _clickHandler = null;

  function renderEntities() {
    if (!_dataSource || !_viewer) return;
    _dataSource.entities.removeAll();

    if (!_twin) return;

    const affectedFacIds = new Set(
      _activeDisruption?.affectedFacilityIds || []
    );
    const affectedLegIds = new Set(
      _activeDisruption?.affectedRouteLegIds || []
    );

    // 1. Render Disruption H3 Cells & Hazard Zone
    if (_activeDisruption) {
      const hazardColor = COLOR_CRITICAL.withAlpha(0.28);
      const hazardOutline = COLOR_CRITICAL.withAlpha(0.85);

      // Render circular perimeter
      _dataSource.entities.add({
        id: `disruption-zone-${_activeDisruption.id}`,
        name: _activeDisruption.name,
        position: Cesium.Cartesian3.fromDegrees(_activeDisruption.longitude, _activeDisruption.latitude),
        ellipse: {
          semiMinorAxis: (_activeDisruption.radiusKm || 50) * 1000,
          semiMajorAxis: (_activeDisruption.radiusKm || 50) * 1000,
          material: hazardColor,
          outline: true,
          outlineColor: hazardOutline,
          outlineWidth: 2,
        },
        description: `Disruption: ${_activeDisruption.name} (${_activeDisruption.source})`,
        _scType: 'disruption',
        _scData: _activeDisruption,
      });

      // Render H3 cells if available
      if (Array.isArray(_activeDisruption.h3Cells)) {
        for (const cell of _activeDisruption.h3Cells.slice(0, 48)) {
          const coords = h3CellToCoordinates(cell);
          if (coords.length >= 3) {
            const flat = coords.flatMap(([lon, lat]) => [lon, lat]);
            _dataSource.entities.add({
              id: `h3-cell-${cell}`,
              polygon: {
                hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(flat)),
                material: COLOR_HIGH.withAlpha(0.18),
                outline: true,
                outlineColor: COLOR_HIGH.withAlpha(0.65),
                outlineWidth: 1,
              },
              _scType: 'h3Cell',
            });
          }
        }
      }
    }

    // 2. Render Facilities
    for (const fac of _twin.facilities || []) {
      const isAffected = affectedFacIds.has(fac.id);
      const isSelected = _selectedAssetId === fac.id;

      let color = COLOR_NORMAL;
      if (fac.type === 'port') color = COLOR_PORT;
      else if (fac.type === 'manufacturing') color = COLOR_MFG;
      else if (fac.type === 'warehouse') color = COLOR_WAREHOUSE;
      else if (fac.type === 'supplier') color = COLOR_SUPPLIER;

      if (isAffected) color = COLOR_CRITICAL;

      const position = Cesium.Cartesian3.fromDegrees(fac.longitude, fac.latitude, 50);

      // Primary Point
      _dataSource.entities.add({
        id: `facility-${fac.id}`,
        name: fac.name,
        position,
        point: {
          pixelSize: isSelected ? 18 : isAffected ? 15 : 12,
          color,
          outlineColor: isSelected ? Cesium.Color.WHITE : isAffected ? COLOR_CRITICAL : Cesium.Color.BLACK,
          outlineWidth: isSelected ? 3 : 2,
        },
        _scType: 'facility',
        _scData: fac,
      });

      // Halo for affected facilities
      if (isAffected) {
        _dataSource.entities.add({
          id: `facility-halo-${fac.id}`,
          position,
          ellipse: {
            semiMinorAxis: 18000,
            semiMajorAxis: 18000,
            material: COLOR_CRITICAL.withAlpha(0.25),
            outline: true,
            outlineColor: COLOR_CRITICAL.withAlpha(0.8),
            outlineWidth: 1.5,
          },
          _scType: 'halo',
        });
      }
    }

    // 3. Render Route Legs
    for (const leg of _twin.routeLegs || []) {
      if (!Array.isArray(leg.geometry) || leg.geometry.length < 2) continue;
      const isAffected = affectedLegIds.has(leg.id);
      const isSelected = _selectedAssetId === leg.id;

      const flat = leg.geometry.flatMap(([lon, lat]) => [lon, lat]);
      const positions = Cesium.Cartesian3.fromDegreesArray(flat);

      const lineColor = isAffected
        ? COLOR_CRITICAL
        : leg.geometrySource === 'simulated'
          ? COLOR_SIMULATED
          : Cesium.Color.fromCssColorString('#06b6d4');

      _dataSource.entities.add({
        id: `route-leg-${leg.id}`,
        name: `Route: ${leg.origin} → ${leg.destination}`,
        polyline: {
          positions,
          width: isSelected ? 5 : isAffected ? 4 : 2.5,
          material: isAffected
            ? new Cesium.PolylineDashMaterialProperty({
                color: COLOR_CRITICAL,
                gapColor: Cesium.Color.BLACK.withAlpha(0.3),
                dashLength: 20,
              })
            : lineColor.withAlpha(0.85),
          clampToGround: leg.mode === 'road',
        },
        _scType: 'routeLeg',
        _scData: leg,
      });
    }

    // 4. Render Active Simulated Recovery Leg if selected
    if (_activeScenario?.simulatedLeg?.geometry) {
      const simFlat = _activeScenario.simulatedLeg.geometry.flatMap(([lon, lat]) => [lon, lat]);
      _dataSource.entities.add({
        id: `recovery-leg-${_activeScenario.id}`,
        name: `Recovery Lane: ${_activeScenario.name}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(simFlat),
          width: 4.5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: COLOR_SIMULATED,
            gapColor: Cesium.Color.BLACK.withAlpha(0.2),
            dashLength: 16,
          }),
        },
        _scType: 'recoveryLeg',
        _scData: _activeScenario,
      });
    }
  }

  const layer = {
    id: SUPPLY_CHAIN_LAYER_ID,
    name: 'Supply Chain Twin',
    icon: '🚢',
    source: 'RAD Multi-Tier Twin',
    updateInterval: 30000,

    init(viewer) {
      if (_viewer) return;
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource(SUPPLY_CHAIN_LAYER_ID);
      _dataSource.show = false;
      viewer.dataSources.add(_dataSource);
      _enabled = false;

      // Click picking for interactive inspection
      _clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      _clickHandler.setInputAction((click) => {
        if (!_enabled) return;
        const picked = viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id?._scType) {
          const type = picked.id._scType;
          const data = picked.id._scData;
          _selectedAssetId = data?.id || null;
          renderEntities();
          if (typeof onSelectAsset === 'function') {
            onSelectAsset(type, data);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      console.log('[Data:SupplyChain] Layer Initialized');
    },

    enable(viewer) {
      _enabled = true;
      if (_dataSource) _dataSource.show = true;
      renderEntities();
    },

    disable(viewer) {
      _enabled = false;
      if (_dataSource) _dataSource.show = false;
    },

    setTwin(twin) {
      _twin = twin;
      if (_enabled) renderEntities();
    },

    setDisruption(disruption) {
      _activeDisruption = disruption;
      if (_enabled) renderEntities();
    },

    setScenario(scenario) {
      _activeScenario = scenario;
      if (_enabled) renderEntities();
    },

    flyToAsset(asset) {
      if (!_viewer || !asset) return;
      const lat = Number(asset.latitude);
      const lon = Number(asset.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        _viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 250000),
          duration: 1.5,
        });
      }
    },

    destroy() {
      if (_clickHandler) {
        _clickHandler.destroy();
        _clickHandler = null;
      }
      if (_viewer && _dataSource) {
        _viewer.dataSources.remove(_dataSource, true);
        _dataSource = null;
      }
      _viewer = null;
    },
  };

  return layer;
}
