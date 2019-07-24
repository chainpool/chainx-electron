import { observable, autorun, toJS, _ } from '../utils';
import { particularAccounts, getMultiSigAddrInfo, getPendingListFor } from '../services';
import ModelExtend from './ModelExtend';

import { computed } from 'mobx';

export default class TrustGovern extends ModelExtend {
  constructor(props) {
    super(props);
  }
  @observable name = 'TrustGovern';
  @observable particularBTCTrusteeAccount = '';
  @observable ownerList = []; //信托列表，不是已经签名的列表,计算属性proposalTrusteeList做了详细的整理
  @observable proposalMaxSignCount = '';
  @observable proposal = []; // 所有的提议

  @computed get proposalTrusteeList() {
    let ownerList = this.ownerList.map(item => ({
      addr: item[0],
      action: item[1],
    }));

    if (this.trusteeProposal) {
      const currentAccount = this.getCurrentAccount();
      const ownersDone = this.trusteeProposal.ownersDoneShow.split('').reverse();
      ownerList = ownerList.map((item, index) => {
        const newItem = {
          ...item,
          isSelf: currentAccount.address === item.addr,
        };
        const findOne = this.rootStore.electionStore.trustIntentions.find(
          one => one.account === `0x${this.decodeAddressAccountId(item.addr)}`
        );
        if (findOne) {
          return {
            ...newItem,
            name: findOne.name,
            trusteeSign: ownersDone[index],
          };
        }
        return newItem;
      });
    }
    return ownerList;
  }

  @computed get proposalTotalSignCount() {
    // 信托列表的长度
    return this.proposalTrusteeList.length;
  }

  @computed get trusteeProposal() {
    const filterProposal = _.cloneDeep(this.proposal).filter(
      item => item.proposal.methodName === 'xBridgeFeatures|transitionTrusteeSession'
    )[0];

    if (filterProposal) {
      const newTrustee = filterProposal.proposal.args.new_trustees;
      const proposalId = filterProposal.proposalId;
      const ownersDoneShow = Number(filterProposal.ownersDone).toString('2');
      return {
        newTrustee,
        proposalId,
        ownersDoneShow,
      };
    }
  }

  getParticularAccounts = async () => {
    if (this.particularBTCTrusteeAccount) {
      return this.particularBTCTrusteeAccount;
    } else {
      const res = await particularAccounts();
      if (res && res.trusteesAccount) {
        const value = res.trusteesAccount.Bitcoin;
        this.changeModel('particularBTCTrusteeAccount', value);
        return value;
      }
    }
  };

  getMultiSigAddrInfo = async () => {
    const particularBTCTrusteeAccount = await this.getParticularAccounts();
    const res = await getMultiSigAddrInfo(particularBTCTrusteeAccount);
    if (res && res.ownerList) {
      this.changeModel({
        ownerList: res.ownerList,
        proposalMaxSignCount: res.requiredNum,
      });
    }
  };

  getPendingListFor = async () => {
    const particularBTCTrusteeAccount = await this.getParticularAccounts();
    const res = await getPendingListFor(particularBTCTrusteeAccount);
    this.changeModel('proposal', res);
  };
}
