import { moment, observable, formatNumber } from '../utils';
import ModelExtend from './ModelExtend';
import { getWithdrawalList } from '../services';
import { computed } from 'mobx';

export default class Trust extends ModelExtend {
  @observable name = 'Trust';
  @observable onChainAllWithdrawList = []; // runtime中所有跨链提现记录

  @computed get normalizedOnChainAllWithdrawList() {
    const assetNamePrecisionMap = this.rootStore.globalStore.assetNamePrecisionMap; // 获取资产 name => precision map数据结构
    if (assetNamePrecisionMap.size <= 0) {
      return [];
    }

    return this.onChainAllWithdrawList.map(withdraw => {
      let precision = assetNamePrecisionMap.get(withdraw.token);
      if (typeof precision === 'undefined') {
        // TODO: 这种情况出现表明有Error
        throw new Error('无法找到提现列表中资产定义');
      }

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
        applicant: withdraw.applicant, // 申请提现账户地址
        date: moment.formatHMS(withdraw.time * 1000), // 申请时间
        balance: formatNumber.toPrecision(withdraw.balance, precision), // 数量
        token: withdraw.token, // 币种
        addr: withdraw.addr, // 原链地址，提现的目标地址
        state, // 状态
        ext: withdraw.ext, // 提现备注
      };
    });
  }

  getAllWithdrawalList = async () => {
    const withdrawListResp = await getWithdrawalList(0, 100);
    this.changeModel('onChainAllWithdrawList', withdrawListResp.data);
  };
}
