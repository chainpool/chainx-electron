import { ChainX } from '../utils';
const { stake, asset } = ChainX;

export const getCert = (...payload) => stake.getCertByAccount(...payload);

export const getAsset = (...payload) => asset.getAssetsByAccount(...payload);

export const register = (...payload) => stake.register(...payload);

export const transfer = (...payload) => stake.transfer(...payload);
