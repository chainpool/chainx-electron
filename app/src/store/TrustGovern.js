import { observable, autorun, toJS, _ } from '../utils';
import {
  particularAccounts,
  getMultiSigAddrInfo,
  getPendingListFor,
  getTrusteeInfoByAccount,
  trusteeGovernSign,
  trusteeRemoveMultiSig,
  trusteeGovernExecute,
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
  @observable hotEntity = {}; // 普通交易本届信托的热多签，包含热多签地址和热多签赎回脚本
  @observable coldEntity = {};

  @computed get normalizedTrusteeProposal() {
    if (!this.trusteeProposal) return '';
    return {
      ...this.trusteeProposal,
      newTrustees: this.trusteeProposal.newTrustees.map(item => {
        const findOne = this.rootStore.electionStore.originIntentions.find(
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
        trusteeSign: Number(ownersDone[index]) === 1,
      };
      const findOne = this.rootStore.electionStore.originIntentions.find(
        one => one.account === `0x${this.decodeAddressAccountId(item.addr)}`
      );
      if (findOne) {
        return {
          ...newItem,
          name: findOne.name,
          trusteeSign: Number(ownersDone[index]) === 1,
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

  reload = () => {
    this.getMultiSigAddrInfo();
    this.getPendingListFor();
    this.getHotColdEntity();
  };

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
    console.log(res, '----pendinglist');
    const trusteeProposal = res.find(item => item.proposal.methodName === 'xBridgeFeatures::transitionTrusteeSession');
    if (res && !res.length) {
      this.changeModel('trusteeProposal', '');
    } else if (trusteeProposal) {
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

  trusteeGovernSign = async () => {
    // trusteeGovernSign
    const getParticularAccounts = this.particularBTCTrusteeAccount;
    const proposalId = this.trusteeProposal.proposalId;
    const extrinsic = await trusteeGovernSign(getParticularAccounts, proposalId);
    return {
      extrinsic,
      success: this.reload,
    };
  };

  removeMultiSign = async () => {
    const getParticularAccounts = this.particularBTCTrusteeAccount;
    const proposalId = this.trusteeProposal.proposalId;
    const extrinsic = await trusteeRemoveMultiSig(getParticularAccounts, proposalId);
    return {
      extrinsic,
      success: this.reload,
    };
  };

  trusteeGovernExecute = async ({ addrs }) => {
    const getParticularAccounts = this.particularBTCTrusteeAccount;
    const extrinsic = await trusteeGovernExecute({ account: getParticularAccounts, addrs });
    return {
      extrinsic,
      success: this.reload,
    };
  };

  getHotColdEntity = async () => {
    const res = await this.rootStore.trustStore.getTrusteeSessionInfo('Bitcoin');
    if (res) {
      const { coldEntity, hotEntity } = res;
      this.changeModel({
        coldEntity,
        hotEntity,
      });
    }
  };
}
