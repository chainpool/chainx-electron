export const PATH = {
  default: '/election',
  mine: '/depositMine',
  asset: '/asset',
  election: '/election',
  depositWithdrawRecord: '/asset/depositWithdrawRecord',
  tradeRecord: '/tradeRecord',
  addressManage: '/asset/addressManage',
  trade: '/trade',
  configure: '/configure',
  trust: '/trust',
};

export const ErrMsg = {
  passNotEqual: '两次输入的密码不一致',
  privateKeyNotFormat: '私钥错误，请核对后重新输入',
  mnemonicOrderNotFormat: '助记词顺序错误，请核对后重新输入',
  mnemonicNotFormat: '助记词错误，请核对后重新输入',
};

export const PlaceHolder = (() => {
  const setLength = length => {
    return `${length}个字符以内`;
  };
  return {
    setLength,
    setInputLength: setLength(12),
    getInputLength: 12,
    setTextAreaLength: setLength(64),
    getTextAreaLength: 64,
    password: '输入密码',
  };
})();

export const NetWork = [
  {
    name: '测试网',
    ip: '192.168.1.1',
  },
];

export const API = {
  status: 'API即将开放',
};

export const Chain = {
  nativeChain: 'ChainX',
};

export const ipc = {
  GET_KEYSTORE: 'GET_KEYSTORE', // 用于renderer向main请求所有keystore数据
  ALL_KEYSTORE: 'ALL_KEYSTORE', // 用于main向renderer发送所有keystore数据
  SAVE_KEYSTORE: 'SAVE_KEYSTORE', // 用户renderer向main请求保存keystore
  DELETE_KEYSTORE: 'DELETE_KEYSTORE',
};

export const BitcoinTestNet = true;

export const SCRYPT_PARAMS = {
  N: 64, // specified by BIP38
  r: 4,
  p: 4,
};

export const AjaxCallTime = 5000;

export const ConfigureVersion = 3;
