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
    const getPseduIntentions$ = Rx.combineLatest(getPseduIntentions(), this.getPseduNominationRecords());
    let res = [];
    getPseduIntentions$.subscribe(([pseduIntentions = [], PseduIntentionsRecord = []]) => {
      // console.log(pseduIntentions, PseduIntentionsRecord, '==============');
      res = pseduIntentions.map((item = {}) => {
        const findOne = PseduIntentionsRecord.filter(one => one.id === item.id)[0] || {};
        item = { ...item, ...findOne };
        return {
          ...item,
          balanceShow: formatNumber.localString(item.balance),
          circulationShow: formatNumber.localString(item.circulation),
          priceShow: formatNumber.localString(item.price),
          jackpotShow: formatNumber.localString(item.jackpot),
        };
      });
      console.log(res, '=====================');
      this.changeModel(
        {
          pseduIntentions: res,
        },
        []
      );
    });
  };

  getPseduNominationRecords = async () => {
    const currenAccount = this.getCurrentAccount();
    return await getPseduNominationRecords(currenAccount.address);
  };

  getInterest = (chainHeight, newItem = {}) => {
    const userVoteWeight = (chainHeight - newItem.lastVoteWeightUpdate) * newItem.nomination + newItem.lastVoteWeight;
    const nodeVoteWeight =
      (chainHeight - newItem.lastTotalVoteWeightUpdate) * newItem.totalNomination + newItem.lastTotalVoteWeight;
    return (userVoteWeight / nodeVoteWeight) * newItem.jackpot;
  };

  getIntentions = async () => {
    const intentions$ = Rx.combineLatest(getIntentions(), this.getNominationRecords(), getBlockNumberObservable());
    return intentions$.subscribe(([intentions = [], nominationRecords = [], chainHeight]) => {
      let res = intentions;
      let validatorIntentions = [];
      // let trustIntentions = [];
      let waitingIntentions = [];
      let myIntentions = [];
      // console.log(data1, data2, chainHeight, '==============');
      if (res) {
        res = res.map((item = {}) => {
          const findVotes = nominationRecords.filter((one = []) => one[0] === item.account)[0] || [];
          const newItem = { ...item, ...(findVotes.length ? findVotes[1] : {}) };
          newItem.revocationsTotal = _.get(newItem, 'revocations.length')
            ? _.sumBy(newItem.revocations, (one = []) => one[1])
            : undefined; // 总的撤回投票记录

          newItem.interest = this.getInterest(chainHeight, newItem); // 待领利息

          return {
            ...newItem,
            interestShow: formatNumber.localString(newItem.interest),
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
  claim = ({ signer, acceleration, target }) => {
    claim(signer, acceleration, target, (err, result) => {
      resOk(result) && this.reload();
    });
  };
}
