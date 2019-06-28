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
  convertAddressChecksumAll,
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
  getUnspent,
  getTxsFromTxidList,
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
  @observable txSpecial = '';
  @observable signStatus = '';
  @observable redeemScript = '';
  @observable redeemScriptSpecial = '';
  @observable trusteeList = []; //已签名的节点列表,被计算属性signTrusteeList使用得到完整细节
  @observable chainConfigTrusteeList = []; //链上配置的信托列表，账户跟公钥一一对应
  @observable commentFee = ''; // 推荐手续费
  @observable totalSignCount = '';
  @observable maxSignCount = '';
  @observable lastPredictTradeLength = '';
  @observable BitCoinFee = '';
  @observable txInputList = [];
  @observable txOutputList = [];
  @observable txSpecialInputList = [];
  @observable txSpecialOutputList = [];

  @computed get BitCoinFeeShow() {
    return this.setPrecision(this.BitCoinFee * this.normalizedOnChainAllWithdrawList.length, 8);
  }

  @computed
  get trusts() {
    const currentAccount = this.getCurrentAccount();
    const currentNetWork = this.getCurrentNetWork();
    return (
      this._trusts.filter(
        (item = {}) => item.address === currentAccount.address && item.net === currentNetWork.value
      ) || []
    );
  }

  set trusts(value) {
    this._trusts = value;
  }

  @computed get allColdOrHotPubKey() {
    const [coldEntity, hotEntity] = [[], []];
    this.chainConfigTrusteeList.forEach(item => {
      if (_.get(item, 'props.coldEntity')) {
        coldEntity.push(_.get(item, 'props.coldEntity'));
      }
      if (_.get(item, 'props.hotEntity')) {
        hotEntity.push(_.get(item, 'props.hotEntity'));
      }
    });
    return { coldEntity, hotEntity };
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
          state = 'NotApplying';
          break;
        case 'APPLYING':
          state = 'Applying';
          break;
        case 'SIGNING':
          state = 'Singing';
          break;
        case 'BROADCASTING':
          state = 'BroadCasting';
          break;
        case 'PROCESSING':
          state = 'Processing';
          break;
        case 'CONFIRMING':
          state = 'Confirming';
          break;
        case 'CONFIRMED':
          state = 'Confirmed';
          break;
        case 'NORMALFINISH':
          state = 'NormalFinish';
          break;
        case 'ROOTFINISH':
          state = 'RootFinish';
          break;
        case 'NORMALCANCEL':
          state = 'NormalCancel';
          break;
        case 'ROOTCANCEL':
          state = 'RootCancel';
          break;
        default:
          state = 'Unknown';
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
        txid: withdraw.txid, //交易hash
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

  @computed get txSpecialSignTrusteeList() {
    if (!this.txSpecial) return [];
    const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const transactionRaw = bitcoin.Transaction.fromHex(this.txSpecial.replace(/^0x/, ''));
    const txb = bitcoin.TransactionBuilder.fromTransaction(transactionRaw, network);
    const inputs = txb.__inputs[0];
    if (!inputs.signatures) return [];
    const signList = inputs.signatures.map((item, index) => {
      const pubKey = inputs.pubkeys[index].toString('hex');
      const filterOne =
        this.chainConfigTrusteeList.filter(one => one.props.hotEntity.replace(/^0x/, '') === pubKey)[0] ||
        this.chainConfigTrusteeList.filter(one => one.props.coldEntity.replace(/^0x/, '') === pubKey)[0] ||
        {};
      return {
        trusteeSign: _.isUndefined(item) ? item : !!item,
        pubKey,
        accountId: filterOne.accountId,
      };
    });
    const currentAccount = this.getCurrentAccount();
    const mergeSignList = signList.map(item => {
      const isColdOrHotEntity = this.isColdOrHotEntity(`0x${item.pubKey}`);
      if (item.accountId) {
        const findOne = this.rootStore.electionStore.trustIntentions.filter(
          one => `0x${this.decodeAddressAccountId(item.accountId)}` === one.account
        )[0];

        if (findOne) {
          return {
            ...findOne,
            ...item,
            isColdEntity: isColdOrHotEntity.isColdEntity,
            isHotEntity: isColdOrHotEntity.isHotEntity,
            isSelf: `0x${this.decodeAddressAccountId(currentAccount)}` === findOne.account,
          };
        }
      } else {
        return {
          ...item,
          isColdEntity: isColdOrHotEntity.isColdEntity,
          isHotEntity: isColdOrHotEntity.isHotEntity,
          name: `${item.pubKey.slice(0, 5)}...${item.pubKey.slice(-5)}`,
        };
      }
    });
    return mergeSignList;
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
    this.getSomeOneInfo();
  };

  updateAllTrust = () => {
    const trusts = [...this._trusts];
    this.changeModel('trusts', convertAddressChecksumAll(trusts));
  };

  sign = async ({ withdrawList, tx, redeemScript, privateKey, userInputbitFee = 0, url }) => {
    const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const compose = async () => {
      let rawTransaction;
      if (withdrawList) {
        const findOne = this.trusts.filter((item = {}) => item.chain === 'Bitcoin')[0];
        let multisigAddress = await this.getBitcoinTrusteeAddress();
        if (url) {
          //特殊交易
          multisigAddress = url;
        } else {
          multisigAddress = await this.getBitcoinTrusteeAddress();
        }
        if (!multisigAddress) {
          throw new Error({
            info: '未获取到信托地址',
            toString: () => 'NotFindTrusteeAddress',
          });
        }

        const nodeUrl = findOne.node;
        const BitCoinFee = this.BitCoinFee;
        if (!url && !BitCoinFee) {
          throw new Error({
            info: '未获取到提现手续费',
            toString: () => 'NotFindTrusteeFee',
          });
        }

        const getUnspents = address =>
          getUnspent({ address, isTest: this.isTestBitCoinNetWork() }).then((res = {}) => {
            return res.result;
          });

        const filterUnspentsByAmount = (unspents = [], amount) => {
          const nonZeroUnspents = unspents.filter(utxo => new BigNumber(utxo.amount) > 0);
          nonZeroUnspents.sort((a, b) => Number(b.amount) - Number(a.amount));

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

        const caculateCommentFeeFromSatoshiKB = async (satoshiKB, inputLength, withdrawalLength) => {
          const fee = satoshiKB;
          const res = await this.getTrusteeSessionInfo('Bitcoin');
          const { maxSignCount: n, totalSignCount: m } = res;
          const bytes = inputLength * (48 + 73 * n + 34 * m) + 34 * (withdrawalLength + 1) + 14;
          return formatNumber.toFixed((bytes / 1024) * fee, 8);
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

        const utxos = await getUnspents(multisigAddress);
        if (!(utxos && utxos.length)) {
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
          throw new Error({
            info: '构造失败，账户余额不足',
            toString: () => 'ConstructionFailedBalanceInnsufficient',
          });
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
          const fee = url ? Number(withdraw.amount) : withdraw.amount - BitCoinFee;
          txb.addOutput(withdraw.addr, fee);
          feeSum += fee;
        });
        //const fee = await caculateCommentFeeFromSatoshiKB(0.00001, targetUtxos.length, withdrawList.length);
        // const change = totalInputAmount - totalWithdrawAmount - minerFee;
        const change = totalInputAmount - feeSum - userInputbitFee;

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
        //caculateCommentFee(nodeUrl, targetUtxos.length, withdrawList.length);
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
      const { redeemScript, totalSignCount, maxSignCount, chainConfigTrusteeList } = resRede || {};
      this.changeModel({
        tx,
        signStatus,
        redeemScript,
        trusteeList,
        totalSignCount,
        maxSignCount,
        chainConfigTrusteeList,
      });
      this.getInputsAndOutputsFromTx({
        tx,
        isSpecialMode: false,
      });
    } else {
      this.changeModel({
        tx: '',
        signStatus: '',
        redeemScript: '',
        trusteeList: [],
        totalSignCount: '',
        maxSignCount: '',
      });
    }
  };

  getInputsAndOutputsFromTx = async ({ tx, isSpecialModel }) => {
    const txInputList = isSpecialModel ? 'txSpecialInputList' : 'txInputList';
    const txOutputList = isSpecialModel ? 'txSpecialOutputList' : 'txOutputList';
    if (!tx) return;
    if (isSpecialModel) {
      this.changeModel('txSpecial', tx);
    }
    const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const transactionRaw = bitcoin.Transaction.fromHex(tx.replace(/^0x/, ''));
    const txbRAW = bitcoin.TransactionBuilder.fromTransaction(transactionRaw, network);
    const resultOutputs = txbRAW.__tx.outs.map((item = {}) => {
      const address = bitcoin.address.fromOutputScript(item.script, network);
      return {
        address,
        value: this.setPrecision(item.value, 8),
        satoshi: item.value,
      };
    });
    this.changeModel(txOutputList, resultOutputs);
    const ins = txbRAW.__tx.ins.map(item => {
      return {
        ...item,
        hash: item.hash.reverse().toString('hex'),
      };
    });
    // this.changeModel(txInputList, ins.map(item => ({ hash: item.hash })));
    const ids = ins.map(item => item.hash);
    const result = await getTxsFromTxidList({ ids, isTest: this.isTestBitCoinNetWork() });
    if (result && result.length) {
      const insTXs = result.map(item => {
        const transaction = bitcoin.Transaction.fromHex(item.raw);
        const txb = bitcoin.TransactionBuilder.fromTransaction(transaction, network);
        const filterOne = ins.filter((one = {}) => one.hash === item.txid)[0];
        const findOne = txb.__tx.outs[filterOne.index];
        const address = bitcoin.address.fromOutputScript(findOne.script, network);
        return {
          index: filterOne.index,
          raw: item.raw,
          address,
          hash: item.txid,
          value: this.setPrecision(findOne.value, 8),
          satoshi: findOne.value,
        };
      });
      this.changeModel(txInputList, insTXs);
    }
  };

  getTrusteeSessionInfo = async chain => {
    const res = await getTrusteeSessionInfo(chain);
    const {
      hotEntity: { redeemScript } = {},
      trusteeList: chainConfigTrusteeList = [],
      counts: { total, required },
    } = res || {};
    return {
      redeemScript,
      totalSignCount: total,
      maxSignCount: required,
      chainConfigTrusteeList,
    };
  };

  signWithHardware = async ({ desc, isSpecialModel, redeemScript, signCallback }) => {
    const network = this.isTestBitCoinNetWork() ? 'testnet' : 'mainnet';
    let res;
    if (desc === 'Ledger') {
      if (isSpecialModel) {
        //console.log(this.txSpecial, this.txSpecialInputList, redeemScript, network, '--------特殊签名输入所有参数');
        res = await window.LedgerInterface.sign(
          this.txSpecial.replace(/^0x/, ''),
          this.txSpecialInputList,
          redeemScript ? redeemScript.replace(/^0x/, '') : null,
          network
        ).catch(err => Promise.reject(err));
      } else {
        //console.log(this.tx, this.txInputList, this.redeemScript, network, '--------签名输入所有参数');
        res = await window.LedgerInterface.sign(
          this.tx.replace(/^0x/, ''),
          this.txInputList,
          this.redeemScript.replace(/^0x/, ''),
          network
        ).catch(err => Promise.reject(err));
      }
    } else if (desc === 'Trezor') {
      if (isSpecialModel) {
        res = await signCallback(
          this.txSpecial.replace(/^0x/, ''),
          this.txSpecialInputList,
          redeemScript ? redeemScript.replace(/^0x/, '') : null,
          network
        ).catch(err => Promise.reject(err));
      } else {
        res = await signCallback(
          this.tx.replace(/^0x/, ''),
          this.txInputList,
          this.redeemScript.replace(/^0x/, ''),
          network
        ).catch(err => Promise.reject(err));
      }
    }

    return res;
  };

  signWithdrawTx = async ({ tx, redeemScript, privateKey }) => {
    let tx_trans = null;
    if (tx) {
      tx = tx.replace(/^0x/, '');
      //redeemScript = redeemScript.replace(/^0x/, '');
      tx_trans = tx; //await this.sign({ tx, redeemScript, privateKey })
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
      // url: `/getTrustNodeStatus?url=http://${url}`,
      url: `https://wallet.chainx.org/api/rpc?url=http://${url}`,
      methodAlias: 'listunspent',
      method: 'POST',
      timeOut: Authorization ? 6500 : 3500,
      params: [0, 9999, [trusteeAddress]],
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
    let Authorization;
    if (/@/.test(url)) {
      const str = url
        .split('@')[0]
        .replace('[', '')
        .replace(']', '');
      Authorization = Base64.encode(str);
      url = url.split('@')[1];
    }
    const res = await fetchFromHttp({
      url: `https://wallet.chainx.org/api/rpc?url=http://${url}`,
      methodAlias: 'estimatesmartfee',
      method: 'POST',
      timeOut: 3500,
      params: [10],
      header: Authorization ? { Authorization: `Basic ${Authorization}` } : null,
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
    const { chain, hotPubKey, coldPubKey, node, decodedHotPrivateKey, hotPubKeyColdPubKey } = obj;
    const findOne = trusts.filter(
      (item = {}) => item.address === address && item.chain === chain && item.net === currentNetWork.value
    )[0];
    if (!findOne) {
      trusts.push({
        address,
        chain,
        hotPubKey,
        coldPubKey,
        hotPubKeyColdPubKey,
        net: currentNetWork.value,
      });
    } else {
      if (hotPubKey) findOne.hotPubKey = hotPubKey;
      if (coldPubKey) findOne.coldPubKey = coldPubKey;
      if (node) findOne.node = node;
      if (hotPubKeyColdPubKey) {
        if (findOne.decodedHotPrivateKey && hotPubKeyColdPubKey !== findOne.hotPubKeyColdPubKey) {
          findOne.decodedHotPrivateKey = '';
        }
        findOne.hotPubKeyColdPubKey = hotPubKeyColdPubKey;
      }
      if (decodedHotPrivateKey || decodedHotPrivateKey === '') findOne.decodedHotPrivateKey = decodedHotPrivateKey;
    }
    this.changeModel('trusts', trusts);
    this.subScribeNodeStatus();
  };

  updateTrustToChain = ({ about = '', hotPubKey, coldPubKey }) => {
    const extrinsic = setupBitcoinTrustee(about, hexPrefix(hotPubKey), hexPrefix(coldPubKey));
    return {
      extrinsic,
      success: this.reload,
    };
  };

  getSomeOneInfo = async () => {
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
        hotPubKeyColdPubKey: `${hotPubKey}${coldPubKey}`,
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

  getMinimalWithdrawalValueByToken = async () => {
    const res = await this.rootStore.assetStore.getMinimalWithdrawalValueByToken({ token: 'BTC' });
    if (res && res.fee) {
      this.changeModel('BitCoinFee', res.fee);
    }
  };

  isColdOrHotEntity = pubkey => {
    const allColds = this.allColdOrHotPubKey.coldEntity;
    const allHots = this.allColdOrHotPubKey.hotEntity;
    return {
      isColdEntity: allColds.includes(pubkey),
      isHotEntity: allHots.includes(pubkey),
    };
  };

  updateTxSpecial = ({ txSpecial }) => {
    this.changeModel('txSpecial', txSpecial);
  };

  updateRedeemScriptSpecial = ({ redeemScriptSpecial }) => {
    this.changeModel('redeemScriptSpecial', redeemScriptSpecial);
  };
}
