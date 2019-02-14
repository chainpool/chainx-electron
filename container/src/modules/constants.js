module.exports = {
  ipc: {
    GET_KEYSTORE: "GET_KEYSTORE", // 用于renderer向main请求所有keystore数据
    ALL_KEYSTORE: "ALL_KEYSTORE", // 用于main向renderer发送所有keystore数据
    SAVE_KEYSTORE: "SAVE_KEYSTORE", // 用户renderer向main请求保存keystore
    DELETE_KEYSTORE: "DELETE_KEYSTORE"
  }
};
