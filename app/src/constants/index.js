export const PATH = {
  default: '/election',
  asset: '/asset',
  election: '/election',
  depositWithdrawRecord: '/asset/depositWithdrawRecord',
  tradeRecord: '/tradeRecord',
  addressManage: '/asset/addressManage',
  trade: '/trade',
  configure: '/configure',
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
  };
})();

export const NetWork = [
  {
    name: '测试网',
    ip: '192.168.1.1',
  },
  {
    name: '正式网',
    ip: '192.168.1.2',
  },
];
