@echo off
title Zengineering V4 - Launcher
echo.
echo  ========================================
echo   Zengineering V4 - Demarrage local
echo  ========================================
echo.

:: Tuer anciens processus sur les ports
echo  [1/3] Nettoyage des ports...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3001 " ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173 " ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Demarrer le backend
echo  [2/3] Demarrage Backend (port 3001)...
start "ZEN-BACKEND" /D "%~dp0backend" cmd /k "node src/server.js"
timeout /t 3 /nobreak >nul

:: Demarrer le frontend
echo  [3/3] Demarrage Frontend (port 5173)...
start "ZEN-FRONTEND" /D "%~dp0frontend" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul

:: Ouvrir le navigateur
echo.
echo  Ouverture du navigateur...
start "" "http://localhost:5173"

echo.
echo  Backend  : http://localhost:3001/api/health
echo  Frontend : http://localhost:5173
echo.
echo  Les serveurs tournent dans leurs propres fenetres.
echo  Fermez les fenetres ZEN-BACKEND et ZEN-FRONTEND pour arreter.
echo.
pause
