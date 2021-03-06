import { ChainX, computed, formatNumber, observable } from '../utils';
import ModelExtend from './ModelExtend';
import {
  depositClaim,
  getBondingDuration,
  getElectionMembersAPI,
  getIntentionBondingDuration,
  getIntentionImages,
  getIntentions,
  getIntentionsByAccount,
  getNominationRecords,
  getPseduIntentions,
  getPseduNominationRecords,
  nominate,
  refresh,
  register,
  renominate,
  unfreeze,
  unnominate,
  voteClaim,
  getNextRenominateByAccount,
} from '../services';

export default class Election extends ModelExtend {
  @observable name = 'election';
  @observable originIntentions = []; // intentions rpc返回数据
  @observable originNominationRecords = []; // 投票记录rpc返回数据
  @observable bondingDuration = 0; // 投票赎回锁定块数
  @observable intentionBondingDuration = 0; // 节点赎回自投票锁定块数
  @observable originPseduIntentions = [];
  @observable originPseduRecords = [];
  @observable nextRenominateHeight = null;
  @observable getPseduIntentionsLoading = false;
  @observable getPseduIntentionsFirstLoading = false;
  lastPath = '/election/allActiveValidator';

  @computed get normalizedPseduIntentions() {
    const nativeAssetPrecision = this.rootStore.globalStore.nativeAssetPrecision;
    const precisionMap = this.rootStore.globalStore.assetNamePrecisionMap;
    const orderPairs = this.rootStore.tradeStore.orderPairs;

    return this.originPseduIntentions.map((intention = {}) => {
      let discountResultShow = '';
      const token = intention.id;
      // 折合投票数
      const discountVote = (intention.power * intention.circulation) / Math.pow(10, precisionMap[token]);
      const price = formatNumber.toPrecision(intention.power, nativeAssetPrecision);

      if (token === 'BTC' || token === 'L-BTC') {
        const findAssetOne = orderPairs.find(one => one.currency === 'BTC') || {};
        const discount = intention.discount * Math.pow(10, -2);
        const secondDiscount =
          ((Math.pow(10, findAssetOne.precision) * Math.pow(10, this.getDefaultPrecision())) / findAssetOne.averPrice) *
          Math.pow(10, -this.getDefaultPrecision()) *
          discount;
        discountResultShow = formatNumber.toFixed(
          Number((price / secondDiscount) * discount),
          this.getPrecision(token)
        );
      } else if (token === 'SDOT') {
        discountResultShow = formatNumber.toFixed(Number(price), this.getPrecision('PCX'));
      }

      const result = {
        ...intention,
        discountVote: formatNumber.toPrecision(discountVote, nativeAssetPrecision),
        circulation: this.setPrecision(intention.circulation, token),
        price,
        jackpot: this.setPrecision(intention.jackpot, nativeAssetPrecision),
        discountResultShow,
      };

      const record = this.originPseduRecords.find(record => record.id === intention.id);
      if (!record) {
        Object.assign(result, {
          canClaim: false,
          interest: this.setPrecision(0, nativeAssetPrecision),
          balance: this.setPrecision(0, token),
        });
      } else {
        // 用户最新总票龄  = （链最新高度 - 用户总票龄更新高度）*用户投票金额 +用户总票龄
        const myWeight =
          (this.blockNumber - record.lastTotalDepositWeightUpdate) * record.balance +
          Number(record.lastTotalDepositWeight);
        // 节点最新总票龄  = （链最新高度 - 节点总票龄更新高度）*节点得票总额 +节点总票龄
        const nodeVoteWeight =
          (this.blockNumber - intention.lastTotalDepositWeightUpdate) * intention.circulation +
          Number(intention.lastTotalDepositWeight);
        // 待领利息 = 用户最新总票龄 / 节点最新总票龄 * 节点奖池金额

        // TODO: record.lastTotalDepositWeightUpdate <= 0的条件属于补救措施，后边应改掉
        const interest =
          nodeVoteWeight <= 0 || record.lastTotalDepositWeightUpdate <= 0
            ? 0
            : (myWeight / nodeVoteWeight) * intention.jackpot * 0.9;

        const canClaim = interest > 0 && this.reservedPCX > (interest * 100) / 9 && this.blockNumber > record.nextClaim;

        Object.assign(result, {
          originInterest: interest,
          interest: this.setPrecision(interest, nativeAssetPrecision),
          balance: this.setPrecision(record.balance, token),
          nextClaim: record.nextClaim,
          canClaim,
        });

        if (!canClaim) {
          Object.assign(result, {
            need: (interest * 100) / 9 - this.reservedPCX,
            nextClaimTimestamp: this.blockTimestamp + this.blockDuration * (record.nextClaim - this.blockNumber),
          });
        }
      }

      if (token === 'L-BTC' || token === 'SDOT') {
        // 根据提案11、12，禁掉L-BTC和S-DOT挖矿
        Object.assign(result, { canClaim: false });
      }

      return result;
    });
  }

