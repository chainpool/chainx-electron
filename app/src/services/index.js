import { ChainX, fetchFromHttp, localSave } from '../utils';
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
  const api = localSave.get('api') || [];
  return api.filter((item = {}) => item.best)[0] || {};
};

const { stake, asset, chain, trade } = ChainX;

const API = getBestApi().address;

export const getAsset = (...payload) => checkLogin(() => asset.getAssetsByAccount(...payload));

export const createWithdrawTx = (...payload) => asset.createWithdrawTx(...payload);

export const getWithdrawTx = (...payload) => asset.getWithdrawTx(...payload);

export const signWithdrawTx = (...payload) => asset.signWithdrawTx(...payload);

export const register = (...payload) => stake.register(...payload);

export const transfer = (...payload) => asset.transfer(...payload);

export const withdraw = (...payload) => asset.withdraw(...payload);

export const getIntentions = (...payload) => stake.getIntentions(...payload);

export const nominate = (...payload) => stake.nominate(...payload);

export const getNominationRecords = (...payload) => stake.getNominationRecords(...payload);

export const refresh = (...payload) => stake.refresh(...payload);

export const unnominate = (...payload) => stake.unnominate(...payload);

export const unfreeze = (...payload) => stake.unfreeze(...payload);

export const voteClaim = (...payload) => stake.voteClaim(...payload);

export const depositClaim = (...payload) => stake.depositClaim(...payload);

export const claim = (...payload) => stake.claim(...payload);

export const getPseduIntentions = (...payload) => stake.getPseduIntentions(...payload);

export const getPseduNominationRecords = (...payload) => checkLogin(() => stake.getPseduNominationRecords(...payload));

export const getTrusteeInfoByAccount = (...payload) => stake.getTrusteeInfoByAccount(...payload);

export const setupTrustee = (...payload) => stake.setupTrustee(...payload);

export const getAssets = (...payload) => asset.getAssets(...payload);

export const getWithdrawalListByAccount = (...payload) =>
  checkLogin(() => asset.getWithdrawalListByAccount(...payload));

export const getWithdrawalList = (...payload) => asset.getWithdrawalList(...payload);

export const getWithdrawalListApi = payload => {
  const { accountId, chain, token } = payload;
  return fetchFromHttp({
    url: `${API}/account/${accountId}/withdrawals?chain=${chain}&token=${token}`,
    method: 'get',
    ...payload,
  });
};

export const getDepositList = (...payload) => asset.getDepositList(...payload);

export const verifyAddressValidity = (...payload) => asset.verifyAddressValidity(...payload);

export const getOrderPairs = (...payload) => trade.getOrderPairs(...payload);

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

export const getOrders = (...payload) => trade.getOrders(...payload);

export const getOrdersApi = payload => {
  const { accountId } = payload;
  return fetchFromHttp({
    url: `${API}/trade/userorders/${accountId}`,
    method: 'get',
    ...payload,
  });
};

export const getFillOrdersApi = payload => {
  const { accountId, index } = payload;
  return fetchFromHttp({
    url: `${API}/trade/userorder/fills/${accountId}/${index}`,
    method: 'get',
    ...payload,
  });
};

export const getLatestOrderApi = payload => {
  const { pairId } = payload;
  return fetchFromHttp({
    url: `${API}/trade/latestfills/${pairId}`,
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

export const getTrusteeAddress = (...payload) => asset.getTrusteeAddress(...payload);

export const getBlockPeriod = (...payload) => chain.getBlockPeriod(...payload);

export const getBondingDuration = (...payload) => stake.getBondingDuration(...payload);

export const getIntentionBondingDuration = (...payload) => stake.getIntentionBondingDuration(...payload);

export const getBlockTime = payload => {
  const { height } = payload;
  return fetchFromHttp({
    url: `${API}/block/${height}?fields=time`,
    method: 'get',
    ...payload,
  });
};
