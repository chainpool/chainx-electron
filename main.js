const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const utils = require('./utils');

app.utils = utils;


class AppUpdater {
  constructor() {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')();
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  // app.quit();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (process.platform === 'darwin') {
    app.quitting = true;
  }
});

app.on('activate', () => {
  if (process.platform === 'darwin' && mainWindow !== null) {
    mainWindow && mainWindow.show();
  }
});

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1320,
    minWidth: 800,
    minHeight: 600,
    height: 765,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
    backgroundColor: '#f2f3f4',
  });

  mainWindow.show();

  mainWindow.loadURL(
    process.env.NODE_ENV === 'development' ? `http://localhost:8000` : `file://${__dirname}/app/build/index.html`
  );

  mainWindow.on('close', event => {
    if (process.platform === 'darwin') {
      if (app.quitting) {
        mainWindow = null;
      } else if (mainWindow !== null) {
        event.preventDefault();
        mainWindow.hide();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  new AppUpdater();
});
