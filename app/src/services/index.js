import { ChainX } from '../utils';
const { stake, asset } = ChainX;

export const getCert = (...payload) => stake.getCertByAccount(...payload);

export const getAsset = (...payload) => asset.getAssetsByAccount(...payload);

export const register = (...payload) => stake.register(...payload);

export const transfer = (...payload) => asset.transfer(...payload);

export const getIntentions = (...payload) => stake.getIntentions(...payload);

export const nominate = (...payload) => stake.nominate(...payload);

export const getNominationRecords = (...payload) => stake.getNominationRecords(...payload);

export const refresh = (...payload) => stake.refresh(...payload);

export const unnominate = (...payload) => stake.unnominate(...payload);
