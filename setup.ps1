# CreatorTask Studio - Desktop Setup & Diagnostic Installer
# 100% ASCII-Safe PowerShell Script

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "CreatorTask Studio - Desktop PC Installer"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if Node is available, if so, delegate to high-end setup.js
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($null -ne $nodeCheck) {
    & node setup.js
    exit $LASTEXITCODE
}

Write-Host "Node.js is not installed or not in PATH!" -ForegroundColor Red
Write-Host "Please install Node.js (v18+) from https://nodejs.org" -ForegroundColor Yellow
Read-Host "Press Enter to exit"
exit 1
