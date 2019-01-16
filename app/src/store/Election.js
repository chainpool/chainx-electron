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

  reload = () => {
    this.getIntentions();
  };

  getIntentions = async () => {
    const intentions$ = Rx.combineLatest(
      getIntentions(),
      this.getNominationRecords(),
      await getBlockNumberObservable()
    );
    return intentions$.subscribe(([data1, data2, chainHeight]) => {
      let res = data1;
      let validatorIntentions = [];
      // let trustIntentions = [];
      let waitingIntentions = [];
      let myIntentions = [];
      // console.log(data1, data2, chainHeight, '==============');
      if (res) {
        res = res.map((item = {}) => {
          const findVotes = data2.filter((one = []) => one[0] === item.account)[0] || [];
          const newItem = { ...item, ...(findVotes.length ? findVotes[1] : {}) };
          newItem.revocationsTotal =
            newItem.revocations && newItem.revocations.length
              ? _.sumBy(newItem.revocations, (one = []) => one[1])
              : undefined; // 总的撤回投票记录

          const userVoteWeight =
            (chainHeight - newItem.lastVoteWeightUpdate) * newItem.nomination + newItem.lastVoteWeight;
          const nodeVoteWeight =
            (chainHeight - newItem.lastTotalVoteWeightUpdate) * newItem.totalNomination + newItem.lastTotalVoteWeight;

          newItem.interest = (userVoteWeight / nodeVoteWeight) * newItem.jackpot;

          return {
            ...newItem,
            revocations: newItem.revocations,
            lastVoteWeight: newItem.lastVoteWeight,
            lastVoteWeightUpdate: newItem.lastVoteWeightUpdate,
            account: ChainX.account.encodeAddress(newItem.account),
            nominationShow: formatNumber.localString(newItem.nomination),
            jackpotShow: formatNumber.localString(newItem.jackpot),
            selfVoteShow: formatNumber.localString(newItem.selfVote),
            totalNominationShow: formatNumber.localString(newItem.totalNomination),
            revocationsTotalShow: formatNumber.localString(newItem.revocationsTotal),
          };
        });
        validatorIntentions = res.filter(item => item.isValidator);
        myIntentions = res.filter(item => !item.isValidator && (item.nomination || item.revocationsTotal));
        waitingIntentions = res.filter(item => !item.isValidator && !item.nomination && !item.revocationsTotal);
      }
      this.changeModel('intentions', res, []);
      this.changeModel('validatorIntentions', validatorIntentions, []);
      this.changeModel('myIntentions', myIntentions, []);
      this.changeModel('waitingIntentions', waitingIntentions, []);
    });
  };

  getNominationRecords = async () => {
    const currenAccount = this.getCurrentAccount();
    return await getNominationRecords(currenAccount.address);
  };

  nominate = ({ signer, acceleration, target, amount, remark }) => {
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
  claim = () => {
    ChainX.stake.claim(ChainX.account.from('Alice'), 1, ChainX.account.from('Bob').address(), (err, result) => {
      console.log(result);
    });
  };
}
