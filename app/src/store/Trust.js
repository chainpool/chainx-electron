import {
  _,
  ChainX,
  observable,
  formatNumber,
  localSave,
  autorun,
  fetchFromHttp,
  moment_helper,
  hexPrefix,
  toJS,
} from '../utils';
import ModelExtend from './ModelExtend';
import {
  getWithdrawalList,
  createWithdrawTx,
  getWithdrawTx,
  signWithdrawTx,
  getTrusteeInfoByAccount,
  setupBitcoinTrustee,
  getBlockTime,
  getTrusteeSessionInfo,
} from '../services';
import { computed } from 'mobx';
import { default as bitcoin } from 'bitcoinjs-lib';
import { default as BigNumber } from 'bignumber.js';
import { from, of, combineLatest as combine } from 'rxjs';
import { combineLatest, mergeMap, map, mergeAll, catchError, filter, tap } from 'rxjs/operators';
import { Base64 } from 'js-base64';
import { default as reverse } from 'buffer-reverse';

export default class Trust extends ModelExtend {
  constructor(props) {
    super(props);
    autorun(() => {
      localSave.set(
        'trusts',
        this._trusts.map(item => {
          return {
            ...item,
            connected: '',
            hotPubKey: '',
            coldPubKey: '',
            node: item.node,
            trusteeAddress: null,
          };
        })
      );
    });
  }

  @observable name = 'Trust';
  @observable onChainAllWithdrawList = []; // runtime中所有跨链提现记录

  @observable _trusts = localSave.get('trusts') || [];
  @observable tx = '';
  @observable signStatus = '';
  @observable redeemScript = '';
  @observable trusteeList = []; //已签名的节点列表
  @observable commentFee = '';
  @observable totalSignCount = '';
  @observable lastPredictTradeLength = '';

  @computed
  get maxSignCount() {
    return Math.ceil((this.totalSignCount * 2) / 3);
  }

  @computed
  get trusts() {
    const currentAccount = this.getCurrentAccount();
    return this._trusts.filter((item = {}) => item.address === currentAccount.address) || [];
  }

  set trusts(value) {
    this._trusts = value;
  }

  @computed get normalizedOnChainAllWithdrawList() {
    const assetNamePrecisionMap = this.rootStore.globalStore.assetNamePrecisionMap; // 获取资产 name => precision map数据结构
    if (Object.keys(assetNamePrecisionMap).length <= 0) {
      return [];
    }

    return this.onChainAllWithdrawList.map(withdraw => {
      let precision = assetNamePrecisionMap[withdraw.token];
      if (typeof precision === 'undefined') {
        // TODO: 这种情况出现表明有Error
        throw new Error('无法找到提现列表中资产定义');
      }

      let state = withdraw.status;
      const statusValue = _.get(withdraw.status, 'value') || '';

      switch (statusValue.toUpperCase()) {
        case 'NOTAPPLYING':
          state = '未申请';
          break;
        case 'APPLYING':
          state = '申请中';
          break;
        case 'SIGNING':
          state = '签名中';
          break;
        case 'BROADCASTING':
          state = '广播中';
          break;
        case 'PROCESSING':
          state = '处理中';
          break;
        case 'CONFIRMING':
          state = '确认中';
          break;
        case 'CONFIRMED':
          state = '已确认';
          break;
        case 'NORMALFINISH':
          state = '完成';
          break;
        case 'ROOTFINISH':
          state = '系统结束';
          break;
        case 'NORMALCANCEL':
          state = '取消';
          break;
        case 'ROOTCANCEL':
          state = '系统取消';
          break;
        default:
          state = '未知';
      }

      return {
        id: withdraw.id,
        accountId: withdraw.accountid,
        timeShow: withdraw.blockHeight ? withdraw.blockHeight : moment_helper.formatHMS(withdraw.time), // 申请时间
        address: ChainX.account.encodeAddress(withdraw.accountid), // 申请提现账户地址
        token: withdraw.token, // 币种
        addr: withdraw.address, // 原链地址，提现的目标地址
        balance_primary: withdraw.balance,
        balance: formatNumber.toPrecision(withdraw.balance, precision), // 数量
        memo: withdraw.memo, // 提现备注
        state, // 状态
        status: withdraw.status,
      };
    });
  }

