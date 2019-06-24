const electronStore = require("electron-store");
const { shell, remote } = require("electron");
const LedgerInterface = require("./MultiSign/ledger-interface");
const TrezorConnector = require("./MultiSign/trezor-connector");

window.electronStore = function(...args) {
  return new electronStore(...args);
};

window.openExternal = url => shell.openExternal(url);

window.fetchFromWs = ({ url, method, params = [], timeOut = 5000 }) => {
  return remote.app.utils.fetchFromWs({ url, method, params, timeOut });
};

window.LedgerInterface = LedgerInterface;
window.TrezorConnector = TrezorConnector;
