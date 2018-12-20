const { BrowserWindow } = require("electron");

class Window {
  constructor(config = {}) {
    this.config = {
      width: 800,
      height: 600,
      url: "",
      ...config
    };
    this.init();
  }

  init() {
    const { width, height, url, ...rest } = this.config;
    this.window = new BrowserWindow({
      width,
      height,
      ...rest
    });
    this.window.on("closed", () => {
      this.window = null;
    });
    this.loadUrl(url);
    this.openDevTools();
  }

  loadUrl(url) {
    this.window.loadURL(url);
  }

  openDevTools() {
    this.window.webContents.openDevTools();
  }
}

module.exports = Window;