  @computed get validatorsWithAddress() {
    return this.originIntentions.map(intention => {
      return Object.assign({}, intention, {
        address: ChainX.account.encodeAddress(intention.account),
        jackpotAddress: ChainX.account.encodeAddress(intention.jackpotAccount),
      });
    });
  }

  @computed get reservedPCX() {
    return this.rootStore.assetStore.nativeAccountAssets[0].reservedStaking;
  }

  @computed get blockNumber() {
    return this.rootStore.chainStore.blockNumber;
  }

  @computed get blockTimestamp() {
    if (this.rootStore.chainStore.blockTime) {
      return this.rootStore.chainStore.blockTime.getTime();
    }

    return 0;
  }

  @computed get blockDuration() {
    return this.rootStore.chainStore.blockDuration;
  }

  // 当前账户节点
  @computed get accountValidator() {
    const account = this.getCurrentAccount();
    return this.validatorsWithAddress.find(validator => validator.address === account.address);
  }

  @computed get validatorsWithRecords() {
    if (typeof this.blockNumber === 'undefined') {
      return [];
    }

    const calcRecordsForIntention = intention => {
      const myRecord = (this.originNominationRecords || []).find(record => record[0] === intention.account);
      if (!myRecord) {
        return {
          myTotalVote: 0,
          myRevocation: 0,
          myInterest: 0,
        };
      }

      const record = myRecord[1];
      const myTotalVote = record.nomination;
      const myRevocations = record.revocations.map(revocation => {
        return {
          revocationHeight: revocation.blockNumber,
          amount: revocation.value,
        };
      });
      const myRevocation = myRevocations.reduce((result, revocation) => {
        return result + revocation.amount;
      }, 0);

      // 用户最新总票龄  = （链最新高度 - 用户总票龄更新高度）*用户投票金额 +用户总票龄
      const myWeight = (this.blockNumber - record.lastVoteWeightUpdate) * myTotalVote + Number(record.lastVoteWeight);
      // 节点最新总票龄  = （链最新高度 - 节点总票龄更新高度）*节点得票总额 +节点总票龄
      const nodeVoteWeight =
        (this.blockNumber - intention.lastTotalVoteWeightUpdate) * intention.totalNomination +
        Number(intention.lastTotalVoteWeight);
      // 待领利息 = 用户最新总票龄 / 节点最新总票龄 * 节点奖池金额
      const myInterest = (myWeight / nodeVoteWeight) * intention.jackpot;

      return {
        myTotalVote,
        myRevocation,
        myInterest,
        myRevocations,
      };
    };

    return this.validatorsWithAddress.map(intention => {
      return Object.assign({}, intention, calcRecordsForIntention(intention));
    });
  }

  // 验证节点
  @computed get validators() {
    return [...this.validatorsWithRecords.filter(intention => intention.isValidator)];
  }

  // 以前叫候选节点，后改为同步节点
  @computed get backupValidators() {
    return [...this.validatorsWithRecords.filter(intention => !intention.isValidator)];
  }

  //参选节点
  @computed get allActiveValidator() {
    return [...this.validatorsWithRecords.filter(intention => intention.isActive)];
  }

  //退选节点
  @computed get allInactiveValidator() {
    return [...this.validatorsWithRecords.filter(intention => !intention.isActive)];
  }

  // 我的投票
  @computed get validatorsWithMyNomination() {
    return [
      ...this.validatorsWithRecords.filter(
        intention => intention.myTotalVote > 0 || intention.myRevocation > 0 || intention.myInterest > 0
      ),
    ];
  }

  @computed get myRevocationCount() {
    return (this.validatorsWithMyNomination || []).reduce(
      (result, validator) => result + (validator.myRevocations || []).length,
      0
    );
  }

