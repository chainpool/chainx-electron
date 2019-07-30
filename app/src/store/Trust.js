import {
  _,
  autorun,
  ChainX,
  convertAddressChecksumAll,
  fetchFromHttp,
  formatNumber,
  getAllPubsFromRedeemScript,
  getMNFromRedeemScript,
  hexPrefix,
  localSave,
  moment_helper,
  observable,
  toJS,
  add0x,
} from '../utils';
import memoize from 'memoizee';
import { ForceTrustee } from '../constants';
import ModelExtend from './ModelExtend';
import { Toast } from '../components';
import {
  createWithdrawTx,
  getBlockTime,
  getTrusteeInfoByAccount,
  getTrusteeSessionInfo,
  getWithdrawalList,
  getWithdrawTx,
  setupBitcoinTrustee,
  signWithdrawTx,
} from '../services';
import { computed } from 'mobx';
import bitcoin from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';
import { combineLatest as combine, from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Base64 } from 'js-base64';
import reverse from 'buffer-reverse';

const fromTransaction = memoize(bitcoin.TransactionBuilder.fromTransaction, {
  normalizer: function(args) {
    return JSON.stringify(args[0]) + JSON.stringify(args[1]);
  },
});

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
            apiNode: item.apiNode,
            node: item.node, //已经弃用
            trusteeAddress: null,
          };
        })
      );
    });
  }

  @observable name = 'Trust';
  @observable onChainAllWithdrawList = []; // runtime中所有跨链提现记录

  @observable _trusts = localSave.get('trusts') || [];
  @observable tx = ''; //普通交易原文
  @observable txSpecial = '';
  @observable redeemScript = ''; //普通交易赎回脚本
  @observable redeemScriptSpecial = ''; //特殊交易赎回脚本
  @observable trusteeList = []; //普通交易已签名的节点列表,被计算属性signTrusteeList使用得到完整细节
  @observable chainConfigTrusteeList = []; //链上配置的信托列表，账户跟公钥一一对应
  @observable totalSignCount = ''; // 普通交易总签名个数
  @observable maxSignCount = ''; // 普通交易最大签名个数
  @observable BitCoinFee = ''; // 普通交易需要的chianx链上比特币手续费，特殊交易不需要要用
  @observable txInputList = []; // 普通交易input
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
    const trusts =
      this._trusts.filter(
        (item = {}) => item.address === currentAccount.address && item.net === currentNetWork.value
      ) || [];
    return trusts;
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

      const applicationStatus = withdraw.applicationStatus;

      if (applicationStatus && applicationStatus.toUpperCase() !== 'PROCESSING') {
        state = applicationStatus;
      } else {
        switch (statusValue.toUpperCase()) {
          case 'NOTAPPLYING':
            state = applicationStatus ? applicationStatus : statusValue;
            break;
          case 'APPLYING':
            state = applicationStatus ? applicationStatus : statusValue;
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
            state = applicationStatus ? applicationStatus : statusValue;
            break;
          case 'ROOTFINISH':
            state = applicationStatus ? applicationStatus : statusValue;
            break;
          case 'NORMALCANCEL':
            state = applicationStatus ? applicationStatus : statusValue;
            break;
          case 'ROOTCANCEL':
            state = applicationStatus ? applicationStatus : statusValue;
            break;
          default:
            state = 'Unknown';
        }
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
    if (!this.tx) return [];
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
    let pubKeyInfos = [];
    const configs = this.chainConfigTrusteeList;
    const getAccountIdAndColdHotTypeFromPubKey = (pubKey, trusteeSign) => {
      const prefixPubKey = hexPrefix(pubKey);
      let isColdEntity = false;
      let isHotEntity = false;
      let accountId = '';
      for (let i = 0; i < configs.length; i++) {
        const item = configs[i];
        const {
          props: { coldEntity, hotEntity },
        } = item;
        if (coldEntity === prefixPubKey) {
          accountId = item.accountId;
          isColdEntity = true;
          break;
        } else if (hotEntity === prefixPubKey) {
          accountId = item.accountId;
          isHotEntity = true;
          break;
        }
      }
      return {
        accountId,
        pubKey,
        isColdEntity,
        isHotEntity,
        trusteeSign,
      };
    };

    if (this.redeemScriptSpecial) {
      const pubKeys = getAllPubsFromRedeemScript(this.redeemScriptSpecial);
      pubKeyInfos = pubKeys.map(item => getAccountIdAndColdHotTypeFromPubKey(item));
    }

    if (this.txSpecial) {
      const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
      const transactionRaw = bitcoin.Transaction.fromHex(this.txSpecial.replace(/^0x/, ''));
      const txb = fromTransaction(transactionRaw, network);
      const inputs = txb.__inputs[0];
      if (_.get(inputs, 'signatures.length')) {
        pubKeyInfos = inputs.signatures.map((item, index) =>
          getAccountIdAndColdHotTypeFromPubKey(
            inputs.pubkeys[index].toString('hex'),
            _.isUndefined(item) ? item : !!item
          )
        );
      }
    }

    const currentAccount = this.getCurrentAccount();
    const mergeSignList = pubKeyInfos.map(item => {
      if (item.accountId) {
        const findOne = this.rootStore.electionStore.trustIntentions.filter(
          one => `0x${this.decodeAddressAccountId(item.accountId)}` === one.account
        )[0];

        if (findOne) {
          return {
            ...findOne,
            ...item,
            isSelf: `0x${this.decodeAddressAccountId(currentAccount)}` === findOne.account,
          };
        }
      } else {
        return {
          ...item,
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

  @computed get signHashSpecial() {
    if (
      this.txSpecial &&
      this.txSpecialSignTrusteeList.filter((item = {}) => item.trusteeSign).length >= this.maxSignCountSpecial
    ) {
      const tx = bitcoin.Transaction.fromHex(this.txSpecial.replace(/^0x/, ''));
      const hash = tx.getHash();
      return reverse(hash).toString('hex');
    }
    return '';
  }

  @computed get maxSignCountSpecial() {
    let redeemScriptSpecial = this.redeemScriptSpecial;
    if (redeemScriptSpecial) {
      return getMNFromRedeemScript(this.redeemScriptSpecial).m;
    } else if (this.txSpecial) {
      const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
      const transactionRaw = bitcoin.Transaction.fromHex(this.txSpecial.replace(/^0x/, ''));
      const txb = fromTransaction(transactionRaw, network);
      const inputs = txb.__inputs[0];
      if (inputs && inputs.redeemScript) {
        redeemScriptSpecial = inputs.redeemScript;
        return getMNFromRedeemScript(redeemScriptSpecial).m;
      }
    }
  }

  @computed get totalSignCountSpecial() {
    let redeemScriptSpecial = this.redeemScriptSpecial;
    if (redeemScriptSpecial) {
      return getMNFromRedeemScript(this.redeemScriptSpecial).n;
    } else if (this.txSpecial) {
      const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
      const transactionRaw = bitcoin.Transaction.fromHex(this.txSpecial.replace(/^0x/, ''));
      const txb = fromTransaction(transactionRaw, network);
      const inputs = txb.__inputs[0];
      if (inputs && inputs.redeemScript) {
        redeemScriptSpecial = inputs.redeemScript;
        return getMNFromRedeemScript(redeemScriptSpecial).n;
      }
    }
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

  pickNeedUtxos = (unSpents, withdrawals, n, m, feeRate, chainxFee) => {
    function getSize(inputLength, outputLength, n, m) {
      return inputLength * (48 + 73 * n + 34 * m) + 34 * (outputLength + 1) + 14;
    }

    function pickUtxos(utxos, outSum) {
      let result = [];
      let inSum = 0;
      for (let utxo of utxos) {
        result.push(utxo);
        inSum += utxo.amount;
        if (inSum >= outSum) {
          break;
        }
      }
      if (inSum < outSum) {
        throw new Error({
          info: 'utxo总额不够支付提现',
          toString: () => 'UTXONotEnoughFee',
        });
      }
      return result;
    }

    function prckUtxosWithMinerFeeRate(unSpents, withdrawals, n, m, feeRate, chainxFee) {
      unSpents.sort((a, b) => b.amount - a.amount);

      let outSum = withdrawals.reduce((result, withdraw) => result + withdraw.amount - chainxFee, 0);

      let targetInputs = pickUtxos(unSpents, outSum);
      let inputSum = targetInputs.reduce((sum, input) => sum + input.amount, 0);
      let size = getSize(targetInputs.length, withdrawals.length, n, m);
      let minerFee = parseInt(feeRate * size);

      while (inputSum < outSum + minerFee) {
        targetInputs = pickUtxos(unSpents, outSum + minerFee);
        inputSum = targetInputs.reduce((sum, input) => sum + input.amount, 0);
        size = getSize(targetInputs.length, withdrawals.length, n, m);
        minerFee = parseInt(feeRate * size);
      }

      return { targetInputs, minerFee };
    }

    return prckUtxosWithMinerFeeRate(unSpents, withdrawals, n, m, feeRate, chainxFee);
  };

  sign = async ({ withdrawList, userInputbitFee = 0, fromAddress, redeemScript }) => {
    const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const compose = async () => {
      let rawTransaction;
      const findOne = this.trusts.filter((item = {}) => item.chain === 'Bitcoin')[0];
      const nodeUrl = findOne.apiNode;
      let multisigAddress = await this.getBitcoinTrusteeAddress();
      let redeemScriptMatch;
      if (fromAddress) {
        //特殊交易
        multisigAddress = fromAddress;
        redeemScriptMatch = redeemScript;
      } else {
        redeemScriptMatch = this.redeemScript;
      }

      if (!nodeUrl) {
        throw new Error({
          info: '未设置节点',
          toString: () => 'NotSetNode',
        });
      }

      if (!multisigAddress) {
        throw new Error({
          info: '未获取到信托地址',
          toString: () => 'NotFindTrusteeAddress',
        });
      }

      const BitCoinFee = this.BitCoinFee;
      if (!fromAddress && !BitCoinFee) {
        throw new Error({
          info: '未获取到提现手续费',
          toString: () => 'NotFindTrusteeFee',
        });
      }

      const getUnspents = address =>
        this.fetchNodeStatus(nodeUrl, address)
          .then((res = {}) => {
            return res.result;
          })
          .catch(() => Promise.reject('超时'));

      const totalWithdrawAmount = withdrawList.reduce((result, withdraw) => {
        return result + Number(withdraw.amount);
      }, 0);

      if (totalWithdrawAmount <= 0) {
        throw new Error({
          info: '提现总额应大于0',
          toString: () => 'WithDrawTotalMustBiggerZero',
        });
      }

      let utxos = await getUnspents(multisigAddress).catch(() => {
        throw new Error({
          info: '超时',
          toString: () => 'OverTime',
        });
      });

      utxos = utxos.map(item => ({
        ...item,
        amount: new BigNumber(10)
          .exponentiatedBy(8)
          .multipliedBy(item.amount)
          .toNumber(),
      }));

      if (!(utxos && utxos.length)) {
        throw new Error({
          info: '当前节点无任何utxo',
          toString: () => 'NodeHasNoUTXO',
        });
      }

      const { m, n } = getMNFromRedeemScript(redeemScriptMatch.replace(/^0x/, ''));
      const { targetInputs: targetUtxos, minerFee: calculateUserInputbitFee } = this.pickNeedUtxos(
        utxos,
        withdrawList,
        m,
        n,
        Number(userInputbitFee),
        BitCoinFee
      );

      if (targetUtxos.length <= 0) {
        throw new Error({
          info: '构造失败，账户余额不足',
          toString: () => 'ConstructionFailedBalanceInnsufficient',
        });
      }

      const totalInputAmount = targetUtxos.reduce((result, utxo) => {
        return result + utxo.amount;
      }, 0);

      const txb = new bitcoin.TransactionBuilder(network);
      txb.setVersion(1);
      targetUtxos.forEach(utxo => txb.addInput(utxo.txid, utxo.vout, 0));
      let feeSum = 0;
      withdrawList.forEach(withdraw => {
        const fee = fromAddress ? Number(withdraw.amount) : withdraw.amount - BitCoinFee;
        txb.addOutput(withdraw.addr, fee);
        feeSum += fee;
      });
      //const fee = await caculateCommentFeeFromSatoshiKB(0.00001, targetUtxos.length, withdrawList.length);
      // const change = totalInputAmount - totalWithdrawAmount - minerFee;
      const change = totalInputAmount - feeSum - calculateUserInputbitFee;

      if (change < 0) {
        throw new Error({
          info: 'utxo总额不够支付提现',
          toString: () => 'UTXONotEnoughFee',
        });
      }

      if (change > 10000) {
        txb.addOutput(multisigAddress, change);
      }
      txb.setLockTime(0);

      rawTransaction = txb.buildIncomplete().toHex();
      //caculateCommentFee(nodeUrl, targetUtxos.length, withdrawList.length);
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
    const findOne = ForceTrustee ? { chain: 'Bitcoin' } : this.trusts.find((item = {}) => item.chain === 'Bitcoin');

    if (!findOne || !findOne.chain) {
      this.changeModel({
        tx: '',
        redeemScript: '',
        trusteeList: [],
        totalSignCount: '',
        maxSignCount: '',
      });
    }

    const [resTx = {}, resRede = {}] = await Promise.all([
      getWithdrawTx(findOne.chain),
      this.getTrusteeSessionInfo(findOne.chain),
    ]);
    const { tx, trusteeList = [] } = resTx || {};
    const { redeemScript, totalSignCount, maxSignCount, chainConfigTrusteeList } = resRede || {};
    if (this.tx === tx && this.redeemScript === redeemScript) {
      return;
    }

    this.changeModel({
      tx,
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
  };

  getInputsAndOutputsFromTx = async ({ tx, isSpecialModel }) => {
    const getAddressFromScript = (script, network) => {
      try {
        return bitcoin.address.fromOutputScript(script, network);
      } catch {
        return '';
      }
    };
    const txInputList = isSpecialModel ? 'txSpecialInputList' : 'txInputList';
    const txOutputList = isSpecialModel ? 'txSpecialOutputList' : 'txOutputList';
    if (!tx) return;
    if (isSpecialModel) {
      this.changeModel('txSpecial', tx);
    }
    const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const transactionRaw = bitcoin.Transaction.fromHex(tx.replace(/^0x/, ''));
    const txbRAW = fromTransaction(transactionRaw, network);
    const resultOutputs = txbRAW.__tx.outs.map((item = {}) => {
      const address = getAddressFromScript(item.script, network);
      return {
        address,
        value: this.setPrecision(item.value, 8),
        satoshi: item.value,
        ...(address ? {} : { err: true }),
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
    const findOne = this.trusts.filter((item = {}) => item.chain === 'Bitcoin')[0];
    if (!findOne) return Toast.warn('请设置全节点');
    const nodeUrl = findOne.apiNode;

    const result = await this.fetchNodeTxsFromTxidList(nodeUrl, ids);
    // const result = await getTxsFromTxidList({ ids, isTest: this.isTestBitCoinNetWork() });
    if (result && result.length) {
      const insTXs = ins.map(item => {
        const findOne = result.find(one => one.txid === item.hash);
        const transaction = bitcoin.Transaction.fromHex(findOne.raw);
        const txb = fromTransaction(transaction, network);
        const findOutputOne = txb.__tx.outs[item.index];
        const address = getAddressFromScript(findOutputOne.script, network);
        return {
          index: item.index,
          raw: findOne.raw,
          address,
          hash: findOne.txid,
          value: this.setPrecision(findOutputOne.value, 8),
          satoshi: findOutputOne.value,
          ...(address ? {} : { err: true }),
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

  signWithdrawTx = async ({ tx }) => {
    const extrinsic = signWithdrawTx(tx ? add0x(tx) : null);
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
    return window
      .fetchFromNodeHttp({
        url: `https://${url}`,
        // url: `https://wallet.chainx.org/api/rpc?url=http://${url}`,
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

  fetchNodeTxsFromTxidList = async (url, ids) => {
    let Authorization;
    if (/@/.test(url)) {
      const str = url
        .split('@')[0]
        .replace('[', '')
        .replace(']', '');
      Authorization = Base64.encode(str);
      url = url.split('@')[1];
    }
    const fetchAction = id =>
      window.fetchFromNodeHttp({
        url: `https://${url}`,
        // url: `https://wallet.chainx.org/api/rpc?url=http://${url}`,
        methodAlias: 'getrawtransaction',
        method: 'POST',
        timeOut: 3500,
        params: [id],
        header: Authorization ? { Authorization: `Basic ${Authorization}` } : null,
      });
    const actions = ids.map(item => fetchAction(item));
    const res = await Promise.all(actions);
    if (res && res.length) {
      return res.map((item, index) => ({
        txid: ids[index],
        raw: item.result,
      }));
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

  subScribeApiNodeStatus = async ({ url }) => {
    let Authorization;
    if (/@/.test(url)) {
      const str = url
        .split('@')[0]
        .replace('[', '')
        .replace(']', '');
      Authorization = Base64.encode(str);
      url = url.split('@')[1];
    }
    const res = await window
      .fetchFromNodeHttp({
        url: `https://${url}`,
        // url: `https://wallet.chainx.org/api/rpc?url=http://${url}`,
        methodAlias: 'getblockchaininfo',
        method: 'POST',
        timeOut: 3500,
        params: [],
        header: Authorization ? { Authorization: `Basic ${Authorization}` } : null,
      })
      .catch(err => Promise.reject(err));
    if (res && res.result) {
      return res.result;
    }
  };

  updateTrust = (obj = {}) => {
    const trusts = _.cloneDeep(this._trusts);
    const currentAccount = this.getCurrentAccount();
    const currentNetWork = this.getCurrentNetWork();
    const { address } = currentAccount;
    const { chain, hotPubKey, coldPubKey, node, apiNode, decodedHotPrivateKey, hotPubKeyColdPubKey } = obj;
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
      if (node) findOne.apiNode = node;
      if (apiNode) findOne.apiNode = apiNode;
      if (hotPubKeyColdPubKey) {
        if (findOne.decodedHotPrivateKey && hotPubKeyColdPubKey !== findOne.hotPubKeyColdPubKey) {
          findOne.decodedHotPrivateKey = '';
        }
        findOne.hotPubKeyColdPubKey = hotPubKeyColdPubKey;
      }
      if (decodedHotPrivateKey || decodedHotPrivateKey === '') findOne.decodedHotPrivateKey = decodedHotPrivateKey;
    }
    this.changeModel('trusts', trusts);
    //this.subScribeNodeStatus();
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

  updateTxSpecial = ({ txSpecial }) => {
    this.changeModel('txSpecial', txSpecial);
  };

  updateRedeemScriptSpecial = ({ redeemScriptSpecial }) => {
    this.changeModel('redeemScriptSpecial', redeemScriptSpecial);
  };
}
