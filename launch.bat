@echo off
setlocal enabledelayedexpansion
title CreatorTask Studio Desktop Launcher

cd /d "%~dp0"

echo =================================================================
echo        🎬 Launching CreatorTask Studio Desktop App 🎬
echo =================================================================

:: Check if electron is available
if exist "node_modules\electron" (
    echo Starting Desktop Application Window (Electron)...
    npx electron .
) else (
    echo Starting background backend server...
    start /b "" node server.js
    timeout /t 2 /nobreak >nul
    echo Opening CreatorTask Studio in your browser...
    start http://localhost:3000
)

echo App is running.
