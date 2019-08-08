import { observable, autorun, toJS, _ } from '../utils';
import { Toast } from '../components';
import {
  particularAccounts,
  getMultiSigAddrInfo,
  getPendingListFor,
  getTrusteeInfoByAccount,
  trusteeGovernSign,
  trusteeRemoveMultiSig,
  trusteeGovernExecute,
  getMockBitcoinNewTrustees,
} from '../services';
import ModelExtend from './ModelExtend';

import { computed } from 'mobx';

export default class TrustGovern extends ModelExtend {
  constructor(props) {
    super(props);
  }
  @observable name = 'TrustGovern';
  @observable particularBTCTrusteeAccount = '';
  @observable ownerList = []; //信托列表，不是已经签名的列表
  @observable proposalMaxSignCount = '';
  @observable trusteeProposals = [];
  @observable hotEntity = {}; // 普通交易本届信托的热多签，包含热多签地址和热多签赎回脚本
  @observable coldEntity = {};

  @computed get normalizedTrusteeProposals() {
    if (!this.trusteeProposals) return [];
    return this.trusteeProposals.map(proposal => {
      return {
        ...proposal,
        newTrustees: proposal.newTrustees.map(item => {
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
    });
  }

  // 每个proposal的新的信托列表详细
  @computed get proposalTrusteeLists() {
    let ownerList = this.ownerList.map(item => ({
      addr: item[0],
      action: item[1],
    }));
    const currentAccount = this.getCurrentAccount();
    return this.trusteeProposals.map(proposal => {
      let ownersDone = '';
      if (proposal) {
        ownersDone = proposal.ownersDoneShow.split('').reverse();
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
    });
  }

  @computed get proposalTotalSignCount() {
    // 信托列表的长度
    return this.ownerList.length;
  }

  reload = () => {
    this.getParticularAccounts();
    this.getMultiSigAddrInfo();
    this.getPendingListFor();
    this.getHotColdEntity();
  };

  getParticularAccounts = async () => {
    const res = await particularAccounts();
    if (res && res.trusteesAccount) {
      const value = res.trusteesAccount.Bitcoin;
      this.changeModel('particularBTCTrusteeAccount', value);
      return value;
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
    const trusteeProposals = res.filter(
      item => item.proposal.methodName === 'xBridgeFeatures::transitionTrusteeSession'
    );
    if (res && !res.length) {
      this.changeModel('trusteeProposals', []);
    } else if (trusteeProposals) {
      const newProposalsFirst = trusteeProposals.map(trusteeProposal => {
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
        const findOne = this.trusteeProposals.find(item => item.proposalId === proposalId);
        return {
          ownersDone,
          proposalId,
          proposal: {
            args: { chain, new_trustees },
          },
          ownersDoneShow: Number(trusteeProposal.ownersDone).toString('2'),
          newTrustees: newTrustees.map((item, index) => {
            if (findOne) {
              return {
                ...findOne.newTrustees[index],
                ...item,
              };
            }
            return item;
          }),
        };
      });

      this.changeModel(`trusteeProposals`, newProposalsFirst);
      let results = [];
      for (let i = 0; i < trusteeProposals.length; i++) {
        const trusteeProposal = trusteeProposals[i];
        const {
          proposalId,
          proposal: {
            args: { chain, new_trustees },
          },
        } = trusteeProposal;
        const newTrustees = new_trustees.map(item => ({
          addr: item,
          chain,
        }));
        const findOne = this.trusteeProposals.find(item => item.proposalId === proposalId);
        const trusteeInfos = newTrustees.map(item => getTrusteeInfoByAccount(item.addr));
        const infos = await Promise.all(trusteeInfos);
        if (infos && infos.length) {
          results.push({
            ...findOne,
            newTrustees: findOne.newTrustees.map((item, index) => {
              return {
                ...item,
                ...infos[index][item.chain],
              };
            }),
          });
        }
      }
      this.changeModel(`trusteeProposals`, results);
    }
  };

  trusteeGovernSign = async ({ proposalId }) => {
    // trusteeGovernSign
    const getParticularAccounts = this.particularBTCTrusteeAccount;
    const extrinsic = await trusteeGovernSign(getParticularAccounts, proposalId);
    return {
      extrinsic,
      success: this.reload,
    };
  };

  removeMultiSign = async ({ proposalId }) => {
    const getParticularAccounts = this.particularBTCTrusteeAccount;
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

  getMockBitcoinNewTrustees = async ({ addrs }) => {
    addrs = addrs.map(item => `0x${this.decodeAddressAccountId(item)}`);
    const res = await getMockBitcoinNewTrustees(addrs);
    if (res && res.data) {
      return {
        ...res.data,
        trusteeList: res.data.trusteeList.map(item => {
          const findOne = this.rootStore.electionStore.originIntentions.find(one => one.account === item.accountId);
          return {
            ...item,
            name: findOne.name,
          };
        }),
      };
    } else if (res && res.error && res.error.message) {
      Toast.warn(res.error.message);
    }
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
