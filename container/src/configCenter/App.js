const Window = require("./Window");
const { app, Menu } = require("electron");

class App {
  constructor() {
    this.app = app;
    this.init();
  }

  init() {
    if (require("electron-squirrel-startup")) {
      this.app.quit();
    }

    this.app.on("ready", () => {
      this.createWindow();
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

  static setMenuNull() {
    Menu.setApplicationMenu(null);
  }

  createWindow() {
    this.window = new Window({
      width: 1600,
      height: 2000,
      url: `http://localhost:8000/#/`,
      fullscreen: false,
      resizable: false
    });
  }
}

module.exports = new App();
