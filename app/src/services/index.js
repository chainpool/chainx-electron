import { ChainX } from '../utils';

const { stake, asset, chain, trade } = ChainX;

export const getCert = (...payload) => stake.getCertByAccount(...payload);

export const getAsset = (...payload) => asset.getAssetsByAccount(...payload);

export const register = (...payload) => stake.register(...payload);

export const transfer = (...payload) => asset.transfer(...payload);

export const getIntentions = (...payload) => stake.getIntentions(...payload);

export const nominate = (...payload) => stake.nominate(...payload);

export const getNominationRecords = (...payload) => stake.getNominationRecords(...payload);

export const refresh = (...payload) => stake.refresh(...payload);

export const unnominate = (...payload) => stake.unnominate(...payload);

export const unfreeze = (...payload) => stake.unfreeze(...payload);

export const getBlockNumberObservable = (...payload) => chain.bestNumber(...payload);

export const claim = (...payload) => chain.claim(...payload);

export const getPseduIntentions = (...payload) => stake.getPseduIntentions(...payload);

export const getPseduNominationRecords = (...payload) => stake.getPseduNominationRecords(...payload);

export const getAssets = (...payload) => asset.getAssets(...payload);

export const getWithdrawalListByAccount = (...payload) => asset.getWithdrawalListByAccount(...payload);

export const getDepositRecords = (...payload) => asset.getDepositRecords(...payload);

export const getOrderPairs = (...payload) => trade.getOrderPairs(...payload);

export const getQuotations = (...payload) => trade.getQuotations(...payload);
