import { _, ChainX, observable, resOk, Rx } from '../utils';
import ModelExtend from './ModelExtend';
import {
  claim,
  getBlockNumberObservable,
  getIntentions,
  getNominationRecords,
  getPseduIntentions,
  getPseduNominationRecords,
  nominate,
  refresh,
  unfreeze,
  unnominate,
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
          revocationHeight: revocation[0],
          amount: revocation[1],
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
    const getPseduIntentions$ = Rx.combineLatest(
      getPseduIntentions(),
      this.getPseduNominationRecords(),
      getBlockNumberObservable()
    );
    let res = [];
    return getPseduIntentions$.subscribe(([pseduIntentions = [], pseduIntentionsRecord = [], chainHeight]) => {
      res = pseduIntentions.map((item = {}) => {
        const token = item.id;
        const findOne = pseduIntentionsRecord.filter(one => one.id === item.id)[0] || {};
        item = {
          ...item,
          ...findOne,
          lastDepositWeigh: findOne.lastTotalDepositWeight,
          lastDepositWeightUpdate: findOne.lastTotalDepositWeightUpdate,
        };
        item.discountVote = this.setPrecision(item.price * item.circulation * 0.5, token);
        item.interest = this.getInterest(chainHeight, {
          lastWeightUpdate: item.lastDepositWeightUpdate,
          amount: item.balance,
          lastWeight: item.lastDepositWeigh,
          lastTotalWeightUpdate: item.lastTotalDepositWeightUpdate,
          totalAmount: item.circulation,
          lastTotalWeight: item.lastTotalDepositWeight,
          jackpot: item.jackpot,
        });
        return {
          ...item,
          interestShow: this.setPrecision(item.interest, token),
          discountVoteShow: this.setPrecision(item.discountVote, token),
          balanceShow: this.setPrecision(item.balance, token),
          circulationShow: this.setPrecision(item.circulation, token),
          priceShow: this.setPrecision(item.price, token),
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
  };

  getNominationRecords = async () => {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount.address) {
      return await getNominationRecords(currentAccount.address);
    }
  };

  getInterest = (
    chainHeight,
    { lastWeightUpdate, amount, lastWeight, lastTotalWeightUpdate, totalAmount, lastTotalWeight, jackpot }
  ) => {
    const userVoteWeight = (chainHeight - lastWeightUpdate) * amount + lastWeight;
    const nodeVoteWeight = (chainHeight - lastTotalWeightUpdate) * totalAmount + lastTotalWeight;
    return (userVoteWeight / nodeVoteWeight) * jackpot;
    // const userVoteWeight = (chainHeight - newItem.lastVoteWeightUpdate) * newItem.nomination + newItem.lastVoteWeight;
    // const nodeVoteWeight =
    //   (chainHeight - newItem.lastTotalVoteWeightUpdate) * newItem.totalNomination + newItem.lastTotalVoteWeight;
    // return (userVoteWeight / nodeVoteWeight) * newItem.jackpot;
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

  /*更新节点*/
  refresh = ({ signer, acceleration, url, participating, address, about }) => {
    console.log(signer, acceleration, url, participating, address, about, '==========');
    refresh(signer, acceleration, url, participating, address, about, (err, result) => {
      console.log(result);
    });
  };

  /*提息*/
  claim = ({ signer, acceleration, target }) => {
    claim(signer, acceleration, target, (err, result) => {
      resOk(result) && this.reload();
    });
  };
}
