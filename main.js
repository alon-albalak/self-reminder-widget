const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const Settings = require('./settings');

function createWindow () {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  const win = new BrowserWindow({
    width: 704,
    height: 700,
    minWidth: 480,
    minHeight: 200,
    maxWidth: 1200,
    maxHeight: 800,
    x: 50,
    y: 420,
    transparent: true,
    frame: false,
    movable: true,
    center: false,
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

ipcMain.handle('save-interval', (event, interval) => {
  settings.setRefreshInterval(interval);
  return interval;
});

ipcMain.handle('get-interval', () => {
  return settings.getRefreshInterval();
});
