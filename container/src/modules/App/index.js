const Window = require("./Window");
const { app, Menu } = require("electron");
const ChainxNodeManager = require('../ChainxNodeManager')
const KeystoreManager = require('../KeystoreManager')

class App {
  constructor() {
    this.app = app;
    this.nodeManager = new ChainxNodeManager();
    this.keystoreManager = new KeystoreManager();

    this.init();
  }

  init() {
    if (require("electron-squirrel-startup")) {
      this.app.quit();
    }

    this.app.on("ready", () => {
      this.createWindow();

      /**
       * TODO: 1. start chainx node, call `this.nodeManager.startNode()`.
       * TODO: 2. load all keys by keystore manager, and notify renderer by ipc.
       */

      App.setMenuNull();
      // tray.setToolTip("myapp");
    });

    this.app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        this.app.quit();
      }
    });

    this.app.on("activate", () => {
      if (this.window === null) {
        this.createWindow();
      }
    });
  }

  createWindow() {
    const { screen } = require("electron");
    this.window = new Window({
      width: screen.getPrimaryDisplay().workAreaSize.width,
      height: screen.getPrimaryDisplay().workAreaSize.height,
      url: `http://localhost:8000/#/`,
      fullscreen: false,
      resizable: true,
      minWidth: 1280
    });
  }

  static setMenuNull() {
    Menu.setApplicationMenu(null);
  }
}

module.exports = function startApp() {
  new App();
};
