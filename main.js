const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const Settings = require('./settings');

function createWindow () {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  const win = new BrowserWindow({
    width: 704,
    height: 528,
    minWidth: 480,
    minHeight: 200,
    maxWidth: 1200,
    maxHeight: 800,
    // x: 20,
    // y: height - 548,
    transparent: true,
    frame: false,
    movable: true,
    resizable: true,
    minimizable: true,
    maximizable: false,
    closable: true,
    alwaysOnTop: false,
    level: 'desktop',
    skipTaskbar: true,
    hasShadow: true,
    vibrancy: 'sidebar',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
  
  // Ensure window is positioned at bottom left
  win.setPosition(50, 420);
  
  // Hide from dock
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
  
  // Keep widget in desktop layer
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

// Initialize settings
const settings = new Settings();

// IPC handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Markdown Folder'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    settings.setMarkdownFolderPath(folderPath);
    return folderPath;
  }
  
  return null;
});

ipcMain.handle('get-markdown-folder', () => {
  return settings.getMarkdownFolderPath();
});

ipcMain.handle('set-markdown-folder', (event, folderPath) => {
  settings.setMarkdownFolderPath(folderPath);
  return folderPath;
});
