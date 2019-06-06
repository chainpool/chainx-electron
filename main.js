const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const semver = require("semver");
const https = require("https");
const utils = require("./utils");

function requestUpdateInfo() {
  const currentVersion = app.getVersion();
  return new Promise((resolve, reject) => {
    https
      .get(
        "https://chainx-wallet-release.oss-cn-hangzhou.aliyuncs.com/latest/update.json",
        res => {
          let body = "";
          res.on("data", d => {
            body += d;
          });
          res.on("end", function() {
            try {
              const parsed = JSON.parse(body);
              resolve(parsed);
            } catch (err) {
              reject(err);
            }
          });
        }
      )
      .on("error", e => {
        reject(e);
      });
  })
    .then(updateInfo => {
      if (
        updateInfo.forceUpdate &&
        semver.gt(updateInfo.version, currentVersion)
      ) {
        dialog.showMessageBox(
          {
            title: "更新提示",
            message: `检测到有新的更新，请前往 ${updateInfo.path} 下载安装更新`
          },
          () => {
            app.quit();
          }
        );
      }
    })
    .catch(error => {});
}

requestUpdateInfo();

app.utils = utils;

let mainWindow = null;

if (process.env.NODE_ENV === "development") {
  require("electron-debug")();
}

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  // app.quit();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (process.platform === "darwin") {
    app.quitting = true;
  }
});

app.on("activate", () => {
  if (process.platform === "darwin" && mainWindow !== null) {
    mainWindow && mainWindow.show();
  }
});

app.on("ready", async () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1320,
    minWidth: 800,
    minHeight: 600,
    height: 765,
    webPreferences: { preload: path.join(__dirname, "preload.js") },
    backgroundColor: "#f2f3f4"
  });

  mainWindow.show();

  mainWindow.loadURL(
    process.env.NODE_ENV === "development"
      ? `http://localhost:8000`
      : `file://${__dirname}/app/build/index.html`
  );

  mainWindow.on("close", event => {
    if (process.platform === "darwin") {
      if (app.quitting) {
        mainWindow = null;
      } else if (mainWindow !== null) {
        event.preventDefault();
        mainWindow.hide();
      }
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});
