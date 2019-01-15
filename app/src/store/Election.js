import { ChainX, observable, moment_helper } from '../utils';
import ModelExtend from './ModelExtend';
import { getIntentions, nominate } from '../services';

export default class Election extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'election';
  @observable intentions = []; //所有节点
  @observable validatorIntentions = []; //结算节点
  @observable trustIntentions = []; //信托节点
  @observable waitingIntentions = []; //候补节点

  getIntentions = async () => {
    let res = await getIntentions();
    let validatorIntentions = [];
    // let trustIntentions = [];
    let waitingIntentions = [];
    if (res) {
      res = res.map((item = []) => {
        return {
          address: item[0],
          time: moment_helper.format(item[1]),
          ...item[2],
        };
      });
      validatorIntentions = res.filter(item => item.isValidator);
      waitingIntentions = res.filter(item => !item.isValidator);
    }
    this.changeModel('intentions', res, []);
    this.changeModel('validatorIntentions', validatorIntentions, []);
    this.changeModel('waitingIntentions', waitingIntentions, []);
  };

  nominate = ({ signer, acceleration, target, amount, remark }) => {
    nominate(signer, acceleration, target, Number(amount), remark, (err, result) => {
      console.log(result);
    });
  };

  unnominate = () => {
    ChainX.stake.unnominate(
      ChainX.account.from('Alice'),
      1,
      ChainX.account.from('Bob').address(),
      1,
      '取消投票',
      (err, result) => {
        console.log(result);
      }
    );
  };

  /*更新节点*/
  refresh = ({}) => {
    ChainX.stake.refresh(ChainX.account.from('Bob'), 1, 'www.baidu.com', true, (err, result) => {
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

  /*解冻 */
  unfreeze = () => {
    ChainX.stake.unfreeze(ChainX.account.from('Alice'), 1, ChainX.account.from('Bob').address(), 0, (err, result) => {
      console.log(result);
    });
  };
}
