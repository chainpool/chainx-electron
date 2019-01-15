import { observable, ChainX } from '../utils';
import ModelExtend from './ModelExtend';
import { getCert, getAsset, register, transfer } from '../services';

export default class Asset extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';
  @observable certs = []; // 我的证书

  getCert = async () => {
    const currenAccount = this.getCurrentAccount();
    const res = (await getCert(currenAccount.address)) || [];
    this.changeModel('certs', res);
  };

  getAssets = async () => {
    const currenAccount = this.getCurrentAccount();
    const res = await getAsset(currenAccount.address);
    console.log(res);
  };

  register = ({ signer, acceleration, certName, intention, name, url, shareCount, remark }) => {
    console.log(signer, acceleration, certName, intention, name, url, shareCount, remark, '=====');
    register(
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
    transfer(signer, Number(acceleration), dest, token, Number(amount), remark, (err, result) => {
      console.log(result);
    });
  };
}
