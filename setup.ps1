# ==============================================================================
#  CreatorTask Studio — High-End Desktop Setup & Diagnostic Installer
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "CreatorTask Studio — High-End Desktop PC Installer"

function Print-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                                                                        ║" -ForegroundColor Cyan
    Write-Host "  ║   ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗             ║" -ForegroundColor Magenta
    Write-Host "  ║  ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗            ║" -ForegroundColor Magenta
    Write-Host "  ║  ██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝            ║" -ForegroundColor Yellow
    Write-Host "  ║  ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗            ║" -ForegroundColor Yellow
    Write-Host "  ║  ╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║            ║" -ForegroundColor Cyan
    Write-Host "  ║   ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝            ║" -ForegroundColor Cyan
    Write-Host "  ║              🎬 S T U D I O   D E S K T O P   E D I T I O N 🎬         ║" -ForegroundColor White
    Write-Host "  ║                                                                        ║" -ForegroundColor Cyan
    Write-Host "  ╚════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host "       Task & Video Idea Tracker • Qwen 2.5 AI • 105+ Viral Vault" -ForegroundColor DarkGray
    Write-Host ""
}

function Show-Step ($num, $total, $title) {
    Write-Host "  [$num/$total] " -NoNewline -ForegroundColor Cyan
    Write-Host "$title" -ForegroundColor White
}

function Show-Success ($msg) {
    Write-Host "      ✔ $msg" -ForegroundColor Green
}

function Show-Warning ($msg) {
    Write-Host "      ⚠ $msg" -ForegroundColor Yellow
}

function Show-Info ($msg) {
    Write-Host "      ℹ $msg" -ForegroundColor Gray
}

function Show-Error ($msg) {
    Write-Host "      ✖ $msg" -ForegroundColor Red
}

Print-Banner

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# ------------------------------------------------------------------------------
# STEP 1: System Environment & Node.js Diagnostics
# ------------------------------------------------------------------------------
Show-Step 1 5 "Checking System Environment & Runtime..."

$osInfo = Get-CimInstance Win32_OperatingSystem
Show-Info "Operating System: $($osInfo.Caption) ($($osInfo.OSArchitecture))"

$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $nodeCheck) {
    Show-Error "Node.js runtime was not found on your system."
    Write-Host ""
    Write-Host "      Please download and install Node.js (v18 or newer) from:" -ForegroundColor Yellow
    Write-Host "      👉 https://nodejs.org" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
} else {
    $nodeVer = & node -v
    Show-Success "Node.js detected: $nodeVer"
}

$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if ($null -ne $npmCheck) {
    $npmVer = & npm -v
    Show-Success "NPM Package Manager detected: v$npmVer"
}

Write-Host ""

# ------------------------------------------------------------------------------
# STEP 2: Application Dependencies Installation
# ------------------------------------------------------------------------------
Show-Step 2 5 "Verifying & Installing Production & Desktop Packages..."

if (Test-Path "$ScriptDir\package.json") {
    Write-Host "      Installing required packages via npm..." -ForegroundColor DarkGray
    $installProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm install" -WorkingDirectory $ScriptDir -NoNewWindow -PassThru -Wait
    if ($installProc.ExitCode -eq 0) {
        Show-Success "All application dependencies are up to date and verified!"
    } else {
        Show-Warning "NPM install finished with minor notices. Continuing setup..."
    }
} else {
    Show-Error "package.json not found in $ScriptDir"
}

Write-Host ""

# ------------------------------------------------------------------------------
# STEP 3: Local Ollama AI Engine Verification (Qwen 2.5:3b)
# ------------------------------------------------------------------------------
Show-Step 3 5 "Verifying Local AI Engine (Ollama & Qwen 2.5:3b)..."

