@echo off
setlocal
title CreatorTask Studio Desktop Launcher

cd /d "%~dp0"

echo =================================================================
echo        🎬 Starting CreatorTask Studio Desktop Edition 🎬
echo =================================================================
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] First-time launch detected. Running setup...
    call "%~dp0setup.bat"
    exit /b
)

:: Check if electron is available for native desktop mode
if exist "node_modules\electron\" (
    echo [OK] Launching native Desktop window...
    npx electron .
) else (
    echo [OK] Starting local background server...
    start /b "" node server.js
    timeout /t 1 /nobreak >nul
    echo [OK] Opening CreatorTask Studio in default browser...
    start http://localhost:3000
)
