import ModelExtend from './ModelExtend';
import {
  getAddressByAccount,
  getAsset,
  getDepositList,
  getDepositListApi,
  getTrusteeSessionInfo,
  getWithdrawalList,
  getWithdrawalListApi,
  transfer,
  verifyAddressValidity,
  withdraw,
  bindTxHash,
  getMinimalWithdrawalValueByToken,
  getBlockTime,
  revokeWithdraw,
} from '../services';
import { computed } from 'mobx';
import { moment, formatNumber, _, observable } from '../utils/index';
import { Chain } from '../constants';
import { from, of, combineLatest as combine } from 'rxjs';
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
        freeShow: this.setPrecision(free, asset.name),
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

  reload = () => {
    this.getAccountAssets();
    this.getWithdrawalListByAccount();
    this.getDepositRecords();
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

  processTxState = txstate => {
    switch (txstate && txstate.toUpperCase()) {
      case 'NOTAPPLYING':
        return 'NotApplying';
      case 'APPLYING':
        return 'Applying';
      case 'SIGNING':
        return 'Singing';
      case 'BROADCASTING':
        return 'BroadCasting';
      case 'PROCESSING':
        return 'Processing';
      case 'CONFIRMING':
        return 'Confirming';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'NORMALFINISH':
        return 'NormalFinish';
      case 'ROOTFINISH':
        return 'RootFinish';
      case 'NORMALCANCEL':
        return 'NormalCancel';
      case 'ROOTCANCEL':
        return 'RootCancel';
      default:
        return 'Unknown';
    }
  };

  async getWithdrawalListByAccount() {
    const account = this.getCurrentAccount();
    from(getWithdrawalList('Bitcoin', 0, 100))
      .pipe(
        map(res => {
          return res.data;
        }),
        mergeMap((items = []) => {
          if (!items.length) return of(items);
          return combine(
            items.map(item => {
              return from(getBlockTime({ height: item.height })).pipe(
                map((res = {}) => {
                  return {
                    ...item,
                    time: res.time,
                  };
                }),
                catchError(() => {
                  return of({
                    ...item,
                    time: null,
                    blockHeight: item.height,
                  });
                })
              );
            })
          );
        })
      )
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
      .subscribe(([resRpc = [], resApi = { items: [] }]) => {
        console.log(resRpc, resApi, '-------resRpc,resApi');
        const dataRpc = resRpc
          .filter(withdraw => this.encodeAddressAccountId(withdraw.accountid) === account.address)
          .map((item = {}) => ({
            ...item,
            time: moment.formatHMS(new Date(item.time)),
            originChainTxId: item.txid,
          }));
        const dataApi = resApi.items.map((item = {}) => ({
          ...item,
          time: moment.formatHMS(item['block.time']),
          originChainTxId: item.txid,
          status: {
            value: item.txstate,
          },
        }));
        let data = [];
        if (dataApi && dataApi.length) {
          data = dataApi;
        } else {
          data = dataRpc;
        }
        this.changeModel({
          onChainAccountWithdrawList: data.map((item = {}) => {
            return {
              ...item,
              balanceShow: this.setPrecision(item.balance, item.token),
              statusValue: this.processTxState(_.get(item, 'status.value')),
            };
          }),
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
          .filter(record => record.accountid && this.encodeAddressAccountId(record.accountid) === account.address)
          .map(record => {
            return {
              ...record,
              time: moment.formatHMS(new Date(record.time * 1000)),
            };
          });
        const dataApi = resApi.items.map((item = {}) => ({
          ...item,
          time: moment.formatHMS(item['block.time']),
        }));
        let data = [];
        if (dataApi && dataApi.length) {
          data = dataApi;
        } else {
          data = dataRpc;
        }
        this.changeModel({
          depositRecords: data.map(item => ({
            ...item,
            amount: this.setPrecision(item.balance, item.token),
            statusValue: this.processTxState(item.txstate),
          })),
        });
      });
  }

  async getTrusteeAddress({ chain }) {
    const addresses = (await getTrusteeSessionInfo(chain)) || [];
    this.changeModel('btcTrusteeAddress', addresses.hotEntity.addr);
    return addresses.hotEntity.addr;
  }

  getMinimalWithdrawalValueByToken = async ({ token }) => {
    const res = await getMinimalWithdrawalValueByToken(token);
    const { fee, minimalWithdrawal } = res;
    return {
      fee,
      minimalWithdrawal,
    };
  };

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
      success: () => this.reload(),
    };
  };

  verifyAddressValidity = async ({ token, address, remark }) => {
    const res = await verifyAddressValidity(token, address, remark);
    return !res;
  };

  revokeWithdraw = async ({ id }) => {
    const extrinsic = revokeWithdraw(id);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  bindTxHash = async ({ params }) => {
    const res = await bindTxHash({ params });
    if (res && !_.get(res, 'error.message')) {
      this.reload();
    }
    return res;
  };
}
