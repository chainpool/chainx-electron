import { _, formatNumber, moment_helper, observable, resOk } from '../utils';
import ModelExtend from './ModelExtend';
import { getAsset, getCert, register, transfer } from '../services';

export default class Asset extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';
  @observable certs = []; // 我的证书
  @observable primaryAsset = []; // 原生资产
  @observable crossChainAsset = []; // 原生资产

  reload = () => {
    this.getCert();
    this.getAssets();
  };

  getCert = async () => {
    const currenAccount = this.getCurrentAccount();
    const res = await getCert(currenAccount.address);
    if (res) {
      res.map(item => (item.issuedAt = moment_helper.format(item.issuedAt * 1000)));
    }
    this.changeModel('certs', res, []);
  };

  getAssets = async () => {
    const currenAccount = this.getCurrentAccount();
    const res = await getAsset(currenAccount.address, 0, 100);
    let primaryAsset = [];
    let crossChainAsset = [];
    const format = isNative => {
      return res.data
        .filter(item => item.isNative === isNative)
        .map(item => {
          const {
            Free: free,
            ReservedStaking: reservedStaking,
            ReservedStakingRevocation: reservedStakingRevocation,
            ReservedDexSpot: reservedDexSpot,
            ReservedWithdrawal: reservedWithdrawal,
          } = item.details;
          const total = _.sum([free, reservedStaking, reservedStakingRevocation, reservedDexSpot, reservedWithdrawal]);
          return {
            ...item,
            freeShow: formatNumber.localString(free),
            reservedStakingShow: formatNumber.localString(reservedStaking),
            reservedStakingRevocationShow: formatNumber.localString(reservedStakingRevocation),
            reservedDexSpotShow: formatNumber.localString(reservedDexSpot),
            reservedWithdrawalShow: formatNumber.localString(reservedWithdrawal),
            totalShow: formatNumber.localString(total),
          };
        });
    };
    if (res && res.data) {
      primaryAsset = format(true);
      crossChainAsset = format(false);
    }
    this.changeModel('primaryAsset', primaryAsset, []);
    this.changeModel('crossChainAsset', crossChainAsset, []);
  };

  register = ({ signer, acceleration, certName, intention, name, url, shareCount, remark }) => {
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
        resOk(result) && this.reload();
      }
    );
  };

  transfer = ({ signer, acceleration, dest, token, amount, remark }) => {
    transfer(signer, Number(acceleration), dest, token, Number(amount), remark, (err, result) => {
      resOk(result) && this.reload();
    });
  };
}
