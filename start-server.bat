@echo off
setlocal enabledelayedexpansion
title RAD Supply Chain Resilience Command Center - Local Server

echo =====================================================================
echo   RESEARCH ANALYSIS DIRECTORATE (RAD)
echo   Supply Chain Resilience Command Center - Local Server Launcher
echo =====================================================================
echo.

:: 1. Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found on your system PATH!
    echo Please download and install Node.js (v24 or higher recommended) from:
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Detected Node.js: %NODE_VERSION%

:: 2. Check for .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy ".env.example" ".env" >nul
        echo [OK] .env initialized with keyless defaults.
    )
)

:: 3. Check for node_modules
if not exist "node_modules\" (
    echo [INFO] node_modules not detected. Installing dependencies...
    echo Running: npm install
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
)

:: 4. Launch Localhost Server
echo.
echo =====================================================================
echo   Starting local server at http://localhost:5173
echo   - Press Alt+R in the browser to launch the Resilience Command Center
echo   - Press Ctrl+C in this console to stop the server
echo =====================================================================
echo.

:: Launch Vite with automatic browser opening
call npx vite --open --port 5173

if %errorlevel% neq 0 (
    echo.
    echo [INFO] If port 5173 is in use, retrying on an alternate port...
    call npx vite --open
)

pause
