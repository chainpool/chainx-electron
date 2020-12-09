import ModelExtend from './ModelExtend';
import {
  bindTxHash,
  getAccountTotalLockPositionApi,
  getAddressByAccount,
  getAsset,
  getBlockTime,
  getDepositList,
  getDepositListApi,
  getLockListApi,
  getMinimalWithdrawalValueByToken,
  getTrusteeSessionInfo,
  getWithdrawalList,
  getWithdrawalListApi,
  revokeWithdraw,
  transfer,
  verifyAddressValidity,
  withdraw,
} from '../services';
import { computed } from 'mobx';
import { _, formatNumber, moment, observable } from '../utils/index';
import { Chain } from '../constants';
import { combineLatest as combine, from, of } from 'rxjs';
import { catchError, combineLatest, map, mergeMap } from 'rxjs/operators';
import { Toast } from '../components';

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
    limitProps: { ...info.limitProps },
  };
}

export default class Asset extends ModelExtend {
  @observable name = 'asset';
  @observable btcAddresses = []; // 账户已绑定BTC地址列表
  @observable onChainAccountWithdrawList = []; // 提现记录
  @observable depositRecords = []; // 充值记录
  @observable lockRecords = []; //锁仓记录
  @observable accountAssets = []; // 现账户资产
  @observable accountLock = [];
  @observable btcTrusteeAddress; // BTC公共多签地址
  @observable bindTxHashLoading = false;

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
        tokenName: 'X-BTC',
        desc: "ChainX's Cross-chain Bitcoin",
        chain: info.chain,
        precision: 8,
        trusteeAddr: info.trusteeAddr,
        limitProps: { ...info.limitProps },
        ...(asset.locks ? { locks: asset.locks } : {}), //锁仓L-BTC有
      };
    });
  }

  @computed get nativeAccountAssets() {
    console.log(JSON.stringify(this.accountAssets) + '222');
    return [
      {
        tokenName: 'PCX',
        free: 10000000000,
      },
    ];
  }

  @computed get accountNativeAssetFreeBalance() {
    return this.nativeAccountAssets[0].free;
  }

  @computed get accountNativeAssetFreeBalanceShow() {
    return this.setPrecision(this.nativeAccountAssets[0].free, this.nativeAccountAssets[0].name);
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
    const addresses = await getAddressByAccount(currentAccount.address);

    console.log(JSON.stringify(addresses));
    this.changeModel('btcAddresses', addresses);
  };

  getAccountAssets = async () => {
    const currentAccount = this.getCurrentAccount();
    const { data: accountAssetsResp } = await getAsset(currentAccount.address);

    console.log(JSON.stringify(accountAssetsResp));
    const names = this.rootStore.globalStore.chainNames;

    console.log(`chain names: ${names}`);

    let accountAssets = [];

    const info = {
      free: 1,
      name: 'PCX',
      tokenName: 'PCX',
      desc: "ChainX's Native Assets",
      chain: 'ChainX',
      precision: 8,
      details: {
        Free: Number(accountAssetsResp.free) + Number(accountAssetsResp.free),
        ReservedStaking: 0,
        ReservedStakingRevocation: 0,
        ReservedDexSpot: 0,
        ReservedWithdrawal: 0,
      },
    };

    accountAssets.push(info);

    this.changeModel('accountAssets', accountAssets);
    this.getAccountTotalLockPositions();
  };

  getAccountTotalLockPositions = async () => {
    const currentAccount = this.getCurrentAccount();
    const res = await getAccountTotalLockPositionApi({ accountId: this.decodeAddressAccountId(currentAccount) });
    if (res) {
      if (res.length) {
        this.changeModel(
          'accountLock',
          res.map(item => {
            return {
              ...item,
              amountShow: this.setPrecision(item.value, 'L-BTC'),
            };
          })
        );
      } else if (res.length === 0) {
        this.changeModel('accountLock', []);
      }
    }
  };

  processTxState = (txstate, item) => {
    let state;
    const applicationStatus = _.get(item, 'applicationStatus');
    if (applicationStatus && applicationStatus.toUpperCase() !== 'PROCESSING') {
      state = applicationStatus;
    } else {
      switch (txstate && txstate.toUpperCase()) {
        case 'NOTAPPLYING':
          state = applicationStatus ? applicationStatus : txstate;
          break;
        case 'APPLYING':
          state = applicationStatus ? applicationStatus : txstate;
          break;
        case 'SIGNING':
          state = 'Singing';
          break;
        case 'BROADCASTING':
          state = 'BroadCasting';
          break;
        case 'PROCESSING':
          state = 'Processing';
          break;
        case 'CONFIRMING':
          state = 'Confirming';
          break;
        case 'CONFIRMED':
          state = 'Confirmed';
          break;
        case 'NORMALFINISH':
          state = applicationStatus ? applicationStatus : txstate;
          break;
        case 'ROOTFINISH':
          state = applicationStatus ? applicationStatus : txstate;
          break;
        case 'NORMALCANCEL':
          state = applicationStatus ? applicationStatus : txstate;
          break;
        case 'ROOTCANCEL':
          state = applicationStatus ? applicationStatus : txstate;
          break;
        default:
          state = 'Unknown';
      }
    }
    return state;
  };

  async getWithdrawalListByAccount() {
    const account = this.getCurrentAccount();
    return from(getWithdrawalList('Bitcoin', 0, 100))
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
        console.log(resRpc, resApi, '-------提现resRpc,resApi');
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
              statusValue: this.processTxState(_.get(item, 'status.value'), item),
            };
          }),
        });
      });
  }

  async getDepositRecords() {
    const account = this.getCurrentAccount();
    return from(getDepositList('Bitcoin', 0, 100))
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
        console.log(resRpc, resApi, '-------充值resRpc,resApi');
        const dataRpc = resRpc.data
          .filter(record => record.accountid && this.encodeAddressAccountId(record.accountid) === account.address)
          .map(record => {
            const item = {
              ...record,
              txstate: 'Confirming',
            };
            return {
              ...record,
              time: moment.formatHMS(new Date(record.time * 1000)),
              txstate: item.txstate, // rpc返回的只有confirm和totalConfirm，状态一定是confirming
              statusValue: this.processTxState(item.txstate, item),
              ...(record.confirm
                ? {
                    value: {
                      confirm: record.confirm,
                      totalConfirm: record.totalConfirm,
                    },
                  }
                : {}),
            };
          });

        const dataApi = resApi.items.map((item = {}) => ({
          ...item,
          time: moment.formatHMS(item['block.time']),
        }));

        let data = [];
        if (true) {
          //组合数据
          dataRpc.forEach(item => {
            if (!data.find(one => one.txid === item.txid)) {
              data.push(item);
            }
          });
          dataApi.forEach(item => {
            if (!data.find(one => one.txid === item.txid)) {
              data.push(item);
            }
          });
        } else {
          if (dataApi && dataApi.length) {
            data = dataApi;
          } else {
            data = dataRpc;
          }
        }

        this.changeModel({
          depositRecords: data.map(item => ({
            ...item,
            amount: this.setPrecision(item.balance, item.token),
            statusValue: this.processTxState(item.txstate, item),
          })),
        });
      });
  }

  async getLockListApi() {
    const account = this.getCurrentAccount();
    return from(getLockListApi({ accountId: this.decodeAddressAccountId(account) }))
      .pipe(map(res => res.items))
      .subscribe(res => {
        res = res.map(item => {
          return {
            ...item,
            token: 'L-BTC',
            time: moment.formatHMS(item['block.time']),
            balanceShow: this.setPrecision(item.value, 'L-BTC'),
            originChainTxId: item.hash,
          };
        });
        if (res && res.length >= 0) {
          this.changeModel('lockRecords', res);
        }
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
      fee, //信托构造多签交易手续交易
      minimalWithdrawal, // 最小提现手续费
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

  bindTxHash = async hash => {
    const res = await bindTxHash(hash);
    return {
      res,
      success: () => this.reload(),
    };
  };
}
