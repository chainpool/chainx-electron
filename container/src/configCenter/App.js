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

module.exports = new App();
