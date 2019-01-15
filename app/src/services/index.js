import { ChainX } from '../utils';

export const getCert = payload => {
  return ChainX.stake.getCertByAccount(payload);
};

export const getAsset = payload => {
  return ChainX.asset.getAssetsByAccount(payload);
};
