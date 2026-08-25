@echo off
setlocal
title CreatorTask Studio Setup

cd /d "%~dp0"

:: Launch High-End PowerShell Setup Engine
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Setup encountered an error.
    pause
)
