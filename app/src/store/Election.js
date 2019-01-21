import { _, ChainX, observable, formatNumber, Rx, resOk } from '../utils';
import ModelExtend from './ModelExtend';
import {
  getIntentions,
  nominate,
  getNominationRecords,
  refresh,
  unnominate,
  unfreeze,
  getBlockNumberObservable,
  claim,
  getPseduIntentions,
  getPseduNominationRecords,
} from '../services';

export default class Election extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'election';
  @observable intentions = []; //所有节点
  @observable validatorIntentions = []; //结算节点
  @observable trustIntentions = []; //信托节点
  @observable waitingIntentions = []; //候补节点
  @observable myIntentions = []; //我的节点
  @observable pseduIntentions = []; //充值挖矿列表

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
    const intentions$ = Rx.combineLatest(getIntentions(), this.getNominationRecords(), getBlockNumberObservable());
    return intentions$.subscribe(([intentions = [], nominationRecords = [], chainHeight]) => {
      let res = intentions;
      let validatorIntentions = [];
      // let trustIntentions = [];
      let waitingIntentions = [];
      let myIntentions = [];
      if (res) {
        res = res.map((item = {}) => {
          const findVotes = nominationRecords.filter((one = []) => one[0] === item.account)[0] || [];
          const newItem = { ...item, ...(findVotes.length ? findVotes[1] : {}) };
          newItem.revocationsTotal = _.get(newItem, 'revocations.length')
            ? _.sumBy(newItem.revocations, (one = []) => one[1])
            : undefined; // 总的撤回投票记录

          newItem.interest = this.getInterest(chainHeight, {
            lastWeightUpdate: newItem.lastVoteWeightUpdate,
            amount: newItem.nomination,
            lastWeight: newItem.lastVoteWeight,
            lastTotalWeightUpdate: newItem.lastTotalVoteWeightUpdate,
            totalAmount: newItem.totalNomination,
            lastTotalWeight: newItem.lastTotalVoteWeight,
            jackpot: newItem.jackpot,
          }); // 待领利息

          return {
            ...newItem,
            interestShow: this.setDefaultPrecision(item.interest),
            account: ChainX.account.encodeAddress(newItem.account),
            nominationShow: this.setDefaultPrecision(newItem.nomination),
            jackpotShow: this.setDefaultPrecision(newItem.jackpot),
            selfVoteShow: this.setDefaultPrecision(newItem.selfVote),
            totalNominationShow: this.setDefaultPrecision(newItem.totalNomination),
            revocationsTotalShow: this.setDefaultPrecision(newItem.revocationsTotal),
          };
        });
        validatorIntentions = res.filter(item => item.isValidator);
        myIntentions = res.filter(item => !item.isValidator && (item.nomination || item.revocationsTotal));
        waitingIntentions = res.filter(item => !item.isValidator && !item.nomination && !item.revocationsTotal);
      }
      this.changeModel(
        {
          intentions: res,
          validatorIntentions,
          myIntentions,
          waitingIntentions,
        },
        []
      );
    });
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
  refresh = ({ signer, acceleration, url, participating }) => {
    console.log(signer, acceleration, url, participating, '==========');
    refresh(signer, acceleration, url, participating, (err, result) => {
      console.log(result);
    });
    // ChainX.stake.refresh(ChainX.account.from('Bob'), 1, 'www.baidu.com', true, (err, result) => {
    //   console.log(result);
    // });
  };

  /*提息*/
  claim = ({ signer, acceleration, target }) => {
    claim(signer, acceleration, target, (err, result) => {
      resOk(result) && this.reload();
    });
  };
}
