const { app, BrowserWindow, nativeTheme, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 620,
    height: 420,
    icon: path.join(__dirname, 'icons', 'icon.icns'),
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
    mainWindow.webContents.send('theme-updated', nativeTheme.shouldUseDarkColors);
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