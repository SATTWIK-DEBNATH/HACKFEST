# How to Run RAD Supply Chain Resilience Command Center Locally

This guide covers all methods to run the application on `http://localhost:5173`.

---

## Method 1: 1-Click Launchers (Recommended)

### On Windows:
Double-click **`start-server.bat`** in the repository root directory.
- Checks Node.js runtime.
- Automatically initializes `.env` from `.env.example` if missing.
- Runs `npm install` automatically if `node_modules` is not yet installed.
- Starts the server and automatically opens your default web browser to `http://localhost:5173`.

Alternatively, in Windows PowerShell:
```powershell
.\start-server.ps1
```

Options:
```powershell
# Run with a custom port
.\start-server.ps1 -Port 3000

# Run local production build
.\start-server.ps1 -Production
```

### On macOS / Linux / WSL:
Run the bash launcher script:
```bash
chmod +x start-server.sh
./start-server.sh
```

---

## Method 2: Standard Terminal Commands (`npm`)

If you prefer standard npm scripts:

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start the local development server (opens browser automatically)
npm start

# OR standard dev server
npm run dev

# OR bind to all network interfaces (LAN sharing)
npm run server
```

The server will be ready at:
👉 **`http://localhost:5173`**

---

## Method 3: Local Production Mode (Build & Preview)

To run the minified, production-optimized bundle locally:

```bash
# Build the production bundle
npm run build

# Serve the production bundle on localhost
npm run serve
```

---

## Method 4: Docker Container

To run in an isolated Docker container without needing Node.js installed locally:

```bash
docker compose up
```
Open `http://localhost:5173` in your browser.

---

## Interacting with the Supply Chain Resilience Command Center

1. Once the 3D globe loads, press **`Alt+R`** on your keyboard or click the **`RESILIENCE`** button in the bottom command dock or context rail.
2. The Resilience Command Center panel will open:
   - **Network Tab**: Inspect facility counts, active shipments, critical stock positions.
   - **Impact Tab**: View active disruptions (Super Typhoon Gaemi, M6.4 Kansai earthquake, Port of LA congestion), H3 spatial grid polygons, and component impact scoring.
   - **Recovery Tab**: Compare 4 actionable alternatives (Reroute, Transfer, Split, Expedite), inspect trade-offs, and approve recommended actions.
   - **Ledger Tab**: Audit approved recovery actions, verify assigned owners, and inspect the cryptographic evidence drawer.

---

## Troubleshooting

### Port 5173 Already in Use:
If another process is using port 5173, Vite will automatically offer or bind to `5174`. To explicitly specify a port:
```bash
npx vite --port 8080 --open
```

### Keyless Operation:
RAD runs 100% keyless out of the box using bundled assets, Esri World Imagery, OpenStreetMap, USGS seismic feeds, and simulated supply chain telemetry. API keys are completely optional.
