import { observable, autorun, toJS, _ } from '../utils';
import {
  particularAccounts,
  getMultiSigAddrInfo,
  getPendingListFor,
  getTrusteeInfoByAccount,
  trusteeGovenSign,
} from '../services';
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
  @observable trusteeProposal = '';

  @computed get normalizedTrusteeProposal() {
    if (!this.trusteeProposal) return '';
    return {
      ...this.trusteeProposal,
      newTrustees: this.trusteeProposal.newTrustees.map(item => {
        const findOne = this.rootStore.electionStore.trustIntentions.find(
          one => one.account === `0x${this.decodeAddressAccountId(item.addr)}`
        );
        if (findOne) {
          return {
            ...item,
            name: findOne.name,
          };
        }
        return item;
      }),
    };
  }

  @computed get proposalTrusteeList() {
    let ownerList = this.ownerList.map(item => ({
      addr: item[0],
      action: item[1],
    }));
    const currentAccount = this.getCurrentAccount();
    let ownersDone = '';
    if (this.trusteeProposal) {
      ownersDone = this.trusteeProposal.ownersDoneShow.split('').reverse();
    }
    ownerList = ownerList.map((item, index) => {
      const newItem = {
        ...item,
        isSelf: currentAccount.address === item.addr,
        trusteeSign: ownersDone[index],
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
      } else {
        return {
          ...newItem,
          name: `${item.addr.slice(0, 5)}...${item.addr.slice(-5)}`,
        };
      }
    });
    return ownerList;
  }

  @computed get proposalTotalSignCount() {
    // 信托列表的长度
    return this.proposalTrusteeList.length;
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
    const trusteeProposal = res.find(item => item.proposal.methodName === 'xBridgeFeatures|transitionTrusteeSession');
    if (trusteeProposal) {
      const {
        ownersDone,
        proposalId,
        proposal: {
          args: { chain, new_trustees },
        },
      } = trusteeProposal;
      const newTrustees = new_trustees.map(item => ({
        addr: item,
        chain,
      }));

      this.changeModel('trusteeProposal', {
        ownersDone,
        proposalId,
        ownersDoneShow: Number(trusteeProposal.ownersDone).toString('2'),
        newTrustees: newTrustees.map(item => {
          const findOne = (this.trusteeProposal.newTrustees || []).find(one => one.addr === item.addr);
          if (findOne) {
            return {
              ...item,
              ...findOne,
            };
          }
          return item;
        }),
      });
      const trusteeInfos = newTrustees.map(item => getTrusteeInfoByAccount(item.addr));
      let infos = await Promise.all(trusteeInfos);
      if (infos && infos.length) {
        this.changeModel('trusteeProposal', {
          ...this.trusteeProposal,
          newTrustees: this.trusteeProposal.newTrustees.map((item, index) => {
            return {
              ...item,
              ...infos[index][item.chain],
            };
          }),
        });
      }
    }
  };

  trusteeGovenSign = async () => {
    const getParticularAccounts = await this.getParticularAccounts();
    console.log(getParticularAccounts);
  };
}
