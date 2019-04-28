const zh_en = {
  NewAccount: ['新增账户', 'new account'],
  Asset: ['资产', 'Assets'],
  ChainXAsset: ['ChainX资产', 'ChainX Asset'],
  DepositsMining: ['充值挖矿', 'Deposits Mining'],
  NominationsElections: ['投票选举', 'Nominations Elections'],
  DepositWithdrawalRecords: ['充提记录', 'Deposit & Withdrawal Records'],
  AssetTrustee: ['资产信托', 'Asset Trustee'],
  DEX: ['币币交易', 'DEX'],
  DAPP: ['DAPP专区', 'DAPP'],
  TradingRecord: ['交易记录', 'Trading Records'],
  Contact: ['联系人', 'Contact'],
  CrossChainAssets: ['跨链资产', 'Cross-chain Assets'],
  ValidatorNode: ['验证节点', 'Validator Node'],
  TrusteeNode: ['信托节点', 'Trustee Node'],
  StandbyNode: ['候选节点', 'Standby Node'],
  MyNominations: ['我的投票', 'My Nominations'],
  UpdateNode: ['更新节点', 'Update Node'],
  RegisterNode: ['注册节点', 'Register Node'],
  TrusteeSettings: ['信托设置', 'Trustee Settings'],
  SetupTrustee: ['设置信托', 'Setup Trustee'],
  WithdrawalList: ['提现列表', 'Withdrawal List'],
  BuildMultiSigWithdrawal: ['构造多签提现', 'Build MultiSig Withdrawal'],
};

export const zh_CN = {};
Object.getOwnPropertyNames(zh_en).forEach(key => {
  zh_CN[key] = zh_en[key][0];
});

export const en_US = {};
Object.getOwnPropertyNames(zh_en).forEach(key => {
  en_US[key] = zh_en[key][1];
});
