import { observable, ChainX } from '../utils';
import ModelExtend from './ModelExtend';

export default class Asset extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';

  transfer = async () => {
    ChainX.asset.transfer(
      ChainX.account.from('Alice'),
      1,
      ChainX.account.from('Bob').address(),
      'PCX',
      0.1,
      '哈哈哈哈哈',
      (err, result) => {
        if (!err) {
          console.log(result, '---------');
        }
      }
    );
  };
}
