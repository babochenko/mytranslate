const { app, BrowserWindow, nativeTheme, ipcMain, nativeImage } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.iconset', 'icon_512x512.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  // Set dock icon explicitly
  if (process.platform === 'darwin') {
    app.dock.setIcon(icon);
  }
  
  mainWindow = new BrowserWindow({
    width: 620,
    height: 420,
    icon: icon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  mainWindow.loadFile('src/index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
  });

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  nativeTheme.on('updated', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});