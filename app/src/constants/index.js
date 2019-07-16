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
  // {
  //   name: 'TestNet',
  //   value: 'test',
  // },
  // {
  //   name: '主网预发布',
  //   value: 'premain',
  // },
  {
    name: 'MainnetPrepair',
    value: 'main',
  },
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

export const ConfigureVersion = 36;

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

export const CloseFetures = {
  onlySimulate: true,
};

export const DowloadWalletUrl = {
  Win: 'https://chainx-wallet-release.oss-cn-hangzhou.aliyuncs.com/1.0.3/chainx-1.0.3-win.zip',
  Mac: 'https://chainx-wallet-release.oss-cn-hangzhou.aliyuncs.com/1.0.3/chainx-1.0.3.dmg',
  Linux: 'https://chainx-wallet-release.oss-cn-hangzhou.aliyuncs.com/1.0.3/chainx-1.0.3-x86_64.AppImage',
};

export const SimulatedAccount = {
  tag: 'SimulateAccount',
  address: '5PtnfKx7mj34utdUxYhgtyMs1ePFAe85S1NQjqqsyffXKdPx',
  encoded: {
    iv: [108, 149, 39, 254, 141, 251, 133, 152, 153, 44, 103, 44, 4, 213, 99, 40],
    mac: [
      111,
      222,
      92,
      182,
      212,
      120,
      183,
      208,
      30,
      33,
      204,
      72,
      242,
      99,
      124,
      119,
      31,
      95,
      97,
      128,
      49,
      103,
      57,
      79,
      238,
      237,
      77,
      142,
      237,
      176,
      113,
      105,
    ],
    salt: [
      112,
      100,
      253,
      149,
      39,
      142,
      177,
      115,
      99,
      228,
      34,
      244,
      122,
      254,
      167,
      65,
      14,
      193,
      123,
      138,
      189,
      249,
      208,
      151,
      217,
      143,
      170,
      82,
      227,
      54,
      154,
      206,
    ],
    ciphertext: [
      77,
      35,
      97,
      245,
      47,
      193,
      105,
      73,
      129,
      247,
      56,
      217,
      80,
      10,
      220,
      146,
      225,
      233,
      38,
      188,
      93,
      29,
      31,
      174,
      200,
      177,
      230,
      98,
      242,
      15,
      229,
      58,
    ],
    iterations: 10240,
  },
  net: 'main',
};
