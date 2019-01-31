import { _, observable, resOk } from '../utils';
import ModelExtend from './ModelExtend';
import {
  getAddressByAccount,
  getAsset,
  getDepositRecords,
  getTrusteeAddress,
  getWithdrawalListByAccount,
  transfer,
  withdraw,
} from '../services';
import { computed } from 'mobx';
import { moment } from '@utils/index';
import { Chain } from '@constants';

function getAssetWithZeroBalance(info) {
  return {
    free: 0,
    reservedStaking: 0,
    reservedStakingRevocation: 0,
    reservedDexSpot: 0,
    reservedWithdrawal: 0,
    total: 0,
    name: info.name,
    tokenName: info.tokenName,
    chain: info.chain,
    precision: info.precision,
    trusteeAddr: info.trusteeAddr,
  };
}

export default class Asset extends ModelExtend {
  @observable name = 'asset';
  @observable btcAddresses = []; // 账户已绑定BTC地址列表
  @observable onChainAccountWithdrawList = []; // 提现记录
  @observable depositRecords = []; // 充值记录
  @observable accountAssets = []; // 现账户资产
  @observable btcTrusteeAddress = ''; // BTC公共多签地址

  @computed get normalizedAccountAssets() {
    const assetsInfo = this.rootStore.globalStore.assets; // 获取资产基本信息
    if (!assetsInfo) {
      return [];
    }

    return this.accountAssets.map(asset => {
      const {
        Free: free,
        ReservedStaking: reservedStaking,
        ReservedStakingRevocation: reservedStakingRevocation,
        ReservedDexSpot: reservedDexSpot,
        ReservedWithdrawal: reservedWithdrawal,
      } = asset.details;
      const total = _.sum([free, reservedStaking, reservedStakingRevocation, reservedDexSpot, reservedWithdrawal]);

      const info = assetsInfo.find(info => info.name === asset.name);

      return {
        free,
        reservedStaking,
        reservedStakingRevocation,
        reservedDexSpot,
        reservedWithdrawal,
        total,
        name: asset.name,
        tokenName: info.tokenName,
        desc: info.desc,
        chain: info.chain,
        precision: info.precision,
        trusteeAddr: info.trusteeAddr,
      };
    });
  }

  @computed get nativeAccountAssets() {
    const nativeAsset = this.normalizedAccountAssets.find(asset => asset.chain === Chain.nativeChain);
    if (nativeAsset) {
      return [nativeAsset];
    }

    const info = this.rootStore.globalStore.nativeAsset;
    return [getAssetWithZeroBalance(info)];
  }

  @computed get crossChainAccountAssets() {
    return this.normalizedAccountAssets.filter(asset => asset.chain !== Chain.nativeChain);
  }

  @computed get crossChainAccountAssetsWithZero() {
    const assetsInfo = this.rootStore.globalStore.crossChainAssets; // 获取资产基本信息
    if (!assetsInfo) {
      return [];
    }

    const tokensWithValue = this.crossChainAccountAssets.map(asset => asset.name);

    const zeroAssets = assetsInfo
      .filter(info => !tokensWithValue.includes(info.name))
      .map(info => {
        return getAssetWithZeroBalance(info);
      });

    return [...this.crossChainAccountAssets, ...zeroAssets];
  }

  @computed get normalizedAccountWithdrawList() {
    return this.onChainAccountWithdrawList.map(withdraw => {
      let state = '';
      switch (withdraw.state) {
        case 'applying':
          state = '申请中';
          break;
        case 'signing':
          state = '签名中';
          break;
        case 'unknown':
        default:
          state = '未知错误';
      }

      return {
        date: moment.formatHMS(withdraw.time * 1000), // 申请时间
        balance: withdraw.balance, // 数量
        token: withdraw.token, // 币种
        addr: withdraw.addr, // 地址
        fee: 0.001, // 手续费，目前写死
        state, // 状态
        originChainTxId: undefined, // TODO: 目前通过rpc返回均为正在进行中的提现，无法获取原链交易ID
      };
    });
  }

  reload = () => {
    this.getAccountAssets();
  };

  getAccountBTCAddresses = async () => {
    const currentAccount = this.getCurrentAccount();
    const addresses = await getAddressByAccount(currentAccount.address, 'Bitcoin');
    this.changeModel('btcAddresses', addresses);
  };

  getAccountAssets = async () => {
    const currentAccount = this.getCurrentAccount();
    const accountAssetsResp = await getAsset(currentAccount.address, 0, 100);
    const names = this.rootStore.globalStore.chainNames;
    this.changeModel('accountAssets', accountAssetsResp.data.filter(asset => names.includes(asset.name)));
  };

  async getWithdrawalListByAccount() {
    const account = this.getCurrentAccount();
    const withdrawList = await getWithdrawalListByAccount(account.address, 0, 100);

    this.changeModel('onChainAccountWithdrawList', withdrawList.data);
  }

  async getDepositRecords() {
    const account = this.getCurrentAccount();
    const records = await getDepositRecords(account.address, 0, 100);

    this.changeModel('depositRecords', records.data);
  }

  async getBTCTrusteeAddress() {
    const resp = await getTrusteeAddress();
    this.changeModel('btcTrusteeAddress', resp.address);
  }

  transfer = ({ signer, acceleration, dest, token, amount, remark }) => {
    console.log(signer, acceleration, dest, token, amount, remark);
    amount = this.setPrecision(amount, token, true);
    transfer(signer, Number(acceleration), dest, token, Number(amount), remark, (err, result) => {
      resOk(result) && this.reload();
    });
  };

  withdraw = ({ signer, acceleration, token, amount, dest, remark }) => {
    amount = this.setPrecision(amount, token, true);
    withdraw(signer, Number(acceleration), token, Number(amount), dest, remark, (err, result) => {
      resOk(result) && this.reload();
    });
  };
}
