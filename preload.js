const electronStore = require('electron-store');
const { shell } = require('electron');

window.openExternal = shell.openExternal;
window.electronStore = electronStore;