  @computed get signTrusteeList() {
    const currentAccount = this.getCurrentAccount();
    return this.rootStore.electionStore.trustIntentions.map((item = {}) => {
      const newItem = {
        ...item,
        isSelf: `0x${this.decodeAddressAccountId(currentAccount)}` === item.account,
      };
      const findOne = this.trusteeList.filter((one = []) => {
        if (one[0]) {
          return `0x${this.decodeAddressAccountId(one[0])}` === item.account;
        }
      })[0];
      if (findOne) {
        return {
          ...newItem,
          trusteeSign: findOne[1],
        };
      }
      return newItem;
    });
  }

  @computed get signHash() {
    if (this.tx && this.signTrusteeList.filter((item = {}) => item.trusteeSign).length >= this.maxSignCount) {
      const tx = bitcoin.Transaction.fromHex(this.tx.replace(/^0x/, ''));
      const hash = tx.getHash();
      return reverse(hash).toString('hex');
    }
    return '';
  }

  reload = () => {
    this.getAllWithdrawalList();
    this.getWithdrawTx();
    this.rootStore.electionStore.getIntentions();
  };

  sign = async ({ withdrawList, tx, redeemScript, privateKey, bitFee = 0 }) => {
    const findOne = this.trusts.filter((item = {}) => item.chain === 'Bitcoin')[0];
    if (!findOne || (findOne && !findOne.node)) {
      throw new Error({
        info: '未设置节点',
        toString: () => 'NotSetNode',
      });
    }
    if (!findOne.connected) {
      throw new Error({
        info: '节点未连接',
        toString: () => 'NodeNotLink',
      });
    }
    const multisigAddress = await this.getBitcoinTrusteeAddress();
    if (!multisigAddress) {
      throw new Error({
        info: '未获取到信托地址',
        toString: () => 'NotFindTrusteeAddress',
      });
    }
    const nodeUrl = findOne.node;
    const minerFee = await this.rootStore.assetStore.getMinimalWithdrawalValueByToken({ token: 'BTC' });

    const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const getUnspents = async url => this.fetchNodeStatus(url).then((res = {}) => res.result);
    const filterUnspentsByAmount = (unspents = [], amount) => {
      const nonZeroUnspents = unspents.filter(utxo => new BigNumber(utxo.amount) > 0);
      const result = [];
      let sum = new BigNumber(0);
      for (let utxo of nonZeroUnspents) {
        result.push(utxo);
        const value = new BigNumber(10).exponentiatedBy(8).multipliedBy(utxo.amount);
        sum = sum.plus(value);
        if (sum.isGreaterThan(amount)) {
          break;
        }
      }
      return sum.isLessThan(amount) ? [] : result;
    };

    const caculateCommentFee = async (url, inputLength, withdrawalLength) => {
      const fee = await this.fetchNodeFeeRate(url);
      const res = await this.getTrusteeSessionInfo('Bitcoin');
      const { maxSignCount: n, totalSignCount: m } = res;
      const bytes = inputLength * (48 + 73 * n + 34 * m) + 34 * (withdrawalLength + 1) + 14;
      const result = formatNumber.toFixed(bytes * fee, 8);
      console.log(
        inputLength,
        withdrawalLength,
        fee,
        n,
        m,
        bytes,
        result,
        'inputLength,withdrawalLength,fee,n,m,bytes,result'
      );
      if (result) {
        this.changeModel('commentFee', result);
        this.changeModel('lastPredictTradeLength', bytes);
      }
    };

    const compose = async () => {
      let rawTransaction;
      const utxos = await getUnspents(nodeUrl);
      if (withdrawList) {
        if (!utxos.length) {
          throw new Error({
            info: '当前节点无任何utxo',
            toString: () => 'NodeHasNoUTXO',
          });
        }
        const totalWithdrawAmount = withdrawList.reduce((result, withdraw) => {
          return result + withdraw.amount;
        }, 0);
        if (totalWithdrawAmount <= 0) {
          throw new Error({
            info: '提现总额应大于0',
            toString: () => 'WithDrawTotalMustBiggerZero',
          });
        }
        const targetUtxos = filterUnspentsByAmount(utxos, totalWithdrawAmount);
        if (targetUtxos.length <= 0) {
          throw new Error('构造失败，账户余额不足');
        }

        const totalInputAmount = targetUtxos.reduce((result, utxo) => {
          return new BigNumber(10)
            .exponentiatedBy(8)
            .multipliedBy(utxo.amount)
            .plus(result)
            .toNumber();
        }, 0);
        const txb = new bitcoin.TransactionBuilder(network);
        txb.setVersion(1);
        targetUtxos.forEach(utxo => txb.addInput(utxo.txid, utxo.vout));
        let feeSum = 0;
        withdrawList.forEach(withdraw => {
          const fee = withdraw.amount - minerFee;
          txb.addOutput(withdraw.addr, fee);
          feeSum += fee;
        });
        // const change = totalInputAmount - totalWithdrawAmount - minerFee;
        const change = totalInputAmount - feeSum - bitFee;
        if (change < 0) {
          throw new Error({
            info: 'utxo总额不够支付手续费',
            toString: () => 'UTXONotEnoughFee',
          });
        }
        if (change > 1000) {
          txb.addOutput(multisigAddress, change);
        }

        rawTransaction = txb.buildIncomplete().toHex();
        caculateCommentFee(nodeUrl, targetUtxos.length, withdrawList.length);
      } else {
        redeemScript = Buffer.from(redeemScript, 'hex');
        const privateKeys = [privateKey];
        const transaction = bitcoin.Transaction.fromHex(tx);
        const txb = bitcoin.TransactionBuilder.fromTransaction(transaction, network);
        const keypairs = privateKeys.map(key => bitcoin.ECPair.fromWIF(key, network));
        try {
          for (let pair of keypairs) {
            transaction.ins.forEach((utxo, index) => {
              txb.sign(index, pair, redeemScript);
            });
          }
        } catch (err) {
          alert(err.message);
        }
        rawTransaction = txb.build().toHex();
      }
      return rawTransaction;
    };
    return compose();
  };

