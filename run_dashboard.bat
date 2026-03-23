@echo off
TITLE Smart Department Portal - Starter
echo ==========================================
echo   Smart Department Portal - Dev Servers
echo ==========================================
echo.

echo [1/2] Checking Backend...
if not exist "backend\node_modules\" (
    echo ERROR: Backend node_modules not found. Running npm install...
    cd backend && npm install && cd ..
)
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"

echo.
echo [2/2] Checking Frontend...
if not exist "frontend\node_modules\" (
    echo ERROR: Frontend node_modules not found. Running npm install...
    cd frontend && npm install && cd ..
)
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo Both servers are starting in separate windows.
echo You can close this window now.
echo ==========================================
timeout /t 5
exit
