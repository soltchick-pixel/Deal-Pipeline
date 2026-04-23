@echo off
setlocal EnableDelayedExpansion
title Deal Pipeline — Setup
color 0A

echo.
echo  =====================================================
echo   Deal Pipeline — Full Development Setup
echo   This installs Python, Node.js, and all packages.
echo  =====================================================
echo.
echo  This will take 2-5 minutes. Please wait...
echo.

REM ── 1. Check / Install Python ─────────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% EQU 0 (
    echo  [OK] Python is already installed.
) else (
    echo  [..] Python not found. Installing via Windows Package Manager...
    winget install --id Python.Python.3.11 --source winget --silent --accept-package-agreements --accept-source-agreements
    if !errorlevel! NEQ 0 (
        echo.
        echo  [!!] Automatic Python install failed.
        echo.
        echo  Please install Python manually:
        echo  1. Go to: https://www.python.org/downloads/
        echo  2. Click "Download Python"
        echo  3. Run the installer
        echo  4. IMPORTANT: Check the box "Add Python to PATH"
        echo  5. Come back and run SETUP.bat again
        echo.
        pause
        exit /b 1
    )
    echo  [OK] Python installed.
    REM Attempt to update PATH for this session
    for /f "delims=" %%i in ('where python 2^>nul') do set "PYTHON_PATH=%%i"
    if not defined PYTHON_PATH (
        echo.
        echo  Python was installed. Please CLOSE this window,
        echo  then run SETUP.bat again so Windows finds Python.
        echo.
        pause
        exit /b 0
    )
)

REM ── 2. Check / Install Node.js ────────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% EQU 0 (
    echo  [OK] Node.js is already installed.
) else (
    echo  [..] Node.js not found. Installing via Windows Package Manager...
    winget install --id OpenJS.NodeJS.LTS --source winget --silent --accept-package-agreements --accept-source-agreements
    if !errorlevel! NEQ 0 (
        echo.
        echo  [!!] Automatic Node.js install failed.
        echo.
        echo  Please install Node.js manually:
        echo  1. Go to: https://nodejs.org/
        echo  2. Click the "LTS" download button
        echo  3. Run the installer (all default options are fine)
        echo  4. Come back and run SETUP.bat again
        echo.
        pause
        exit /b 1
    )
    echo  [OK] Node.js installed.
    node --version >nul 2>&1
    if !errorlevel! NEQ 0 (
        echo.
        echo  Node.js was installed. Please CLOSE this window,
        echo  then run SETUP.bat again so Windows finds Node.js.
        echo.
        pause
        exit /b 0
    )
)

REM ── 3. Install Python packages ────────────────────────────────────────────
echo.
echo  [..] Installing Python packages (FastAPI, Uvicorn, etc.)...
cd /d "%~dp0backend"
pip install -r requirements.txt --quiet
if %errorlevel% NEQ 0 (
    echo  [!!] Failed to install Python packages.
    echo       Try running: pip install -r backend\requirements.txt
    pause
    exit /b 1
)
echo  [OK] Python packages installed.

REM ── 4. Install Node / React packages ─────────────────────────────────────
echo.
echo  [..] Installing React and frontend packages (this may take a minute)...
cd /d "%~dp0frontend"
call npm install --silent
if %errorlevel% NEQ 0 (
    echo  [!!] Failed to install Node packages.
    echo       Try running: cd frontend && npm install
    pause
    exit /b 1
)
echo  [OK] React packages installed.

REM ── Done ──────────────────────────────────────────────────────────────────
echo.
echo  =====================================================
echo   Setup complete! Everything is installed.
echo.
echo   To start developing:
echo   Double-click  DEV_START.bat
echo.
echo   Your app will open at  http://localhost:5173
echo  =====================================================
echo.
pause
