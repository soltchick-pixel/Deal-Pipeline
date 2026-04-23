@echo off
title Deal Pipeline — Dev Launcher
color 0B

echo.
echo  =====================================================
echo   Deal Pipeline — Starting Development Servers
echo  =====================================================
echo.
echo  Starting Backend  (Python API)   on http://localhost:8000
echo  Starting Frontend (React UI)     on http://localhost:5173
echo.
echo  Two black windows will open — leave them running.
echo  Your browser will open automatically in a few seconds.
echo.

REM Start the Python backend in a new window
start "Deal Pipeline — Backend API" cmd /k "cd /d "%~dp0backend" && echo Backend starting on http://localhost:8000 && python main.py"

REM Wait for backend to initialise
timeout /t 3 /nobreak >nul

REM Start the React frontend in a new window
start "Deal Pipeline — Frontend" cmd /k "cd /d "%~dp0frontend" && echo Frontend starting on http://localhost:5173 && npm run dev"

REM Wait for the frontend dev server to start, then open the browser
timeout /t 6 /nobreak >nul
start http://localhost:5173

echo.
echo  Both servers are running!
echo.
echo  App:        http://localhost:5173
echo  API docs:   http://localhost:8000/docs
echo.
echo  To STOP: close the two black windows that opened.
echo.
pause