  createWithdrawTxAndSign = async ({ withdrawList = [], tx, redeemScript, privateKey }) => {
    const ids = withdrawList.map((item = {}) => item.id);
    let tx_trans = null;
    if (tx) {
      tx = tx.replace(/^0x/, '');
      redeemScript = redeemScript.replace(/^0x/, '');
      tx_trans = await this.sign({ tx, redeemScript, privateKey });
    }
    console.log(
      toJS(withdrawList),
      tx,
      redeemScript,
      privateKey,
      tx_trans,
      '---withdrawList,tx,redeemScript, privateKey,tx_trans'
    );
    const extrinsic = createWithdrawTx(ids, `0x${tx_trans}`);
    return {
      extrinsic,
      success: this.reload,
    };
  };

  createWithdrawTx = ({ withdrawList = [], tx }) => {
    const ids = withdrawList.map((item = {}) => item.id);
    const extrinsic = createWithdrawTx(ids, `0x${tx}`);
    return {
      extrinsic,
      success: this.reload,
    };
  };

  getWithdrawTx = async () => {
    const findOne = this.trusts.filter((item = {}) => item.chain === 'Bitcoin')[0] || {};
    if (findOne && findOne.chain) {
      const [resTx = {}, resRede = {}] = await Promise.all([
        getWithdrawTx(findOne.chain),
        this.getTrusteeSessionInfo(findOne.chain),
      ]);
      const { tx, signStatus, trusteeList = [] } = resTx || {};
      const { redeemScript, totalSignCount } = resRede || {};
      this.changeModel({
        tx,
        signStatus,
        redeemScript,
        trusteeList,
        totalSignCount,
      });
    } else {
      this.changeModel({
        tx: '',
        signStatus: '',
        redeemScript: '',
        trusteeList: [],
        totalSignCount: '',
      });
    }
  };

  getTrusteeSessionInfo = async chain => {
    if (this.redeemScript) {
      return {
        redeemScript: this.redeemScript,
        maxSignCount: this.maxSignCount,
        totalSignCount: this.totalSignCount,
      };
    } else {
      const res = await getTrusteeSessionInfo(chain);
      const { hotEntity: { redeemScript } = {}, trusteeList = [] } = res || {};
      return {
        redeemScript,
        totalSignCount: trusteeList.length,
      };
    }
  };

  signWithdrawTx = async ({ tx, redeemScript, privateKey }) => {
    let tx_trans = null;
    if (tx) {
      tx = tx.replace(/^0x/, '');
      redeemScript = redeemScript.replace(/^0x/, '');
      tx_trans = await this.sign({ tx, redeemScript, privateKey });
    }

    const extrinsic = signWithdrawTx(tx_trans ? `0x${tx_trans}` : null);
    return {
      extrinsic,
      success: this.reload,
    };
  };

