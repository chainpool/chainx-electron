const { BrowserWindow, globalShortcut } = require("electron");
const appRootDir = require("app-root-dir");
const path = require("path");

const isDev = require("electron-is-dev");

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

    const rootDir = appRootDir.get();
    if (isDev) {
      const htmlFilePath = path.join(
        rootDir,
        "..",
        "app",
        "build",
        "index.html"
      );

      this.window.loadFile(htmlFilePath);
    } else {
      // TODO: 考虑生产环境下如何打包HTML相关文件
      this.loadUrl(url);
    }

    this.setShortCut();
    this.openDevTools();
  }

  loadUrl(url) {
    this.window.loadURL(url);
  }

  openDevTools() {
    this.window.webContents.openDevTools();
  }

  setShortCut() {
    globalShortcut.register("CommandOrControl+R", () => {
      this.window.reload();
    });
    globalShortcut.register("CommandOrControl+O", () => {
      this.openDevTools();
    });
  }
}

module.exports = Window;
