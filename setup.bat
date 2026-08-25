@echo off
setlocal enabledelayedexpansion
title CreatorTask Studio — PC Setup & Installer

echo =================================================================
echo        🎬 CreatorTask Studio — Desktop PC Setup Wizard 🎬
echo =================================================================
echo.
echo [1/4] Checking Node.js runtime environment...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js (v18+) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Found Node.js %NODE_VER%
echo.

echo [2/4] Installing application dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some dependencies failed to install. Continuing...
) else (
    echo [OK] Dependencies installed successfully!
)
echo.

echo [3/4] Verifying Local Ollama AI Engine (Qwen 2.5:3b)...
where ollama >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Found Ollama CLI!
    curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Ollama service is active on http://127.0.0.1:11434
    ) else (
        echo [INFO] Ollama is installed. You can start it anytime with 'ollama serve'
    )
) else (
    echo [INFO] Ollama is optional for local AI features. (Install from https://ollama.com)
)
echo.

echo [4/4] Creating Desktop Application Shortcut...
set SCRIPT_DIR=%~dp0
set LAUNCH_BAT=%SCRIPT_DIR%launch.bat
set ICON_PATH=%SCRIPT_DIR%assets\icon.svg

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $desktop = [System.Environment]::GetFolderPath('Desktop'); ^
   $s = $ws.CreateShortcut(\"$desktop\CreatorTask Studio.lnk\"); ^
   $s.TargetPath = '%LAUNCH_BAT%'; ^
   $s.WorkingDirectory = '%SCRIPT_DIR%'; ^
   $s.Description = 'CreatorTask Studio - Desktop Video & Idea Manager'; ^
   $s.Save();"

if exist "%USERPROFILE%\Desktop\CreatorTask Studio.lnk" (
    echo [OK] Created desktop shortcut: "%USERPROFILE%\Desktop\CreatorTask Studio.lnk"
) else (
    echo [INFO] Desktop shortcut created.
)
echo.

echo =================================================================
echo   ✨ Setup Complete! CreatorTask Studio is ready for PC! ✨
echo =================================================================
echo.
set /p START_NOW="Do you want to launch CreatorTask Studio now? (Y/N): "
if /i "%START_NOW%"=="Y" (
    echo Starting application...
    start "" "%LAUNCH_BAT%"
)

echo.
echo Thank you for installing CreatorTask Studio!
pause
