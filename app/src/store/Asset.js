import ModelExtend from './ModelExtend';
import {
  getAddressByAccount,
  getAsset,
  getDepositList,
  getDepositListApi,
  getTrusteeAddress,
  getWithdrawalList,
  getWithdrawalListApi,
  transfer,
  verifyAddressValidity,
  withdraw,
} from '../services';
import { encodeAddress } from '@polkadot/keyring/address';
import { computed } from 'mobx';
import { moment, formatNumber, _, observable } from '../utils/index';
import { Chain } from '../constants';
import { from, of } from 'rxjs';
import { combineLatest, mergeMap, map, mergeAll, catchError, filter } from 'rxjs/operators';

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
    desc: info.desc,
  };
}

export default class Asset extends ModelExtend {
  @observable name = 'asset';
  @observable btcAddresses = []; // 账户已绑定BTC地址列表
  @observable onChainAccountWithdrawList = []; // 提现记录
  @observable depositRecords = []; // 充值记录
  @observable accountAssets = []; // 现账户资产
  @observable btcTrusteeAddress; // BTC公共多签地址

  @computed
  get normalizedAccountAssets() {
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
    if (info) {
      return [getAssetWithZeroBalance(info)];
    } else {
      return [];
    }
  }

  @computed get accountNativeAssetFreeBalance() {
    return this.nativeAccountAssets[0].free;
  }

  @computed get normalizedAccountNativeAssetFreeBalance() {
    const asset = this.nativeAccountAssets[0];
    if (!asset) {
      throw new Error('There is at least one native asset');
    }

    return formatNumber.toPrecision(asset.free, asset.precision);
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
        height: withdraw.height,
        date: moment.formatHMS(withdraw.time * 1000), // 申请时间
        balance: withdraw.balance, // 数量
        balanceShow: this.setPrecision(withdraw.balance, withdraw.token),
        token: withdraw.token, // 币种
        addr: withdraw.addr, // 地址
        memo: withdraw.memo,
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
    from(getWithdrawalList('Bitcoin', 0, 100))
      .pipe(
        combineLatest(
          from(
            getWithdrawalListApi({
              chain: 1,
              accountId: this.decodeAddressAccountId(account),
              token: 'BTC',
            })
          ).pipe(
            catchError(() => {
              return of({
                items: [],
              });
            })
          )
        )
      )
      .subscribe(([resRpc = { data: [] }, resApi = { items: [] }]) => {
        const dataRpc = resRpc.data.filter(withdraw => encodeAddress(withdraw.accountid) === account.address);
        const dataApi = resApi.items.map((item = {}) => ({
          ...item,
          height: item.height,
          originChainTxId: item.txid,
          addr: item.address,
        }));
        let data = [];
        if (dataApi && dataApi.length) {
          data = dataApi;
        } else {
          data = dataRpc;
        }
        this.changeModel({
          onChainAccountWithdrawList: data,
        });
      });
  }

  async getDepositRecords() {
    const account = this.getCurrentAccount();
    from(getDepositList('Bitcoin', 0, 100))
      .pipe(
        combineLatest(
          from(
            getDepositListApi({
              chain: 1,
              accountId: this.decodeAddressAccountId(account),
              token: 'BTC',
            })
          ).pipe(
            catchError(() => {
              return of({
                items: [],
              });
            })
          )
        )
      )
      .subscribe(([resRpc = { data: [] }, resApi = { items: [] }]) => {
        const dataRpc = resRpc.data
          .filter(record => encodeAddress(record.accountid) === account.address)
          .map(record => {
            return {
              address: record.address, //充值地址
              time: moment.formatHMS(new Date(record.time * 1000)),
              token: record.token,
              txid: record.txid,
              amount: this.setPrecision(record.balance, record.token),
              status:
                record.totalConfirm > record.confirm ? `(${record.confirm}/${record.totalConfirm})确认中` : '已确认',
              memo: record.memo,
            };
          });
        const dataApi = resApi.items.map((record = {}) => {
          return {
            time: '',
            address: record.address,
            height: record.height,
            token: record.token,
            txid: record.txid,
            amount: this.setPrecision(record.balance, record.token),
            status: record.txstate,
            memo: record.memo,
          };
        });
        let data = [];
        if (dataApi && dataApi.length) {
          data = dataApi;
        } else {
          data = dataRpc;
        }
        this.changeModel({
          depositRecords: data,
        });
      });
  }

  async getTrusteeAddress({ chain }) {
    const addresses = (await getTrusteeAddress(chain)) || [];
    this.changeModel('btcTrusteeAddress', addresses.hotEntity);
    return addresses.hotEntity;
  }

  transfer = ({ dest, token, amount, remark }) => {
    amount = this.setPrecision(amount, token, true);
    const extrinsic = transfer(dest, token, Number(amount), remark);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  withdraw = ({ token, amount, dest, remark }) => {
    amount = this.setPrecision(amount, token, true);
    const extrinsic = withdraw(token, Number(amount), dest, remark);
    return {
      extrinsic,
      success: this.reload(),
    };
  };

  verifyAddressValidity = async ({ token, address, remark }) => {
    const res = await verifyAddressValidity(token, address, remark);
    return !res;
  };
}
