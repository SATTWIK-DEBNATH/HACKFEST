@echo off
setlocal enabledelayedexpansion
title RAD Supply Chain Resilience Command Center - Local Server

:: 0. Force working directory to the folder containing this batch script
cd /d "%~dp0"

echo =====================================================================
echo   RESEARCH ANALYSIS DIRECTORATE (RAD)
echo   Supply Chain Resilience Command Center - Local Server Launcher
echo =====================================================================
echo.

:: 1. Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found on your system PATH!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Detected Node.js: %NODE_VERSION%

:: 2. Ensure .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy /y ".env.example" ".env" >nul
        echo [OK] .env initialized with keyless defaults.
    )
)

:: 3. Check for node_modules
if not exist "node_modules\" (
    echo [INFO] node_modules not detected. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
)

:: 4. Background browser launcher
:: Waits 3 seconds for Vite to boot, then opens default browser via Windows shell
echo [INFO] Scheduling browser to open at http://localhost:5173 ...
start "" /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173"

echo.
echo =====================================================================
echo   SERVER STARTING AT http://localhost:5173
echo   - Your default browser will open automatically in 3 seconds.
echo   - If it does not, open your browser and go to: http://localhost:5173
echo   - Press Alt+R in the browser to open the Resilience Command Center.
echo   - Press Ctrl+C in this window to stop the server.
echo =====================================================================
echo.

:: 5. Launch server via local npm script
call npm run dev -- --host localhost --port 5173

if %errorlevel% neq 0 (
    echo.
    echo [INFO] Retrying server start on alternate port...
    call npm run dev
)

pause
