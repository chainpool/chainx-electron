import { ChainX, observable, resOk, Rx } from '../utils';
import ModelExtend from './ModelExtend';
import {
  claim,
  getIntentions,
  getNominationRecords,
  getPseduIntentions,
  getPseduNominationRecords,
  nominate,
  refresh,
  register,
  unfreeze,
  unnominate,
  getBondingDuration,
} from '../services';
import { computed } from 'mobx';

export default class Election extends ModelExtend {
  @observable name = 'election';
  @observable originIntentions = []; // intentions rpc返回数据
  @observable originNominationRecords = []; // 投票记录rpc返回数据
  @observable intentions = []; //所有节点
  @observable validatorIntentions = []; //结算节点
  @observable trustIntentions = []; //信托节点
  @observable waitingIntentions = []; //候补节点
  @observable myIntentions = []; //我的节点
  @observable pseduIntentions = []; //充值挖矿列表
  @observable bondingDuration = 0; // 投票赎回锁定块数

  @computed get validatorsWithAddress() {
    return this.originIntentions.map(intention => {
      return Object.assign({}, intention, { address: ChainX.account.encodeAddress(intention.account) });
    });
  }

  // 当前账户节点
  @computed get accountValidator() {
    const account = this.getCurrentAccount();
    return this.validatorsWithAddress.find(validator => validator.address === account.address);
  }

  @computed get validatorsWithRecords() {
    const blockNumber = this.rootStore.chainStore.blockNumber;
    if (typeof blockNumber === 'undefined') {
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
      const myWeight = (blockNumber - record.lastVoteWeightUpdate) * myTotalVote + record.lastVoteWeight;
      // 节点最新总票龄  = （链最新高度 - 节点总票龄更新高度）*节点得票总额 +节点总票龄
      const nodeVoteWeight =
        (blockNumber - intention.lastTotalVoteWeightUpdate) * intention.totalNomination + intention.lastTotalVoteWeight;
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
  };

  getPseduIntentions = async () => {
    const getPseduIntentions$ = Rx.combineLatest(getPseduIntentions(), this.getPseduNominationRecords());
    let res = [];
    return getPseduIntentions$.subscribe(([pseduIntentions = [], records = []]) => {
      res = pseduIntentions.map((item = {}) => {
        const token = item.id;
        const record = records.find(record => record.id === item.id) || {};
        item = {
          ...item,
          ...record,
          lastDepositWeigh: record.lastTotalDepositWeight,
          lastDepositWeightUpdate: record.lastTotalDepositWeightUpdate,
        };
        item.discountVote = this.setPrecision(item.price * item.circulation, token);

        const blockNumber = this.rootStore.chainStore.blockNumber;
        // 用户最新总票龄  = （链最新高度 - 用户总票龄更新高度）*用户投票金额 +用户总票龄
        const myWeight = (blockNumber - item.lastDepositWeightUpdate) * record.balance + item.lastDepositWeigh;
        // 节点最新总票龄  = （链最新高度 - 节点总票龄更新高度）*节点得票总额 +节点总票龄
        const nodeVoteWeight =
          (blockNumber - item.lastTotalDepositWeightUpdate) * item.circulation + item.lastTotalDepositWeight;
        // 待领利息 = 用户最新总票龄 / 节点最新总票龄 * 节点奖池金额
        item.interest = (myWeight / nodeVoteWeight) * item.jackpot;

        return {
          ...item,
          interestShow: this.setPrecision(item.interest, token),
          discountVoteShow: item.discountVote,
          balanceShow: this.setPrecision(item.balance, token),
          circulationShow: this.setPrecision(item.circulation, token),
          priceShow: item.price,
          jackpotShow: this.setPrecision(item.jackpot, token),
        };
      });
      this.changeModel(
        {
          pseduIntentions: res,
        },
        []
      );
    });
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
    console.log('records:', records);
  };

  getNominationRecords = async () => {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount.address) {
      return await getNominationRecords(currentAccount.address);
    }
  };

  nominate = ({ signer, acceleration, target, amount, remark }) => {
    amount = this.setDefaultPrecision(amount, true);
    nominate(signer, acceleration, target, Number(amount), remark, (err, result) => {
      resOk(result) && this.reload();
    });
  };

  /*解冻 */
  unfreeze = ({ signer, acceleration, target, revocationIndex }) => {
    unfreeze(signer, acceleration, target, revocationIndex, (err, result) => {
      resOk(result) && this.reload();
    });
  };

  unnominate = ({ signer, acceleration, target, amount, remark }) => {
    amount = this.setDefaultPrecision(amount, true);
    unnominate(signer, acceleration, target, amount, remark, (err, result) => {
      resOk(result) && this.reload();
    });
  };

  register = ({ signer, acceleration, name }) => {
    register(signer, Number(acceleration), name, (err, result) => {
      resOk(result) && this.reload();
    });
  };

  /*更新节点*/
  refresh = ({ signer, acceleration, url, participating, address, about }) => {
    refresh(signer, acceleration, url, participating, address, about, (err, result) => {
      resOk(result) && this.reload();
    });
  };

  /*提息*/
  claim = ({ signer, acceleration, target }) => {
    claim(signer, acceleration, target, (err, result) => {
      resOk(result) && this.reload();
    });
  };

  getBondingDuration = async () => {
    const duration = await getBondingDuration();
    this.changeModel('bondingDuration', duration);
  };
}
