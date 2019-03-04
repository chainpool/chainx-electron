import { _, ChainX, moment, observable, formatNumber, localSave, autorun } from '../utils';
import ModelExtend from './ModelExtend';
import { getWithdrawalList } from '../services';
import { computed } from 'mobx';

export default class Trust extends ModelExtend {
  constructor(props) {
    super(props);
    autorun(() => {
      localSave.set('trusts', this.trusts);
    });
  }

  @observable name = 'Trust';
  @observable onChainAllWithdrawList = []; // runtime中所有跨链提现记录
  @observable info = {
    chain: 'Bitcoin',
    connected: false,
    hotPubKey: null,
    coldPubKey: null,
  };

  @observable _trusts = localSave.get('trusts') || [];

  @computed
  get trusts() {
    const currentAccount = this.getCurrentAccount();
    return this._trusts.filter(item => item.address === currentAccount.address);
  }

  set trusts(value) {
    this._trusts = value;
  }

  @computed get normalizedOnChainAllWithdrawList() {
    const assetNamePrecisionMap = this.rootStore.globalStore.assetNamePrecisionMap; // 获取资产 name => precision map数据结构
    if (Object.keys(assetNamePrecisionMap).length <= 0) {
      return [];
    }

    return this.onChainAllWithdrawList.map(withdraw => {
      let precision = assetNamePrecisionMap[withdraw.token];
      if (typeof precision === 'undefined') {
        // TODO: 这种情况出现表明有Error
        throw new Error('无法找到提现列表中资产定义');
      }

      let state = '';
      switch (withdraw.status) {
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
        address: ChainX.account.encodeAddress(withdraw.accountid), // 申请提现账户地址
        token: withdraw.token, // 币种
        addr: withdraw.address, // 原链地址，提现的目标地址
        balance: formatNumber.toPrecision(withdraw.balance, precision), // 数量
        memo: withdraw.memo, // 提现备注
        state, // 状态
      };
    });
  }

  updateTrust = (obj = {}) => {
    console.log(obj, '---------------obj');
    const trusts = _.cloneDeep(this.trusts);
    const { address, chain, hotPubKey, coldPubKey } = obj;
    const findOne = trusts.filter((item = {}) => item.address === address && item.chain === chain)[0];
    if (!findOne) {
      trusts.push({
        address,
        chain,
        hotPubKey,
        coldPubKey,
      });
    } else {
      findOne.hotPubKey = hotPubKey;
      findOne.coldPubKey = coldPubKey;
    }
    this.changeModel('trusts', trusts);
  };

  getAllWithdrawalList = async () => {
    const withdrawListResp = await getWithdrawalList('Bitcoin', 0, 100);
    this.changeModel('onChainAllWithdrawList', withdrawListResp.data);
  };
}
