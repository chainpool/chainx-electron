export const PATH = {
  default: '/election',
  mine: '/mine',
  asset: '/asset',
  election: '/election',
  depositWithdrawRecord: '/asset/crossChainRecord',
  tradeRecord: '/tradeRecord',
  addressManage: '/asset/addressManage',
  trade: '/trade',
  configure: '/configure',
  trust: '/trust',
};

export const PlaceHolder = (() => {
  return {
    //setInputLength: setLength(12),
    // getInputLength: 12,
    //setTextAreaLength: setLength(64),
    //password: '输入密码',
    getTextAreaLength: 64,
  };
})();

export const NetWork = [
  {
    name: 'MainnetPrepair',
    value: 'main',
  },
  {
    name: 'TestNet',
    value: 'test',
  },
  // {
  //   name: '主网预发布',
  //   value: 'premain',
  // },
];

export const Chain = {
  nativeChain: 'ChainX',
};

export const ipc = {
  GET_KEYSTORE: 'GET_KEYSTORE', // 用于renderer向main请求所有keystore数据
  ALL_KEYSTORE: 'ALL_KEYSTORE', // 用于main向renderer发送所有keystore数据
  SAVE_KEYSTORE: 'SAVE_KEYSTORE', // 用户renderer向main请求保存keystore
  DELETE_KEYSTORE: 'DELETE_KEYSTORE',
};

export const SCRYPT_PARAMS = {
  N: 64, // specified by BIP38
  r: 4,
  p: 4,
};

export const AjaxCallTime = 5000;

export const ConfigureVersion = 40;

export const blockChain = {
  // tx: v => `https://www.blockchain.com/btc/tx/${v}`,
  tx: (v, isTest = false) => {
    return isTest ? `https://live.blockcypher.com/btc-testnet/tx/${v}` : `https://live.blockcypher.com/btc/tx/${v}`;
  },
  accountId: v => `https://scan.chainx.org/accounts/${v}`,
  address: (v, isTest = false) => {
    return isTest
      ? `https://live.blockcypher.com/btc-testnet/address/${v}`
      : `https://live.blockcypher.com/btc/address/${v}`;
  },
  chainXAccount: address => {
    return `https://scan.chainx.org/accounts/${address}`;
  },
};

export const OrderStatus = {
  ZeroFill: 'ZeroFill',
  ParitialFill: 'ParitialFill',
  Filled: 'Filled',
  ParitialFillAndCanceled: 'ParitialFillAndCanceled',
  Canceled: 'Canceled',
};

export const TrustNode = '47.111.89.46:18332';

export const ShowLanguage = true;

export const ForceTrustee = true;
