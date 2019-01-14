import { ChainX, observable } from '../utils';
import ModelExtend from './ModelExtend';

export default class Election extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'election';

  nominate = () => {
    ChainX.stake.nominate(
      ChainX.account.from('Alice'),
      1,
      ChainX.account.from('Bob').address(),
      1,
      '投票',
      (err, result) => {
        console.log(result);
      }
    );
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
