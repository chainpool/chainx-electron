import {
  _,
  add0x,
  autorun,
  ChainX,
  convertAddressChecksumAll,
  formatNumber,
  getAllPubsFromRedeemScript,
  getMNFromRedeemScript,
  hexPrefix,
  localSave,
  moment_helper,
  observable,
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
  @observable trusteeList = []; //普通交易已签名的节点列表,被计算属性signTrusteeList使用得到完整细节 [['0x...', true|false]]
  @observable chainConfigTrusteeList = []; //链上配置的信托列表，账户跟公钥一一对应
  @observable totalSignCount = ''; // 普通交易总签名个数
  @observable maxSignCount = ''; // 普通交易最大签名个数
  @observable BitCoinFee = ''; // 普通交易需要的chianx链上比特币手续费，特殊交易不需要要用
  @observable txInputList = []; // 普通交易input
  @observable txOutputList = [];
  @observable withdrawalIdList = []; // 提现交易对应的id列表
  @observable txSpecialInputList = [];
  @observable txSpecialOutputList = [];
  @observable getAllWithdrawalListLoading = false;
  @observable getAllWithdrawalListFirstLoading = false;

  // 提现交易收取的手续费
  @computed get BitCoinFeeShow() {
    return this.setPrecision(this.BitCoinFee * this.withdrawalIdList.length, 8);
  }

  @computed
  get trusts() {
    const currentAccount = this.getCurrentAccount();
    const currentNetWork = this.getCurrentNetWork();

    console.log(`current: ${JSON.stringify(currentAccount)}  network: ${JSON.stringify(currentNetWork)}`);
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
    return this.onChainAllWithdrawList.map(withdraw => {
      let precision = 8; //assetNamePrecisionMap[withdraw.token];
      if (typeof precision === 'undefined') {
        // TODO: 这种情况出现表明有Error
        throw new Error('无法找到提现列表中资产定义');
      }

      let state = withdraw.state;
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
            state = state;
        }
      }

      return {
        id: withdraw.id,
        accountId: withdraw.applicant,
        timeShow: withdraw.height ? withdraw.height : moment_helper.formatHMS(withdraw.time), // 申请时间
        address: withdraw.applicant, //ChainX.account.encodeAddress(withdraw.accountid), // 申请提现账户地址
        token: 'BTC', // 币种
        addr: withdraw.addr, // 原链地址，提现的目标地址
        balance_primary: withdraw.balance,
        balance: formatNumber.toPrecision(withdraw.balance, 8), // 数量
        memo: withdraw.ext, // 提现备注
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
      const findOne = this.trusteeList.find((one = []) => {
        if (one[0]) {
          return `0x${this.decodeAddressAccountId(one[0])}` === item.account;
        }
      });
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

    function pickUtxosWithMinerFeeRate(unSpents, withdrawals, n, m, feeRate, chainxFee) {
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

    return pickUtxosWithMinerFeeRate(unSpents, withdrawals, n, m, feeRate, chainxFee);
  };

  getUnspents = (nodeUrl, address) =>
    this.fetchNodeStatus(nodeUrl, address)
      .then((res = {}) => {
        return (res.result || []).map(item => ({
          ...item,
          amount: new BigNumber(10)
            .exponentiatedBy(8)
            .multipliedBy(item.amount)
            .toNumber(),
        }));
      })
      .catch(() => Promise.reject('超时'));

  constructSpecialTx = async ({ withdrawList, feeRate = 1, fromAddress, redeemScript }) => {
    const nodeUrl = (this.trusts.find((item = {}) => item.chain === 'Bitcoin') || {}).apiNode;

    console.log(`nodeUrl: ${nodeUrl}`);
    if (!nodeUrl) {
      throw new Error({
        info: '未设置节点',
        toString: () => 'NotSetNode',
      });
    }

    const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    let rawTransaction;

    const totalWithdrawAmount = withdrawList.reduce((result, withdraw) => {
      return result + Number(withdraw.amount);
    }, 0);

    if (totalWithdrawAmount <= 0) {
      throw new Error({
        info: '提现总额应大于0',
        toString: () => 'WithDrawTotalMustBiggerZero',
      });
    }

    let utxos = await this.getUnspents(nodeUrl, fromAddress).catch(() => {
      throw new Error({
        info: '请求UTXO列表超时',
        toString: () => 'OverTime',
      });
    });

    if (!(utxos && utxos.length)) {
      throw new Error({
        info: '当前地址无任何utxo',
        toString: () => 'NodeHasNoUTXO',
      });
    }

    const { m, n } = getMNFromRedeemScript(redeemScript.replace(/^0x/, ''));
    const { targetInputs, minerFee } = this.pickNeedUtxos(utxos, withdrawList, m, n, Number(feeRate), 0);

    if (targetInputs.length <= 0) {
      throw new Error({
        info: '构造失败，账户余额不足',
        toString: () => 'ConstructionFailedBalanceInnsufficient',
      });
    }

    const totalInputAmount = targetInputs.reduce((result, utxo) => {
      return result + utxo.amount;
    }, 0);

    const txb = new bitcoin.TransactionBuilder(network);
    txb.setVersion(1);
    targetInputs.forEach(utxo => txb.addInput(utxo.txid, utxo.vout));
    withdrawList.forEach(item => txb.addOutput(item.addr, Number(item.amount)));
    const change = totalInputAmount - totalWithdrawAmount - minerFee;

    if (change < 0) {
      throw new Error({
        info: 'utxo总额不够支付提现',
        toString: () => 'UTXONotEnoughFee',
      });
    }

    if (change > 10000) {
      txb.addOutput(fromAddress, change);
    }

    rawTransaction = txb.buildIncomplete().toHex();
    return rawTransaction;
  };

  constructWithdrawTx = async ({ withdrawList, feeRate = 1 }) => {
    console.log('6666 代签111');
    const nodeUrl = (this.trusts.find((item = {}) => item.chain === 'Bitcoin') || {}).apiNode;
    console.log('node url:' + JSON.stringify(this.trusts));
    if (!nodeUrl) {
      throw new Error({
        info: '未设置节点',
        toString: () => 'NotSetNode',
      });
    }

    const network = this.isTestBitCoinNetWork() ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

    let multisigAddress = await this.getBitcoinTrusteeAddress();

    if (!multisigAddress) {
      throw new Error({
        info: '未获取到信托地址',
        toString: () => 'NotFindTrusteeAddress',
      });
    }

    if (!this.BitCoinFee) {
      throw new Error({
        info: '未获取到提现手续费',
        toString: () => 'NotFindTrusteeFee',
      });
    }

    console.log(`6666 代签8888`);
    const totalWithdrawAmount = withdrawList.reduce((result, withdraw) => {
      return result + Number(withdraw.amount);
    }, 0);

    if (totalWithdrawAmount <= 0) {
      throw new Error({
        info: '提现总额应大于0',
        toString: () => 'WithDrawTotalMustBiggerZero',
      });
    }

    console.log(`6666 99999 + UTXO`);

    let utxos = await this.getUnspents(nodeUrl, multisigAddress).catch(() => {
      throw new Error({
        info: '超时',
        toString: () => 'OverTime',
      });
    });

    if (!(utxos && utxos.length)) {
      throw new Error({
        info: '当前节点无任何utxo',
        toString: () => 'NodeHasNoUTXO',
      });
    }

    const { m, n } = getMNFromRedeemScript(this.redeemScript.replace(/^0x/, ''));
    const { targetInputs: targetUtxos, minerFee: calculateUserInputbitFee } = this.pickNeedUtxos(
      utxos,
      withdrawList,
      m,
      n,
      Number(feeRate),
      this.BitCoinFee
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
    targetUtxos.forEach(utxo => txb.addInput(utxo.txid, utxo.vout));
    let finalTotalWithdrawAmount = 0;
    withdrawList.forEach(withdraw => {
      const finalWithdrawalAmount = Number(withdraw.amount) - this.BitCoinFee;
      txb.addOutput(withdraw.addr, finalWithdrawalAmount);
      finalTotalWithdrawAmount += finalWithdrawalAmount;
    });
    const change = totalInputAmount - finalTotalWithdrawAmount - calculateUserInputbitFee;

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

    return txb.buildIncomplete().toHex();
  };

  createWithdrawTx = async ({ ids = [], tx }) => {
    const extrinsic = await createWithdrawTx(ids, `0x${tx}`);
    console.log('create success....' + 2444444444444444444444444444444);
    console.log(extrinsic);

    return {
      extrinsic,
      success: this.reload,
    };
  };

  getWithdrawTx = async () => {
    console.log('get withdraw tx......');
    console.log('get withdraw tx......');
    console.log('get withdraw tx......111');

    // const findOne = ForceTrustee ? { chain: 'Bitcoin' } : this.trusts.find((item = {}) => item.chain === 'Bitcoin');
    // debugger
    // if (!findOne || !findOne.chain) {
    //   this.changeModel({
    //     tx: '',
    //     redeemScript: '',
    //     trusteeList: [],
    //     totalSignCount: '',
    //     maxSignCount: '',
    //   });
    // }

    let withdrawTxInfo = await getWithdrawTx();
    console.log(JSON.stringify(withdrawTxInfo));

    console.log('get withdraw tx......2222');

    const { tx, trusteeList = [], withdrawalIdList = [] } = withdrawTxInfo || {};

    console.log('get withdraw tx......3333');
    const { redeemScript, totalSignCount, maxSignCount, chainConfigTrusteeList } = {};
    if (this.tx === tx && this.redeemScript === redeemScript && trusteeList.length === this.trusteeList.length) {
      return;
    }

    console.log('get withdraw tx......4444');

    this.changeModel({
      tx,
      redeemScript,
      trusteeList,
      totalSignCount,
      maxSignCount,
      chainConfigTrusteeList,
      withdrawalIdList,
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
      hotEntity,
      coldEntity,
    } = res || {};
    return {
      redeemScript,
      totalSignCount: total,
      maxSignCount: required,
      chainConfigTrusteeList,
      hotEntity,
      coldEntity,
    };
  };

  signWithHardware = async ({ desc, isSpecialModel, redeemScript, signCallback }) => {
    const network = this.isTestBitCoinNetWork() ? 'testnet' : 'mainnet';
    let res;
    if (desc === 'Ledger') {
      if (isSpecialModel) {
        console.log(this.txSpecial, this.txSpecialInputList, redeemScript, network, '--------特殊签名输入所有参数');
        res = await window.LedgerInterface.sign(
          this.txSpecial.replace(/^0x/, ''),
          this.txSpecialInputList,
          redeemScript ? redeemScript.replace(/^0x/, '') : null,
          network
        ).catch(err => Promise.reject(err));
      } else {
        console.log(this.tx, this.txInputList, this.redeemScript, network, '--------签名输入所有参数');
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
        methodAlias: 'listunspent',
        method: 'POST',
        timeOut: Authorization ? 6500 : 3500,
        params: [0, 9999999, [trusteeAddress]],
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
    const res = await from(getWithdrawalList('Bitcoin', 0, 100)).toPromise();
    this.changeModel('onChainAllWithdrawList', res);
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
