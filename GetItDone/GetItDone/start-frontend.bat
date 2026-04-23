@echo off
echo ================================
echo GetItDone - Frontend Startup
echo ================================
echo.

cd FrontendTS

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16 or higher
    pause
    exit /b 1
)

echo.
echo Installing dependencies (if needed)...
if not exist "node_modules" (
    npm install
)

echo.
echo Starting React development server...
echo Frontend will be available at: http://localhost:5173
echo.

npm run dev

pause
