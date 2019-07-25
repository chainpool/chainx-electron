import { ChainX, fetchFromHttp, localSave, isEmpty } from '../utils';
import { default as store } from '../store';

const checkLogin = func => {
  const {
    accountStore: { currentAccount = {} },
  } = store || {};
  if (currentAccount && currentAccount.address) {
    return func();
  } else {
    return Promise.reject('当前无账户,去权限请求');
  }
};

const getBestApi = () => {
  const currentNetWork = localSave.get('currentNetWork') || { value: 'test' };
  let api = [];
  if (currentNetWork.value === 'test') {
    api = localSave.get('testApi') || [];
  } else if (currentNetWork.value === 'premain') {
    api = localSave.get('premainApi') || [];
  } else if (currentNetWork.value === 'main') {
    api = localSave.get('mainApi') || [];
  }
  return api.filter((item = {}) => item.best)[0] || {};
};

const { stake, asset, chain, trade, trustee } = ChainX;

const API = getBestApi().address;

export const getAsset = (...payload) => checkLogin(() => asset.getAssetsByAccount(...payload));

export const createWithdrawTx = (...payload) => trustee.createWithdrawTx(...payload);

export const getWithdrawTx = (...payload) => trustee.getWithdrawTx(...payload);

export const signWithdrawTx = (...payload) => trustee.signWithdrawTx(...payload);

export const register = (...payload) => stake.register(...payload);

export const transfer = (...payload) => asset.transfer(...payload);

export const withdraw = (...payload) => asset.withdraw(...payload);

export const getMinimalWithdrawalValueByToken = (...payload) => asset.getWithdrawalLimitByToken(...payload);

export const getIntentions = (...payload) => stake.getIntentions(...payload);

export const getIntentionsByAccount = (...payload) => stake.getIntentionByAccount(...payload);

export const nominate = (...payload) => stake.nominate(...payload);

export const renominate = (...payload) => stake.renominate(...payload);

export const getNominationRecords = (...payload) => stake.getNominationRecords(...payload);

export const refresh = (...payload) => stake.refresh(...payload);

export const unnominate = (...payload) => stake.unnominate(...payload);

export const unfreeze = (...payload) => stake.unfreeze(...payload);

export const voteClaim = (...payload) => stake.voteClaim(...payload);

export const depositClaim = (...payload) => stake.depositClaim(...payload);

export const claim = (...payload) => stake.claim(...payload);

export const getPseduIntentions = (...payload) => stake.getPseduIntentions(...payload);

export const getPseduNominationRecords = (...payload) => checkLogin(() => stake.getPseduNominationRecords(...payload));

export const getTrusteeInfoByAccount = (...payload) => checkLogin(() => trustee.getTrusteeInfoByAccount(...payload));

export const setupBitcoinTrustee = (...payload) => trustee.setupBitcoinTrustee(...payload);

export const getAssets = (...payload) => asset.getAssets(...payload);

export const revokeWithdraw = (...payload) => asset.revokeWithdraw(...payload);

export const getWithdrawalListByAccount = (...payload) =>
  checkLogin(() => asset.getWithdrawalListByAccount(...payload));

export const getWithdrawalList = (...payload) => asset.getWithdrawalList(...payload);

export const getWithdrawalListApi = payload => {
  const { accountId, chain, token } = payload;
  return fetchFromHttp({
    url: `${API}/account/${accountId}/withdrawals?chain=${chain}&token=${token}&page=0&page_size=100`,
    method: 'get',
    ...payload,
  });
};

export const getDepositListApi = payload => {
  const { accountId, chain, token } = payload;
  return fetchFromHttp({
    url: `${API}/account/${accountId}/deposits?chain=${chain}&token=${token}&page=0&page_size=100`,
    method: 'get',
    ...payload,
  });
};

export const getLockListApi = payload => {
  const { accountId } = payload;
  return fetchFromHttp({
    url: `${API}/btc/lock/records?accountid=${accountId}&page_size=100&page=0`,
    method: 'get',
    ...payload,
  });
};

export const getDepositList = (...payload) => asset.getDepositList(...payload);

export const verifyAddressValidity = (...payload) => asset.verifyAddressValidity(...payload);

export const getOrderPairs = (...payload) => trade.getTradingPairs(...payload);

export const getOrderPairsApi = payload =>
  fetchFromHttp({
    url: `${API}/trade/pairs`,
    method: 'get',
    ...payload,
  });

export const getQuotations = (...payload) => trade.getQuotations(...payload);

