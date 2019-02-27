import { ChainX, formatNumber, observable } from '../utils';
import ModelExtend from './ModelExtend';
import {
  depositClaim,
  getBondingDuration,
  getIntentionBondingDuration,
  getIntentions,
  getNominationRecords,
  getPseduIntentions,
  getPseduNominationRecords,
  nominate,
  refresh,
  register,
  unfreeze,
  unnominate,
  voteClaim,
} from '../services';
import { computed } from 'mobx';
import { Chainx } from '@utils/index';

export default class Election extends ModelExtend {
  @observable name = 'election';
  @observable originIntentions = []; // intentions rpc返回数据
  @observable originNominationRecords = []; // 投票记录rpc返回数据
  @observable bondingDuration = 0; // 投票赎回锁定块数
  @observable intentionBondingDuration = 0; // 节点赎回自投票锁定块数
  @observable originPseduIntentions = [];
  @observable originPseduRecords = [];

  @computed get normalizedPseduIntentions() {
    const nativeAssetPrecision = this.rootStore.globalStore.nativeAssetPrecision;
    const precisionMap = this.rootStore.globalStore.assetNamePrecisionMap;

    return this.originPseduIntentions.map((intention = {}) => {
      const token = intention.id;
      // 折合投票数
      const discountVote = (intention.power * intention.circulation) / Math.pow(10, precisionMap[token]);

      const result = {
        ...intention,
        discountVote: formatNumber.toPrecision(discountVote, nativeAssetPrecision),
        circulation: this.setPrecision(intention.circulation, token),
        price: formatNumber.toPrecision(intention.power, nativeAssetPrecision),
        jackpot: this.setPrecision(intention.jackpot, nativeAssetPrecision),
      };

      const record = this.originPseduRecords.find(record => record.id === intention.id) || {};
      if (record) {
        // 用户最新总票龄  = （链最新高度 - 用户总票龄更新高度）*用户投票金额 +用户总票龄
        const myWeight =
          (this.blockNumber - record.lastTotalDepositWeightUpdate) * record.balance + record.lastTotalDepositWeight;
        // 节点最新总票龄  = （链最新高度 - 节点总票龄更新高度）*节点得票总额 +节点总票龄
        const nodeVoteWeight =
          (this.blockNumber - intention.lastTotalDepositWeightUpdate) * intention.circulation +
          intention.lastTotalDepositWeight;
        // 待领利息 = 用户最新总票龄 / 节点最新总票龄 * 节点奖池金额

        // TODO: record.lastTotalDepositWeightUpdate <= 0的条件属于补救措施，后边应改掉
        const interest =
          nodeVoteWeight <= 0 || record.lastTotalDepositWeightUpdate <= 0
            ? 0
            : (myWeight / nodeVoteWeight) * intention.jackpot * 0.9;

        Object.assign(result, {
          interest: this.setPrecision(interest, nativeAssetPrecision),
          balance: this.setPrecision(record.balance, token),
        });
      }

      return result;
    });
  }

  @computed get validatorsWithAddress() {
    return this.originIntentions.map(intention => {
      return Object.assign({}, intention, {
        address: ChainX.account.encodeAddress(intention.account),
        sessionAddress: ChainX.account.encodeAddress(intention.sessionKey),
      });
    });
  }

  @computed get blockNumber() {
    return this.rootStore.chainStore.blockNumber;
  }

  // 当前账户节点
  @computed get accountValidator() {
    const account = this.getCurrentAccount();
    return this.validatorsWithAddress.find(validator => validator.address === account.address);
  }

