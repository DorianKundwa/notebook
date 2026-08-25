@echo off
setlocal
title CreatorTask Studio Desktop Setup

cd /d "%~dp0"

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js was not found on your system!
    echo Please download and install Node.js (v18+) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Execute High-End Installer
node setup.js
