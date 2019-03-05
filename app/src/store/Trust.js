import { _, ChainX, moment, observable, formatNumber, localSave, autorun } from '../utils';
import ModelExtend from './ModelExtend';
import { getWithdrawalList } from '../services';
import { computed } from 'mobx';

export default class Trust extends ModelExtend {
  constructor(props) {
    super(props);
    autorun(() => {
      localSave.set(
        'trusts',
        this.trusts.map(item => {
          return {
            ...item,
            connected: '',
          };
        })
      );
    });
  }

  @observable name = 'Trust';
  @observable onChainAllWithdrawList = []; // runtime中所有跨链提现记录

  @observable _trusts = localSave.get('trusts') || [];

  @computed
  get trusts() {
    const currentAccount = this.getCurrentAccount();
    return this._trusts.filter((item = {}) => item.address === currentAccount.address) || [];
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

  fetchNodeStatus = (url = '/getTrustNodeStatus', trusteeAddress = ['2N1CPZyyoKj1wFz2Fy4gEHpSCVxx44GtyoY']) => {
    const message = JSON.stringify({
      id: _.uniqueId(),
      jsonrpc: '1.0',
      method: 'listunspent',
      params: [6, 99999999, trusteeAddress],
    });
    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: message,
    })
      .then(res => {
        if (res && res.status === 200) {
          return res.json();
        }
      })
      .then(res => res);
  };

  subScribeNodeStatus = () => {
    const trusts = _.cloneDeep(this.trusts);
    trusts.map(item => {
      if (item.node && item.trusteeAddress) {
        this.fetchNodeStatus(item.node, item.trusteeAddress).then(res => {
          console.log(res, '--------------信托res');
          if (res) {
            item.connected = true;
            this.changeModel('trusts', trusts);
          } else {
            item.connected = false;
            this.changeModel('trusts', trusts);
          }
        });
      }
    });
  };

  updateTrust = (obj = {}) => {
    const trusts = _.cloneDeep(this.trusts);
    const currentAccount = this.getCurrentAccount();
    const { address } = currentAccount;
    const { chain, hotPubKey, coldPubKey, node, trusteeAddress, decodedHotKey } = obj;
    const findOne = trusts.filter((item = {}) => item.address === address && item.chain === chain)[0];
    if (!findOne) {
      trusts.push({
        address,
        chain,
        hotPubKey,
        coldPubKey,
      });
    } else {
      if (hotPubKey) findOne.hotPubKey = hotPubKey;
      if (coldPubKey) findOne.coldPubKey = coldPubKey;
      if (node) findOne.node = node;
      if (trusteeAddress) findOne.trusteeAddress = trusteeAddress;
      if (decodedHotKey) findOne.decodedHotKey = decodedHotKey;
    }
    this.changeModel('trusts', trusts);
    this.subScribeNodeStatus();
    console.log(trusts);
  };

  getAllWithdrawalList = async () => {
    const withdrawListResp = await getWithdrawalList('Bitcoin', 0, 100);
    this.changeModel('onChainAllWithdrawList', withdrawListResp.data);
  };
}
