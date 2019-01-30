import { ChainX, toJS } from '../utils';
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

const { stake, asset, chain, trade } = ChainX;

export const getAsset = (...payload) => checkLogin(() => asset.getAssetsByAccount(...payload));

export const register = (...payload) => stake.register(...payload);

export const transfer = (...payload) => asset.transfer(...payload);

export const withdraw = (...payload) => asset.withdraw(...payload);

export const getIntentions = (...payload) => stake.getIntentions(...payload);

export const nominate = (...payload) => stake.nominate(...payload);

export const getNominationRecords = (...payload) => stake.getNominationRecords(...payload);

export const refresh = (...payload) => stake.refresh(...payload);

export const unnominate = (...payload) => stake.unnominate(...payload);

export const unfreeze = (...payload) => stake.unfreeze(...payload);

export const claim = (...payload) => stake.claim(...payload);

export const getPseduIntentions = (...payload) => stake.getPseduIntentions(...payload);

export const getPseduNominationRecords = (...payload) => checkLogin(() => stake.getPseduNominationRecords(...payload));

export const getAssets = (...payload) => asset.getAssets(...payload);

export const getWithdrawalListByAccount = (...payload) =>
  checkLogin(() => asset.getWithdrawalListByAccount(...payload));

export const getWithdrawalList = (...payload) => asset.getWithdrawalList(...payload);

export const getDepositRecords = (...payload) => asset.getDepositRecords(...payload);

export const getOrderPairs = (...payload) => trade.getOrderPairs(...payload);

export const getQuotations = (...payload) => trade.getQuotations(...payload);

export const putOrder = (...payload) => trade.putOrder(...payload);

export const cancelOrder = (...payload) => trade.cancelOrder(...payload);

export const getOrders = (...payload) => trade.getOrders(...payload);

export const getBTCAddressByAccount = (...payload) => asset.getBTCAddressByAccount(...payload);

export const subscribeNewHead = (...payload) => chain.subscribeNewHead(...payload);

export const getTrusteeAddress = (...payload) => asset.getTrusteeAddress();
