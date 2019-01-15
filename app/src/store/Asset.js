import { _, observable, moment_helper, formatNumber } from '../utils';
import ModelExtend from './ModelExtend';
import { getCert, getAsset, register, transfer } from '../services';

export default class Asset extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';
  @observable certs = []; // 我的证书
  @observable primaryAsset = []; // 原生资产
  @observable crossChainAsset = []; // 原生资产

  getCert = async () => {
    const currenAccount = this.getCurrentAccount();
    const res = await getCert(currenAccount.address);
    if (res) {
      res.map(item => (item.issuedAt = moment_helper.format(item.issuedAt)));
    }
    this.changeModel('certs', res, []);
  };

  getAssets = async () => {
    const currenAccount = this.getCurrentAccount();
    const res = await getAsset(currenAccount.address);
    let primaryAsset = [];
    let crossChainAsset = [];
    const format = isNative => {
      return res
        .filter(item => item.isNative === isNative)
        .map(item => {
          const {
            Free,
            ReservedStaking,
            ReservedStakingRevocation,
            ReservedDexSpot,
            ReservedWithdrawal,
          } = item.details;
          const total = _.sum([Free, ReservedStaking, ReservedStakingRevocation, ReservedDexSpot, ReservedWithdrawal]);
          return {
            ...item,
            freeShow: formatNumber.localString(Free),
            free: Free,
            reservedStakingShow: formatNumber.localString(ReservedStaking),
            reservedStaking: ReservedStaking,
            reservedStakingRevocationShow: formatNumber.localString(ReservedStakingRevocation),
            reservedStakingRevocation: ReservedStakingRevocation,
            reservedDexSpotShow: formatNumber.localString(ReservedDexSpot),
            reservedDexSpot: ReservedDexSpot,
            reservedWithdrawalShow: formatNumber.localString(ReservedWithdrawal),
            reservedWithdrawal: ReservedWithdrawal,
            totalShow: formatNumber.localString(total),
            total,
          };
        });
    };
    if (res) {
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
