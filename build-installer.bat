@echo off
setlocal
title CreatorTask Studio — Windows Setup .EXE Builder

cd /d "%~dp0"

echo =================================================================
echo        🎬 Building CreatorTask Studio Windows Setup .EXE 🎬
echo =================================================================
echo.

echo [1/3] Generating High-Resolution 512x512 App Icon...
node scripts/generate-icon.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Icon generation failed.
    pause
    exit /b 1
)
echo.

echo [2/3] Building Standalone Windows Setup Installer (.exe)...
echo This will package Electron, backend server, and all assets into dist/
call npx electron-builder --win nsis
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installer build failed.
    pause
    exit /b 1
)
echo.

echo [3/3] Build Complete!
echo =================================================================
echo  ✨ Your Windows Setup Installer is ready in: dist\ ✨
echo =================================================================
dir /b dist\*.exe 2>nul
echo.
pause
