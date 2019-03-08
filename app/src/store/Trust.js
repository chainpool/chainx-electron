import { _, ChainX, moment, observable, formatNumber, localSave, autorun, fetchFromHttp, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import { getWithdrawalList, createWithdrawTx, getWithdrawTx, signWithdrawTx } from '../services';
import { computed } from 'mobx';
import { default as bitcoin } from 'bitcoinjs-lib';
import { default as BigNumber } from 'bignumber.js';

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
          };
        })
      );
    });
  }

  @observable name = 'Trust';
  @observable onChainAllWithdrawList = []; // runtime中所有跨链提现记录

  @observable _trusts = localSave.get('trusts') || [];

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

      let state = '';
      switch (withdraw.status) {
        case 'applying':
          state = '申请中';
          break;
        case 'signing':
          state = '签名中';
          break;
        case 'unknown':
        default:
          state = '未知错误';
      }

      return {
        id: withdraw.id,
        date: moment.formatHMS(withdraw.time * 1000), // 申请时间
        address: ChainX.account.encodeAddress(withdraw.accountid), // 申请提现账户地址
        token: withdraw.token, // 币种
        addr: withdraw.address, // 原链地址，提现的目标地址
        balance_primary: withdraw.balance,
        balance: formatNumber.toPrecision(withdraw.balance, precision), // 数量
        memo: withdraw.memo, // 提现备注
        state, // 状态
      };
    });
  }

  sign = ({ withdrawList, tx, redeemScript }) => {
    const findOne = this.trusts.filter((item = {}) => item.chain === 'Bitcoin')[0] || {};
    if (!findOne) {
      throw new Error('未设置节点');
    }
    if (!findOne.connected) {
      throw new Error('节点未连接');
    }
    if (!findOne.trusteeAddress && findOne.trusteeAddress[0]) {
      throw new Error('当前节点未设置信托地址');
    }
    const multisigAddress = findOne.trusteeAddress[0];
    const nodeUrl = findOne.node;
    const minerFee = 40000;
    const network = bitcoin.networks.testnet;
    const privateKeys = [
      'cSXAH3eqx7T6RwtgrUhvxpWBoBkNJgnCx5nQVnCPyCRhAEkX2iqL',
      // 'cNM1Q55yj6PWbgvEbUkMG9pW8ZoXhgcyKJv5Lz2eacpudJmjp1hG',
      // 'cSXAH3eqx7T6RwtgrUhvxpWBoBkNJgnCx5nQVnCPyCRhAEkX2iqL',
    ];
    const getUnspents = async (url, multisigAddress) =>
      this.fetchNodeStatus(url, multisigAddress).then((res = {}) => res.result);
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

    const compose = async () => {
      let rawTransaction;
      let utxos = await getUnspents(nodeUrl, [multisigAddress]);
      if (withdrawList) {
        const totalWithdrawAmount = withdrawList.reduce((result, withdraw) => {
          return result + withdraw.amount;
        }, 0);
        if (totalWithdrawAmount <= 0) {
          throw new Error('提现总额应大于0');
        }
        const targetUtxos = filterUnspentsByAmount(utxos, totalWithdrawAmount);
        console.log(targetUtxos, '----');
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
        utxos.forEach(utxo => txb.addInput(utxo.txid, utxo.vout));
        // TODO: 真实的chainx跨链提现需扣除提现手续费
        withdrawList.forEach(withdraw => txb.addOutput(withdraw.addr, withdraw.amount - minerFee));
        // const change = totalInputAmount - totalWithdrawAmount - minerFee;
        const change = totalInputAmount - totalWithdrawAmount - 10000;
        txb.addOutput(multisigAddress, change);
        rawTransaction = txb.buildIncomplete().toHex();
      } else {
        redeemScript = Buffer.from(redeemScript, 'hex');
        const transaction = bitcoin.Transaction.fromHex(tx);
        const txb = bitcoin.TransactionBuilder.fromTransaction(transaction, network);
        const keypairs = privateKeys.map(key => bitcoin.ECPair.fromWIF(key, network));
        for (let pair of keypairs) {
          utxos.forEach((utxo, index) => {
            txb.sign(index, pair, redeemScript);
          });
        }
        rawTransaction = txb.build().toHex();
      }
      return rawTransaction;
    };
    return compose();
  };

  createWithdrawTx = ({ withdrawList = [], tx }) => {
    const ids = withdrawList.map((item = {}) => item.id);
    console.log(ids, '---ids, tx');
    const extrinsic = createWithdrawTx(ids, `0x${tx}`);
    return {
      extrinsic,
    };
  };

  getWithdrawTx = async () => {
    const findOne = this.trusts.filter((item = {}) => item.chain === 'Bitcoin')[0] || {};
    if (findOne && findOne.chain) {
      const tx = await getWithdrawTx(findOne.chain);
      return tx;
    }
  };

  signWithdrawTx = async ({ voteState, tx, redeemScript }) => {
    const tx_trans = await this.sign({ tx, redeemScript });
    console.log(tx_trans, '====================tx_trans');
    const extrinsic = signWithdrawTx(`0x${tx_trans}`, voteState);
    return {
      extrinsic,
    };
  };

  fetchNodeStatus = (url = '/getTrustNodeStatus', trusteeAddress = ['2N1CPZyyoKj1wFz2Fy4gEHpSCVxx44GtyoY']) => {
    return fetchFromHttp({
      httpUrl: url,
      methodAlias: 'listunspent',
      method: 'POST',
      params: [6, 99999999, trusteeAddress],
    }).then(res => res);
  };

  subScribeNodeStatus = () => {
    const trusts = _.cloneDeep(this._trusts);
    const currentAccount = this.getCurrentAccount();
    const { address } = currentAccount;
    trusts.map(item => {
      if (item.node && item.trusteeAddress && item.address === address) {
        this.fetchNodeStatus(item.node, item.trusteeAddress)
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
    const { address } = currentAccount;
    const { chain, hotPubKey, coldPubKey, node, trusteeAddress, decodedHotPrivateKey } = obj;
    const findOne = trusts.filter((item = {}) => item.address === address && item.chain === chain)[0];
    if (!findOne) {
      trusts.push({
        address,
        chain,
        hotPubKey,
        coldPubKey,
      });
    } else {
      if (hotPubKey) findOne.hotPubKey = hotPubKey;
      if (coldPubKey) findOne.coldPubKey = coldPubKey;
      if (node) findOne.node = node;
      if (trusteeAddress) findOne.trusteeAddress = trusteeAddress;
      if (decodedHotPrivateKey) findOne.decodedHotPrivateKey = decodedHotPrivateKey;
    }
    this.changeModel('trusts', trusts);
    this.subScribeNodeStatus();
  };

  getAllWithdrawalList = async () => {
    const withdrawListResp = await getWithdrawalList('Bitcoin', 0, 100);
    this.changeModel('onChainAllWithdrawList', withdrawListResp.data);
  };
}
