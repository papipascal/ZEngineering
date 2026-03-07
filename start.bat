@echo off
title Zengineering V4.1 - Launcher
echo.
echo  ================================================
echo   Zengineering V4.1 - IA Orchestrator + Full PM
echo  ================================================
echo.

:: Tuer anciens processus
echo  [1/4] Nettoyage des ports 3002 et 5174...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3002 " ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5174 " ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1

:: Vérifier node_modules
echo  [2/4] Vérification dépendances...
if not exist "%~dp0backend\node_modules" (
    echo  Installation backend...
    cd /d "%~dp0backend" && npm install
)
if not exist "%~dp0frontend\node_modules" (
    echo  Installation frontend...
    cd /d "%~dp0frontend" && npm install
)

:: Backend
echo  [3/4] Démarrage Backend (port 3002)...
start "ZEN4.1-BACKEND" /D "%~dp0backend" cmd /k "node src/server.js"
timeout /t 4 /nobreak >nul

:: Frontend
echo  [4/4] Démarrage Frontend (port 5174)...
start "ZEN4.1-FRONTEND" /D "%~dp0frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

:: Navigateur
echo.
echo  Ouverture de l'application...
start "" "http://localhost:5174"

echo.
echo  ================================================
echo   V4.1 Backend  : http://localhost:3002/api/health
echo   V4.1 Frontend : http://localhost:5174
echo   V4.0 Frontend : http://localhost:5173  (si actif)
echo  ================================================
echo.
echo  Fermez ZEN4.1-BACKEND et ZEN4.1-FRONTEND pour areter.
pause
