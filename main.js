/**
 * CreatorTask Studio — Electron Desktop Application Entry Point
 * Manages native window lifecycle, background Express + Ollama server, and system tray.
 */

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let tray = null;
let serverProcess = null;
const SERVER_PORT = 3000;

// Helper to check if server is already active
function checkServerRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startInternalServer() {
  const isRunning = await checkServerRunning(SERVER_PORT);
  if (!isRunning) {
    console.log('[Desktop App] Starting internal Express backend server...');
    try {
      require('./server.js');
    } catch (err) {
      console.error('[Desktop App] Error starting internal server:', err);
    }
  } else {
    console.log('[Desktop App] Existing server detected on port', SERVER_PORT);
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.svg');

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    title: 'CreatorTask Studio',
    backgroundColor: '#090c15',
    icon: iconPath,
    frame: true, // Native title bar + custom in-app controls
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // Load local web app
  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  // Handle window close to tray
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      // Allow standard close
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSystemTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.svg');
  let trayIcon = nativeImage.createFromPath(iconPath);
  if (trayIcon.isEmpty()) {
    trayIcon = nativeImage.createEmpty();
  }

  try {
    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '🎬 CreatorTask Studio',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Open Task Board',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        }
      },
      {
        label: '🤖 AI Studio (Qwen 2.5)',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.executeJavaScript(`document.getElementById('btn-open-ai-studio')?.click();`);
          }
        }
      },
      {
        label: '📦 Viral Vault (105+ Ideas)',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.executeJavaScript(`document.getElementById('btn-open-viral-vault')?.click();`);
          }
        }
      },
      {
        label: '⏱️ Toggle Focus Timer',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.executeJavaScript(`document.getElementById('btn-focus-timer-trigger')?.click();`);
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit Desktop App',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('CreatorTask Studio — Task & Video Tracker');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.warn('[Desktop App] Tray creation skipped:', err.message);
  }
}

// IPC Window Controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// App Lifecycle
app.whenReady().then(async () => {
  await startInternalServer();
  // Brief delay to ensure server bound
  setTimeout(() => {
    createWindow();
    createSystemTray();
  }, 400);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
