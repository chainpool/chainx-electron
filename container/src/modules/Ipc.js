const { ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

ipcMain.on("me", (event, arg) => {
  // event.sender.send("show", process.cwd());
});

ipcMain.on("update", (event, arg) => {
  console.log(arg, "========");
  autoUpdater.on("update-downloaded", function() {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdatesAndNotify();
});

module.exports = ipcMain;
