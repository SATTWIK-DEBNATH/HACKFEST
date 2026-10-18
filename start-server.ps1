# RAD Supply Chain Resilience Command Center — PowerShell Localhost Launcher
[CmdletBinding()]
param(
    [int]$Port = 5173,
    [switch]$NoBrowser,
    [switch]$Production
)

$ErrorActionPreference = "Stop"

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  RESEARCH ANALYSIS DIRECTORATE (RAD)" -ForegroundColor White
Write-Host "  Supply Chain Resilience Command Center - Local Server (PowerShell)" -ForegroundColor Cyan
Write-Host "=====================================================================`n" -ForegroundColor Cyan

# 1. Check Node.js installation
try {
    $nodeVer = (node -v).Trim()
    Write-Host "[OK] Node.js runtime: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not detected on system PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Check and initialize .env
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$envPath = Join-Path $root ".env"
$envExamplePath = Join-Path $root ".env.example"

if (-not (Test-Path $envPath) -and (Test-Path $envExamplePath)) {
    Write-Host "[INFO] Initializing .env from .env.example..." -ForegroundColor Yellow
    Copy-Item $envExamplePath $envPath
    Write-Host "[OK] Default .env created." -ForegroundColor Green
}

# 3. Check node_modules
$nodeModulesPath = Join-Path $root "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "[INFO] Installing dependencies via 'npm install'..." -ForegroundColor Yellow
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Dependencies installed." -ForegroundColor Green
}

# 4. Check port availability
$portInUse = $false
try {
    $tcpListener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    $tcpListener.Start()
    $tcpListener.Stop()
} catch {
    $portInUse = $true
}

if ($portInUse) {
    Write-Host "[WARN] Port $Port is currently busy. Vite will bind to next available port." -ForegroundColor Yellow
}

# 5. Launch Server
$serverUrl = "http://localhost:$Port"
Write-Host "`n---------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Target Local URL: $serverUrl" -ForegroundColor Cyan
Write-Host "  Resilience UI:    Press Alt+R in the browser or click RESILIENCE" -ForegroundColor White
Write-Host "  Shutdown:         Press Ctrl+C to terminate the server" -ForegroundColor DarkGray
Write-Host "---------------------------------------------------------------------`n" -ForegroundColor DarkGray

if (-not $NoBrowser) {
    [System.Threading.Tasks.Task]::Run([Action]{
        Start-Sleep -Seconds 2
        try {
            Start-Process "http://localhost:$Port"
        } catch {
            # Silently fallback to Vite's own opener
        }
    }) | Out-Null
}

if ($Production) {
    Write-Host "[INFO] Building and launching production bundle locally..." -ForegroundColor Cyan
    & npm run build
    & npx vite preview --port $Port
} else {
    & npm run dev -- --host localhost --port $Port
}
