import { createStandaloneCatalog } from './catalog.js';
import { createStandalonePlaceSearch } from './placeSearch.js';
import { CITY_POIS } from '../cityPois.js';
import { createApplication } from '../app/application.js';
import { createStandaloneScene } from './scene.js';
import { createStandaloneControls } from './controls.js';
import { createStandaloneData } from './data.js';
import { createStandaloneTools } from './tools.js';
import { resolveLocale, applyDocumentLanguage } from '../i18n/locale.js';
import { applyDocumentTranslations, setLocale } from '../i18n/index.js';
import { createGoogleTokenSource } from '../maps/googleTokens.js';
import { createResiliencePanel } from '../ui/resiliencePanel.js';
import { createWorldIntelligencePanel } from '../ui/worldIntelligencePanel.js';
import { createSupplyChainLayer } from '../layers/supplyChain/index.js';

// The existing controls and layer catalog contain page-scoped state.
let constructed = false;

/** Compose the standalone application once per page. Reload to start again. */
export function createStandaloneApplication({
  googleApiKey,
  cesiumToken,
  geospatial = {},
  voice = {},
  sources = {},
  streetLevelProviders,
  allowQaRegistration = false,
}) {
  if (constructed)
    throw new Error('The standalone application already owns this page');
  constructed = true;
  // Locale is resolved before any UI initialization so <html lang>/<html dir>
  // and every catalog lookup agree from the first painted frame. Module
  // scripts execute after parsing, so the DOM is ready here and every
  // data-i18n* element honors the resolved locale without a reload.
  const activeLocale = resolveLocale();
  setLocale(activeLocale);
  applyDocumentLanguage(document, activeLocale);
  applyDocumentTranslations(document);
  const loadingScreen = document.getElementById('loading-screen');
  const loaderStatus = loadingScreen.querySelector('.loader-status');
  let placeSearch;
  let catalog;
  return createApplication({
    createScene: async (context) => {
      placeSearch = createStandalonePlaceSearch({
        // The bundled city and landmark data the offline name provider reads.
        // The search package takes it as plain data rather than importing it,
        // so it stays free of application state.
        presets: CITY_POIS,
        ...geospatial,
        resolveApiKey: () => googleApiKey,
        signal: context.signal,
      });
      const scene = await createStandaloneScene({
        ...context,
        googleApiKey,
        // Without a key, Google 3D can still load with tokens from the
        // app's server when it offers them.
        googleTokens: googleApiKey ? null : createGoogleTokenSource(),
        cesiumToken,
        loaderStatus,
      });
      catalog = createStandaloneCatalog({
        sources,
        streetLevelProviders,
        nepalBoundaryResolver: (signal) =>
          scene.operations.annotationResolver.resolveRegionRingForQuery(
            'Nepal',
            signal,
            placeSearch,
            // The locator draws the border whenever it arrives.
            { budgetMs: Infinity },
          ),
        signal: context.signal,
        surface: scene.operations.surface,
      });
      return scene;
    },
    createControls: (context) => {
      const controls = createStandaloneControls({
        ...context,
        loaderStatus,
        placeSearch,
        catalog,
      });

      // Initialize the Supply Chain 3D globe layer
      let resiliencePanel = null;
      const supplyChainLayer = createSupplyChainLayer({
        onSelectAsset: (type, data) => {
          if (resiliencePanel) resiliencePanel.open('impact');
        },
      });
      if (context.scene?.viewer) {
        supplyChainLayer.init(context.scene.viewer);
        supplyChainLayer.enable(context.scene.viewer);
      }

      resiliencePanel = createResiliencePanel({ supplyChainLayer, container: document.body });

      // Initialize World Intelligence & Threat Radar (WorldMonitor integration)
      const worldIntelPanel = createWorldIntelligencePanel({
        viewer: context.scene?.viewer,
        container: document.body
      });

      // Wire top-center HUD pill trigger for World Intel
      const intelTopTrigger = document.getElementById('intel-top-trigger');
      if (intelTopTrigger) {
        intelTopTrigger.addEventListener('click', () => worldIntelPanel.toggle());
      }

      // Wire command dock trigger for World Intel
      const intelDockTrigger = document.getElementById('intel-dock-trigger');
      if (intelDockTrigger) {
        intelDockTrigger.addEventListener('click', () => worldIntelPanel.toggle());
      }

      // Synchronize trigger visual states with intel panel open/close
      worldIntelPanel.onToggleState((isOpen) => {
        if (intelTopTrigger) intelTopTrigger.classList.toggle('active', isOpen);
        if (intelDockTrigger) intelDockTrigger.classList.toggle('active', isOpen);
      });

      // Alt+I shortcut for World Intelligence Radar
      window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'i' || e.key === 'I')) {
          e.preventDefault();
          worldIntelPanel.toggle();
        }
      });

      // Wire top-center HUD pill trigger
      const topTrigger = document.getElementById('resilience-top-trigger');
      if (topTrigger) {
        topTrigger.addEventListener('click', () => resiliencePanel.toggle());
      }

      // Wire command dock trigger
      const dockTrigger = document.getElementById('resilience-dock-trigger');
      if (dockTrigger) {
        dockTrigger.addEventListener('click', () => resiliencePanel.toggle());
      }

      // Wire context mode button
      const contextModeBtn = document.getElementById('global-context-resilience-btn');
      if (contextModeBtn) {
        contextModeBtn.addEventListener('click', () => resiliencePanel.open());
      }

      // Synchronize trigger visual states with panel open/close
      resiliencePanel.onToggleState((isOpen) => {
        if (topTrigger) topTrigger.classList.toggle('active', isOpen);
        if (dockTrigger) dockTrigger.classList.toggle('active', isOpen);
      });

      // Alt+R shortcut
      window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'r' || e.key === 'R')) {
          e.preventDefault();
          resiliencePanel.toggle();
        }
      });

      // Panels remain closed on startup for a clean globe viewport; accessible via Alt+I, Alt+R, top HUD pills, or dock triggers
      return controls;
    },
    createData: (context) =>
      createStandaloneData({ ...context, allowQaRegistration, catalog }),
    createTools: (context) =>
      createStandaloneTools({ ...context, loadingScreen, placeSearch, voice }),
  });
}
