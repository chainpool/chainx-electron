import { observable, ChainX } from '../utils';
import ModelExtend from './ModelExtend';

export default class Asset extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';

  getAssetsByAccount = () => {
    const currenAccount = this.getCurrentAccount();
    console.log(currenAccount.address);
    ChainX.asset.getAssetsByAccount(currenAccount.address).then(res => console.log(res, '===='));
  };

  register = ({ signer, acceleration, certName, intention, name, url, shareCount, remark }) => {
    ChainX.stake.register(
      signer,
      Number(acceleration),
      certName,
      intention,
      name,
      url,
      Number(shareCount),
      remark,
      (err, result) => {
        console.log(result);
      }
    );
  };

  transfer = ({ signer, acceleration, dest, token, amount, remark }) => {
    ChainX.asset.transfer(signer, Number(acceleration), dest, token, Number(amount), remark, (err, result) => {
      console.log(result);
    });
  };
}
