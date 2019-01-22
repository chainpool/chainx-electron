import { _, moment_helper, observable, resOk, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import {
  getAsset,
  getCert,
  register,
  transfer,
  withdraw,
  getWithdrawalListByAccount,
  getDepositRecords,
} from '../services';
import { computed } from 'mobx';
import { moment } from '@utils/index';

export default class Asset extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';
  @observable certs = []; // 我的证书
  @observable primaryAsset = []; // 原生资产
  @observable crossChainAsset = []; // 跨链资产
  @observable onChainWithdrawList = []; // 提现记录
  @observable depositRecords = []; // 充值记录

  @computed get normalizedWithdrawList() {
    return this.onChainWithdrawList.map(withdraw => {
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
    this.getCert();
    this.getAssets();
  };

  getCert = async () => {
    const currentAccount = this.getCurrentAccount();
    const res = await getCert(currentAccount.address);
    if (res) {
      res.map(item => (item.issuedAt = moment_helper.format(item.issuedAt * 1000)));
    }
    this.changeModel('certs', res, []);
  };

  getAssets = async () => {
    const currentAccount = this.getCurrentAccount();
    const allAssets = await this.getAllAssets();
    if (!currentAccount.address) return false;
    const res = await getAsset(currentAccount.address, 0, 100);
    let primaryAsset = [];
    let crossChainAsset = [];
    const format = isNative => {
      return res.data
        .filter(item => item.isNative === isNative)
        .map(item => {
          const {
            Free: free,
            ReservedStaking: reservedStaking,
            ReservedStakingRevocation: reservedStakingRevocation,
            ReservedDexSpot: reservedDexSpot,
            ReservedWithdrawal: reservedWithdrawal,
          } = item.details;
          const token = item.name;
          const total = _.sum([free, reservedStaking, reservedStakingRevocation, reservedDexSpot, reservedWithdrawal]);
          const findOne = allAssets.filter((one = {}) => one.name === item.name)[0] || {};
          //console.log(toJS(allAssets), '----');
          return {
            ...item,
            freeShow: this.setPrecision(free, token),
            reservedStakingShow: this.setPrecision(reservedStaking, token),
            reservedStakingRevocationShow: this.setPrecision(reservedStakingRevocation, token),
            reservedDexSpotShow: this.setPrecision(reservedDexSpot, token),
            reservedWithdrawalShow: this.setPrecision(reservedWithdrawal, token),
            totalShow: this.setPrecision(total, token),
            chain: findOne.chain,
            trusteeAddr: findOne.trusteeAddr,
          };
        });
    };
    if (res && res.data) {
      primaryAsset = format(true);
      crossChainAsset = format(false);
    }
    this.changeModel(
      {
        primaryAsset,
        crossChainAsset,
      },
      []
    );
  };

  async getWithdrawalList() {
    const account = this.getCurrentAccount();
    const withdrawList = await getWithdrawalListByAccount(account.address, 0, 100);

    this.changeModel('onChainWithdrawList', withdrawList.data);
  }

  async getDepositRecords() {
    const account = this.getCurrentAccount();
    const records = await getDepositRecords(account.address);

    // TODO: 该rpc马上回变动，暂时不对充值记录进行处理
    if (records) {
      this.changeModel('depositRecords', records.data);
    }
  }

  register = ({ signer, acceleration, certName, intention, name, url, shareCount, remark }) => {
    register(
      signer,
      Number(acceleration),
      certName,
      intention,
      name,
      url,
      Number(shareCount),
      remark,
      (err, result) => {
        resOk(result) && this.reload();
      }
    );
  };

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
