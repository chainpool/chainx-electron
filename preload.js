const electronStore = require('electron-store');
const { shell, remote } = require('electron');

window.electronStore = electronStore;
window.openExternal = url => shell.openExternal(url);

window.fetchFromWs = ({ url, method, params = [], timeOut = 5000 }) => {
  return remote.app.utils.fetchFromWs({ url, method, params, timeOut });
};
