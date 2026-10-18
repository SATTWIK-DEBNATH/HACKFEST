#!/usr/bin/env bash
# RAD Supply Chain Resilience Command Center — Localhost Launcher (macOS/Linux/WSL)
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "====================================================================="
echo "  RESEARCH ANALYSIS DIRECTORATE (RAD)"
echo "  Supply Chain Resilience Command Center - Local Server (Bash)"
echo "====================================================================="
echo ""

# 1. Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js runtime: $(node -v)"

# 2. Check .env
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[INFO] Initializing .env from .env.example..."
    cp .env.example .env
    echo "[OK] Created default .env."
fi

# 3. Check node_modules
if [ ! -d "node_modules" ]; then
    echo "[INFO] node_modules not detected. Installing dependencies..."
    npm install
    echo "[OK] Dependencies installed."
fi

# 4. Launch Vite server
PORT="${PORT:-5173}"
echo ""
echo "---------------------------------------------------------------------"
echo "  Starting local server at: http://localhost:${PORT}"
echo "  Resilience UI shortcut:   Press Alt+R in browser or click RESILIENCE"
echo "  To stop:                  Press Ctrl+C"
echo "---------------------------------------------------------------------"
echo ""

npx vite --open --port "$PORT"
