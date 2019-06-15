require("@babel/register");
const electronStore = require("electron-store");
const { shell, remote } = require("electron");
const { example } = require("./MultiSign/ledger");
const LedgerInterface = require("./MultiSign/ledger-interface");

window.electronStore = function(...args) {
  return new electronStore(...args);
};

window.openExternal = url => shell.openExternal(url);

window.fetchFromWs = ({ url, method, params = [], timeOut = 5000 }) => {
  return remote.app.utils.fetchFromWs({ url, method, params, timeOut });
};

window.ledger = example;
window.LedgerInterface = LedgerInterface;
