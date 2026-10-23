@echo off
TITLE Sentry AI - Campus Issue Reporting & Resolution System
echo =====================================================================
echo   SENTRY: AI-Powered Issue Reporting & Resolution Platform
echo   Department of Computer Science & Business Systems
echo   JSPM's Rajarshi Shahu College of Engineering, Pune
echo =====================================================================
echo.
echo [1/3] Starting Python AI & Computer Vision Microservice on Port 5001...
start "Sentry AI Microservice (Port 5001)" cmd /k "python ai_service/app.py"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Node.js / Express Backend Server on Port 5000...
start "Sentry Express API (Port 5000)" cmd /k "node backend/server.js"

timeout /t 2 /nobreak >nul

echo [3/3] Opening Sentry Portal in your default web browser...
start http://localhost:5000

echo.
echo =====================================================================
echo System successfully launched!
echo - Landing Page:      http://localhost:5000
echo - Campus Portal:     http://localhost:5000/client/campus-portal.html
echo - Admin Console:     http://localhost:5000/client/admin-portal.html
echo - AI Microservice:   http://localhost:5001/health
echo =====================================================================
pause