  @computed get validatorsWithRecords() {
    if (typeof this.blockNumber === 'undefined') {
      return [];
    }

    const calcRecordsForIntention = intention => {
      const myRecord = (this.originNominationRecords || []).find(record => record[0] === intention.account);
      if (!myRecord) {
        return {
          myTotalVote: 0,
          myRevocation: 0,
          myInterest: 0,
        };
      }

      const record = myRecord[1];
      const myTotalVote = record.nomination;
      const myRevocations = record.revocations.map(revocation => {
        return {
          revocationHeight: revocation.blockNumer,
          amount: revocation.value,
        };
      });
      const myRevocation = myRevocations.reduce((result, revocation) => {
        return result + revocation.amount;
      }, 0);

      // 用户最新总票龄  = （链最新高度 - 用户总票龄更新高度）*用户投票金额 +用户总票龄
      const myWeight = (this.blockNumber - record.lastVoteWeightUpdate) * myTotalVote + record.lastVoteWeight;
      // 节点最新总票龄  = （链最新高度 - 节点总票龄更新高度）*节点得票总额 +节点总票龄
      const nodeVoteWeight =
        (this.blockNumber - intention.lastTotalVoteWeightUpdate) * intention.totalNomination +
        intention.lastTotalVoteWeight;
      // 待领利息 = 用户最新总票龄 / 节点最新总票龄 * 节点奖池金额
      const myInterest = (myWeight / nodeVoteWeight) * intention.jackpot;

      return {
        myTotalVote,
        myRevocation,
        myInterest,
        myRevocations,
      };
    };

    return this.validatorsWithAddress.map(intention => {
      return Object.assign({}, intention, calcRecordsForIntention(intention));
    });
  }

  @computed get validators() {
    return [...this.validatorsWithRecords.filter(intention => intention.isValidator)].sort((a, b) => {
      return b.totalNomination - a.totalNomination;
    });
  }

  // 信托节点
  @computed get trustIntentions() {
    return [...this.validatorsWithRecords].filter(validator => validator.isTrustee);
  }

  @computed get backupValidators() {
    return [...this.validatorsWithRecords.filter(intention => !intention.isValidator)].sort((a, b) => {
      return b.totalNomination - a.totalNomination;
    });
  }

  @computed get validatorsWithMyNomination() {
    return [
      ...this.validatorsWithRecords.filter(intention => intention.myTotalVote > 0 || intention.myRevocation > 0),
    ].sort((a, b) => {
      return b.totalNomination - a.totalNomination;
    });
  }

  reload = () => {
    this.getIntentions();
    this.getPseduIntentions();
    this.getAccountAssets();
  };

  getPseduIntentions = async () => {
    const [intentions, records] = await Promise.all([getPseduIntentions(), this.getPseduNominationRecords()]);
    this.changeModel('originPseduIntentions', intentions);
    this.changeModel('originPseduRecords', records || []);
  };

  getPseduNominationRecords = async () => {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount.address) {
      return await getPseduNominationRecords(currentAccount.address);
    }
  };

  getIntentions = async () => {
    const [intentions, records] = await Promise.all([getIntentions(), this.getNominationRecords()]);
    this.changeModel('originIntentions', intentions);
    this.changeModel('originNominationRecords', records);
  };

  getNominationRecords = async () => {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount.address) {
      return await getNominationRecords(currentAccount.address);
    }
  };

  nominate = ({ target, amount, remark }) => {
    amount = this.setDefaultPrecision(amount, true);
    const extrinsic = nominate(target, Number(amount), remark);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  /*解冻 */
  unfreeze = ({ target, revocationIndex }) => {
    const extrinsic = unfreeze(target, revocationIndex);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  unnominate = ({ target, amount, remark }) => {
    amount = this.setDefaultPrecision(amount, true);
    const extrinsic = unnominate(target, amount, remark);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  register = ({ name }) => {
    const extrinsic = register(name);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  /*更新节点*/
  refresh = ({ url, participating, address, about }) => {
    const extrinsic = refresh(url, participating, address, about);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  /*提息*/
  voteClaim = ({ target }) => {
    const extrinsic = voteClaim(target);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  depositClaim = ({ token }) => {
    const extrinsic = depositClaim(token);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  getBondingDuration = async () => {
    const duration = await getBondingDuration();
    this.changeModel('bondingDuration', duration);
  };

  getIntentionBondingDuration = async () => {
    const duration = await getIntentionBondingDuration();
    this.changeModel('intentionBondingDuration', duration);
  };
}