  fetchNodeStatus = async (url, trusteeAddress) => {
    if (!trusteeAddress) {
      trusteeAddress = await this.getBitcoinTrusteeAddress();
    }
    let Authorization;
    if (/@/.test(url)) {
      const str = url
        .split('@')[0]
        .replace('[', '')
        .replace(']', '');
      Authorization = Base64.encode(str);
      url = url.split('@')[1];
    }
    return fetchFromHttp({
      url: `https://wallet.chainx.org/api/rpc?url=http://${url}`,
      methodAlias: 'listunspent',
      method: 'POST',
      timeOut: 3500,
      params: [0, 99999999, [trusteeAddress]],
      header: Authorization ? { Authorization: `Basic ${Authorization}` } : null,
    })
      .then(res => {
        if (res && !res.error) {
          return res;
        } else {
          return Promise.reject(res);
        }
      })
      .catch(err => Promise.reject(err));
  };

  fetchNodeFeeRate = async url => {
    if (/@/.test(url)) {
      url = url.split('@')[1];
    }
    const res = await fetchFromHttp({
      url: `https://wallet.chainx.org/api/rpc?url=http://${url}`,
      methodAlias: 'estimatesmartfee',
      method: 'POST',
      timeOut: 3500,
      params: [10],
    });
    if (res && res.result) {
      return res.result.feerate / 1024;
    }
  };

  subScribeNodeStatus = () => {
    const trusts = _.cloneDeep(this._trusts);
    const currentAccount = this.getCurrentAccount();
    const { address } = currentAccount;
    trusts.forEach(item => {
      if (item.node && item.address === address) {
        this.fetchNodeStatus(item.node)
          .then(res => {
            if (res) {
              item.connected = true;
              this.changeModel('trusts', trusts);
            } else {
              item.connected = false;
              this.changeModel('trusts', trusts);
            }
          })
          .catch(() => {
            item.connected = false;
            this.changeModel('trusts', trusts);
          });
      }
    });
  };

  updateTrust = (obj = {}) => {
    const trusts = _.cloneDeep(this._trusts);
    const currentAccount = this.getCurrentAccount();
    const currentNetWork = this.getCurrentNetWork();
    const { address } = currentAccount;
    const { chain, hotPubKey, coldPubKey, node, decodedHotPrivateKey } = obj;
    const findOne = trusts.filter(
      (item = {}) => item.address === address && item.chain === chain && item.net === currentNetWork.value
    )[0];
    if (!findOne) {
      trusts.push({
        address,
        chain,
        hotPubKey,
        coldPubKey,
        net: currentNetWork.value,
      });
    } else {
      if (hotPubKey) findOne.hotPubKey = hotPubKey;
      if (coldPubKey) findOne.coldPubKey = coldPubKey;
      if (node) findOne.node = node;
      if (decodedHotPrivateKey || decodedHotPrivateKey === '') findOne.decodedHotPrivateKey = decodedHotPrivateKey;
    }
    this.changeModel('trusts', trusts);
    this.subScribeNodeStatus();
  };

  updateTrustToChain = ({ about = 'bitocin', hotPubKey, coldPubKey }) => {
    const extrinsic = setupBitcoinTrustee(about, hexPrefix(hotPubKey), hexPrefix(coldPubKey));
    return {
      extrinsic,
      success: () => {
        this.getSomeOneInfo({ decodedHotPrivateKey: '' });
      },
    };
  };

  getSomeOneInfo = async (payload = {}) => {
    const chain = 'Bitcoin';
    const currentAccount = this.getCurrentAccount();
    const { address } = currentAccount;
    const turstInfo = await getTrusteeInfoByAccount(address);
    const findOne = turstInfo[chain];
    if (findOne) {
      const { coldEntity: coldPubKey, hotEntity: hotPubKey } = findOne;
      const obj = {
        address,
        chain,
        hotPubKey,
        coldPubKey,
        ...payload,
      };
      this.updateTrust(obj);
      return obj;
    }
  };

  getAllWithdrawalList = async () => {
    return from(getWithdrawalList('Bitcoin', 0, 100))
      .pipe(
        map(res => {
          return res.data;
        }),
        mergeMap((items = []) => {
          if (!items.length) return of(items);
          return combine(
            items.map(item => {
              return from(getBlockTime({ height: item.height })).pipe(
                map((res = {}) => {
                  return {
                    ...item,
                    time: res.time,
                  };
                }),
                catchError(() => {
                  return of({
                    ...item,
                    time: null,
                    blockHeight: item.height,
                  });
                })
              );
            })
          );
        })
      )
      .subscribe((res = []) => {
        this.changeModel('onChainAllWithdrawList', res);
      });
  };

  getBitcoinTrusteeAddress = async () => {
    return await this.rootStore.assetStore.getTrusteeAddress({ chain: 'Bitcoin' });
  };
}
