import { ChainX, observable } from '../utils';
import ModelExtend from './ModelExtend';

export default class Election extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'election';

  register = () => {
    ChainX.stake.register(
      ChainX.account.from('Alice'),
      1,
      'genesis_cert',
      ChainX.account.from('Bob').address(),
      'bobregister',
      'url1111',
      1,
      '红红火火',
      (err, result) => {
        console.log(result);
      }
    );
  };

  nominate = () => {
    ChainX.stake.nominate(
      ChainX.account.from('Alice'),
      1,
      ChainX.account.from('Bob').address(),
      1,
      '哈哈哈哈哈',
      (err, result) => {
        console.log(result);
      }
    );
  };
}
