import { observable, ChainX } from '../utils';
import ModelExtend from './ModelExtend';

export default class Asset extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';

  transfer = ({ signer, dest, acceleration, token, amount, remark }) => {
    ChainX.asset.transfer(signer, Number(acceleration), dest, token, Number(amount), remark, (err, result) => {
      console.log(result);
    });
  };
}