  // 信托节点
  @computed get trustIntentions() {
    return [...this.validatorsWithRecords].filter(validator => validator.isTrustee && validator.isTrustee.length);
  }

  reload = () => {
    this.getIntentions();
    this.getPseduIntentions();
    this.getAccountAssets();
  };

  updateLastPath = path => {
    this.lastPath = path;
  };

  getPseduIntentions = async () => {
    const [intentions, records] = await Promise.all([getPseduIntentions(), this.getPseduNominationRecords()]);
    this.changeModel('originPseduIntentions', intentions);
    this.changeModel('originPseduRecords', records || []);
  };

  getPseduNominationRecords = async () => {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount.address) {
      return await getPseduNominationRecords(currentAccount.address);
    }
  };

  getIntentions = async () => {
    const [intentions, records] = await Promise.all([getIntentions(), this.getNominationRecords()]);
    this.changeModel(
      'originIntentions',
      intentions.map(item => {
        const findOne = this.originIntentions.find(one => one.account === item.account);
        if (findOne) {
          return {
            ...findOne,
            ...item,
          };
        }
        return item;
      })
    );
    this.changeModel('originNominationRecords', records);
  };

  getElectionMembers = async () => {
    let res = await getElectionMembersAPI();
    res = res.map(item => ({
      name: item,
    }));
    const intentions = this.originIntentions.map(item => {
      const findOne = res.find(one => one.name === item.name);
      if (findOne) {
        return {
          ...item,
          isOfficialMember: true,
        };
      }
      return item;
    });
    this.changeModel('originIntentions', intentions);
  };

  getIntentionImages = async () => {
    let res = await getIntentionImages().catch(() => []);
    res = res.map(item => {
      const key = Object.keys(item)[0];
      const value = Object.values(item)[0];
      return {
        name: key,
        imageUrl: value,
      };
    });

    const intentions = this.originIntentions.map(item => {
      // const findOne = res.find(one => one.name === item.name);
      const findOne = res.find(one => one.name.toUpperCase() === item.name.toUpperCase());
      if (findOne) {
        return {
          ...item,
          imageUrl: findOne.imageUrl,
        };
      }
      return item;
    });
    this.changeModel('originIntentions', intentions);
  };

  getNominationRecords = async () => {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount.address) {
      return await getNominationRecords(currentAccount.address);
    }
  };

  getIntentionsByAccount = async () => {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount.address) {
      const res = await getIntentionsByAccount(currentAccount.address);
      if (res) {
        return {
          sessionKeyAddress: this.encodeAddressAccountId(res.sessionKey),
          sessionKey: res.sessionKey,
          jackpotAddress: this.encodeAddressAccountId(res.jackpotAccount),
        };
      }
    }
  };

  nominate = ({ target, amount, remark }) => {
    amount = this.setDefaultPrecision(amount, true);
    const extrinsic = nominate(target, Number(amount), remark);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  /*解冻 */
  unfreeze = ({ target, revocationIndex }) => {
    const extrinsic = unfreeze(target, revocationIndex);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  unnominate = ({ target, amount, remark }) => {
    amount = this.setDefaultPrecision(amount, true);
    const extrinsic = unnominate(target, amount, remark);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  renominate = ({ target, to, amount, remark }) => {
    amount = this.setDefaultPrecision(amount, true);
    const extrinsic = renominate(target, to, amount, remark);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  register = ({ name }) => {
    const extrinsic = register(name);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  /*更新节点*/
  refresh = ({ url, participating, address, about }) => {
    const extrinsic = refresh(url || null, participating, address, about);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  /*提息*/
  voteClaim = ({ target }) => {
    const extrinsic = voteClaim(target);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  getNextRenominateByAccount = async () => {
    const currentAccount = this.getCurrentAccount();
    if (currentAccount.address) {
      const result = await getNextRenominateByAccount(currentAccount.address);
      this.changeModel('nextRenominateHeight', result);
    }
  };

  depositClaim = ({ token }) => {
    const extrinsic = depositClaim(token);
    return {
      extrinsic,
      success: () => this.reload(),
    };
  };

  getBondingDuration = async () => {
    const duration = await getBondingDuration();
    this.changeModel('bondingDuration', duration);
  };

  getIntentionBondingDuration = async () => {
    const duration = await getIntentionBondingDuration();
    this.changeModel('intentionBondingDuration', duration);
  };
}