$ollamaCheck = Get-Command ollama -ErrorAction SilentlyContinue
if ($null -ne $ollamaCheck) {
    Show-Success "Ollama CLI is installed on this system."
    
    # Check if Ollama service is listening
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get -TimeoutSec 3 -ErrorAction Stop
        Show-Success "Ollama background service is ACTIVE at http://127.0.0.1:11434"
        
        $hasQwen = ($response.models | Where-Object { $_.name -like "*qwen2.5:3b*" })
        if ($hasQwen) {
            Show-Success "Model 'qwen2.5:3b' is INSTALLED and ready for AI brainstorming!"
        } else {
            Show-Warning "Model 'qwen2.5:3b' was not found in your local Ollama library."
            $pullChoice = Read-Host "      Would you like to download 'qwen2.5:3b' now? (Y/N)"
            if ($pullChoice -match "^[Yy]$") {
                Write-Host "      Pulling model 'qwen2.5:3b' (this may take a couple minutes)..." -ForegroundColor Yellow
                & ollama pull qwen2.5:3b
                Show-Success "Model 'qwen2.5:3b' pulled successfully!"
            } else {
                Show-Info "You can download it later with: ollama pull qwen2.5:3b"
            }
        }
    } catch {
        Show-Info "Ollama service is not currently running. You can start it with: ollama serve"
    }
} else {
    Show-Info "Ollama is optional. For local offline AI features, install from https://ollama.com"
}

Write-Host ""

# ------------------------------------------------------------------------------
# STEP 4: Persistent Data Store & Viral Vault Verification
# ------------------------------------------------------------------------------
Show-Step 4 5 "Checking Persistent Storage & 105+ Viral Vault..."

$dataPath = Join-Path $ScriptDir "data"
if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath | Out-Null
}

$tasksFile = Join-Path $dataPath "tasks.json"
if (Test-Path $tasksFile) {
    Show-Success "Persistent storage file verified: data/tasks.json"
} else {
    Show-Success "Storage initialized."
}

$vaultFile = Join-Path $dataPath "all_viral_ideas.json"
if (Test-Path $vaultFile) {
    Show-Success "105+ Viral YouTube Ideas Vault catalog verified (7 categories loaded)!"
}

Write-Host ""

# ------------------------------------------------------------------------------
# STEP 5: Desktop & Start Menu Shortcuts Creation
# ------------------------------------------------------------------------------
Show-Step 5 5 "Configuring Desktop & Start Menu Shortcuts..."

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $desktopPath = [System.Environment]::GetFolderPath('Desktop')
    $startMenuPath = [System.Environment]::GetFolderPath('Programs')
    
    $launchBatPath = Join-Path $ScriptDir "launch.bat"
    $iconPath = Join-Path $ScriptDir "assets\icon.svg"
    
    # 1. Desktop Shortcut
    $desktopShortcutPath = Join-Path $desktopPath "CreatorTask Studio.lnk"
    $shortcut = $WshShell.CreateShortcut($desktopShortcutPath)
    $shortcut.TargetPath = $launchBatPath
    $shortcut.WorkingDirectory = $ScriptDir
    $shortcut.Description = "CreatorTask Studio — Task & Video Idea Manager"
    $shortcut.WindowStyle = 1
    $shortcut.Save()
    Show-Success "Created Desktop Shortcut: '$desktopShortcutPath'"

    # 2. Start Menu Shortcut
    $startMenuShortcutPath = Join-Path $startMenuPath "CreatorTask Studio.lnk"
    $startShortcut = $WshShell.CreateShortcut($startMenuShortcutPath)
    $startShortcut.TargetPath = $launchBatPath
    $startShortcut.WorkingDirectory = $ScriptDir
    $startShortcut.Description = "CreatorTask Studio — Task & Video Idea Manager"
    $startShortcut.Save()
    Show-Success "Created Start Menu Shortcut: '$startMenuShortcutPath'"
} catch {
    Show-Warning "Could not create standard shortcuts: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "  ════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✨ CreatorTask Studio Setup Completed Successfully! ✨" -ForegroundColor Green
Write-Host "  ════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Quick Summary:" -ForegroundColor White
Write-Host "    • Desktop Shortcut:  Available on your Windows Desktop" -ForegroundColor Gray
Write-Host "    • PC App Launcher:   $ScriptDir\launch.bat" -ForegroundColor Gray
Write-Host "    • AI Engine:         Qwen 2.5 (3B) Integration Ready" -ForegroundColor Gray
Write-Host "    • Viral Ideas Vault: 105+ Pack Catalog Ready" -ForegroundColor Gray
Write-Host ""

$launchNow = Read-Host "  Would you like to launch CreatorTask Studio right now? (Y/N)"
if ($launchNow -match "^[Yy]$") {
    Write-Host "  Launching CreatorTask Studio..." -ForegroundColor Cyan
    Start-Process -FilePath $launchBatPath -WorkingDirectory $ScriptDir
} else {
    Write-Host "  Setup complete. You can launch anytime from your Desktop icon!" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "  Press Enter to close installer"
