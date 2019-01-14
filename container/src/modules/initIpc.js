const { ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const constants = require('./constants');

function initIpc(window, keystoreManager) {
  ipcMain.on("update", (event, arg) => {
    console.log(arg, "========");
    autoUpdater.on("update-downloaded", function () {
      autoUpdater.quitAndInstall();
    });

    autoUpdater.checkForUpdatesAndNotify();
  });

  // 渲染进程请求所有keystore后发送
  ipcMain.on(constants.ipc.GET_KEYSTORE, async () => {
    const allKeystore = await keystoreManager.getAllKeystore();
    window.webContents.send(constants.ipc.ALL_KEYSTORE, allKeystore)
  })
}

module.exports = initIpc;
