const { ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const constants = require("./constants");

function initIpc(window, keystoreManager) {
  ipcMain.on("update", (event, arg) => {
    console.log(arg, "========");
    autoUpdater.on("update-downloaded", function() {
      autoUpdater.quitAndInstall();
    });

    autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.on(
    constants.ipc.SAVE_KEYSTORE,
    async (event, tag, address, encoded) => {
      try {
        await keystoreManager.save(encoded, address, { tag, address });
        event.returnValue = true;
      } catch (e) {
        event.returnValue = false;
      }
    }
  );

  ipcMain.on(constants.ipc.GET_KEYSTORE, async event => {
    try {
      // TODO: 考虑keystore中账户排序问题
      const keystores = await keystoreManager.getAllKeystore();
      event.returnValue = keystores;
    } catch (e) {
      event.returnValue = [];
    }
  });

  ipcMain.on(constants.ipc.DELETE_KEYSTORE, async (event, address) => {
    try {
      await keystoreManager.delete(address);
      event.returnValue = true;
    } catch (e) {
      event.returnValue = false;
    }
  });

  // 渲染进程请求所有keystore后发送
  ipcMain.on(constants.ipc.GET_KEYSTORE, async () => {
    const allKeystore = await keystoreManager.getAllKeystore();
    window.webContents.send(constants.ipc.ALL_KEYSTORE, allKeystore);
  });
}

module.exports = initIpc;