export const getQuotationsApi = payload => {
  const { pairId, count } = payload;
  return fetchFromHttp({
    url: `${API}/trade/handicap/${pairId}?count=${count}`,
    method: 'get',
    ...payload,
  });
};

export const putOrder = (...payload) => trade.putOrder(...payload);

export const cancelOrder = (...payload) => trade.cancelOrder(...payload);

export const getOrders = (...payload) => checkLogin(() => trade.getOrders(...payload));

export const getOrdersApi = payload => {
  const { accountId, page, status, pairid } = payload;
  return fetchFromHttp({
    url: `${API}/trade/userorders/${accountId}?page_size=10&&page=${page}&&status=${status}${
      isEmpty(pairid) ? '' : `&&pairid=${pairid}`
    }`,
    method: 'get',
    ...payload,
  });
};

export const getFillOrdersApi = payload => {
  const { id, pair_id } = payload;
  return fetchFromHttp({
    url: `${API}/trade/fill_orders?id=${id}&&pair_id=${pair_id}`,
    method: 'get',
    ...payload,
  });
};

export const getLatestOrderApi = payload => {
  const { pairId, count } = payload;
  return fetchFromHttp({
    url: `${API}/trade/latestfills/${pairId}?count=${count}`,
    method: 'get',
    ...payload,
  });
};

export const getKlineApi = payload => {
  const { pairid, type, start_date, end_date } = payload;
  return fetchFromHttp({
    url: `${API}/kline?pairid=${pairid}&type=${type}&start_date=${start_date}&end_date=${end_date}`,
    method: 'get',
    ...payload,
  });
};

export const getAddressByAccount = (...payload) => asset.getAddressByAccount(...payload);

export const subscribeNewHead = (...payload) => chain.subscribeNewHead(...payload);

export const getTrusteeSessionInfo = (...payload) => trustee.getTrusteeSessionInfo(...payload);

export const getBlockPeriod = (...payload) => chain.getMinimumPeriod(...payload);

export const chainProperties = (...payload) => chain.chainProperties(...payload);

export const getBondingDuration = (...payload) => stake.getBondingDuration(...payload);

export const getIntentionBondingDuration = (...payload) => stake.getIntentionBondingDuration(...payload);

export const getTokenDiscount = (...payload) => stake.getTokenDiscount(...payload);

export const getBlockTime = payload => {
  const { height } = payload;
  return fetchFromHttp({
    url: `${API}/block/${height}?fields=time`,
    method: 'get',
    ...payload,
  });
};

export const getTradeRecordApi = payload => {
  const { accountId, page } = payload;
  return fetchFromHttp({
    url: `${API}/account/${accountId}/txs?page_size=10&&page=${page}&include_payee=true`,
    method: 'get',
    ...payload,
  });
};

export const getTradeDetailApi = payload => {
  const { txhash } = payload;
  return fetchFromHttp({
    url: `${API}/tx/${txhash}`,
    method: 'get',
    ...payload,
  });
};

export const getAccountTotalLockPositionApi = payload => {
  const { accountId } = payload;
  return fetchFromHttp({
    url: `${API}/account/${accountId}/btc/lock/balances`,
    method: 'get',
  });
};

export const getIntentionImages = () => {
  return fetchFromHttp({
    url: `${API}/intention_logos`,
    method: 'get',
  });
};

export const bindTxHash = payload => {
  const { params } = payload;
  return fetchFromHttp({
    url: `https://wallet.chainx.org/api/rpc?url=http://47.99.192.159:8100`,
    methodAlias: 'tx_hash',
    params: [params],
  });
};

export const getUnspent = payload => {
  const { address, isTest } = payload;
  return fetchFromHttp({
    method: 'get',
    url: `https://api.chainx.org/chainx_trustee/${isTest ? 'testnet' : 'mainnet'}/unspents/${address}`,
  });
};

export const getTxFromTxhash = payload => {
  const { txhash, isTest } = payload;
  return fetchFromHttp({
    method: 'get',
    url: `https://api.chainx.org/chainx_trustee/${isTest ? 'testnet' : 'mainnet'}/tx/${txhash}`,
  });
};

export const getTxsFromTxidList = payload => {
  const { ids, isTest } = payload;
  return fetchFromHttp({
    method: 'post',
    url: `https://api.chainx.org/chainx_trustee/${isTest ? 'testnet' : 'mainnet'}/txs`,
    body: {
      ids,
    },
  });
};
