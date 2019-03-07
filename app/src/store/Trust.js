import { _, ChainX, moment, observable, formatNumber, localSave, autorun, fetchFromHttp } from '../utils';
import ModelExtend from './ModelExtend';
import { getWithdrawalList } from '../services';
import { computed } from 'mobx';
import { default as bitcoin } from 'bitcoinjs-lib';
import { default as BigNumber } from 'bignumber.js';

async function getUnspents(address) {
  let id = 0;
  const bitcoinNodeUrl = '/getTrustNodeStatus';
  const body = {
    jsonrpc: '1.0',
    id: id++,
    method: 'listunspent',
    params: [6, 99999999, [address]],
  };

  const res = await fetch(bitcoinNodeUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const unspents = await res.json();
  return unspents.result;
}
function filterUnspentsByAmount(unspents, amount) {
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
}

const multisigAddress = '2N6mJFLkjN9muneSeHCsMCxWXVZ4ruLKfFo';
const minerFee = 1;
const privateKeys = ['cUSb9aWh7UVwpYPZnj1EX35ng5b8ZQ5GT6MdH66jmiUdtJ5drw33'];
const redeemScript = Buffer.from(
  '53210227e54b65612152485a812b8856e92f41f64788858466cc4d8df674939a5538c3210306117a360e5dbe10e1938a047949c25a86c0b0e08a0a7c1e611b97de6b2917dd210311252930af8ba766b9c7a6580d8dc4bbf9b0befd17a8ef7fabac275bba77ae402103f72c448a0e59f48d4adef86cba7b278214cece8e56ef32ba1d179e0a8129bdba54ae',
  'hex'
);

async function compose({ withdrawList, network }) {
  const totalWithdrawAmount = withdrawList.reduce((result, withdraw) => {
    return result + withdraw.amount;
  }, 0);
  if (totalWithdrawAmount <= 0) {
    throw new Error('提现总额应大于0');
  }

  const utxos = await getUnspents(multisigAddress);

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
  utxos.forEach(utxo => txb.addInput(utxo.txid, utxo.vout));

  // TODO: 真实的chainx跨链提现需扣除提现手续费
  withdrawList.forEach(withdraw => txb.addOutput(withdraw.address, withdraw.amount));

  const change = totalInputAmount - totalWithdrawAmount - minerFee;

  txb.addOutput(multisigAddress, change);

  const keypairs = privateKeys.map(key => bitcoin.ECPair.fromWIF(key, network));

  for (let pair of keypairs) {
    utxos.forEach((utxo, index) => {
      txb.sign(index, pair, redeemScript);
    });
  }

  // const rawTransaction = txb.build().toHex();

  const rawTransaction = txb.buildIncomplete().toHex();

  console.log(rawTransaction, '---------');
  return false;

  // console.log(rawTransaction);
}
// compose({
//   withdrawList: [{ address: '2N6mJFLkjN9muneSeHCsMCxWXVZ4ruLKfFo', amount: 1 }],
//   network: bitcoin.networks.testnet,
// });

export default class Trust extends ModelExtend {
  constructor(props) {
    super(props);
    autorun(() => {
      localSave.set(
        'trusts',
        this.trusts.map(item => {
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
        date: moment.formatHMS(withdraw.time * 1000), // 申请时间
        address: ChainX.account.encodeAddress(withdraw.accountid), // 申请提现账户地址
        token: withdraw.token, // 币种
        addr: withdraw.address, // 原链地址，提现的目标地址
        balance: formatNumber.toPrecision(withdraw.balance, precision), // 数量
        memo: withdraw.memo, // 提现备注
        state, // 状态
      };
    });
  }

  buildMultiSign = async unspents => {};

  fetchNodeStatus = (url = '/getTrustNodeStatus', trusteeAddress = ['2N1CPZyyoKj1wFz2Fy4gEHpSCVxx44GtyoY']) => {
    return fetchFromHttp({
      httpUrl: url,
      methodAlias: 'listunspent',
      method: 'POST',
      params: [6, 99999999, trusteeAddress],
    }).then(res => res);
  };

  subScribeNodeStatus = () => {
    const trusts = _.cloneDeep(this.trusts);
    trusts.map(item => {
      if (item.node && item.trusteeAddress) {
        this.fetchNodeStatus(item.node, item.trusteeAddress).then(res => {
          console.log(res, '--------------信托res');
          if (res) {
            item.connected = true;
            this.changeModel('trusts', trusts);
          } else {
            item.connected = false;
            this.changeModel('trusts', trusts);
          }
        });
      }
    });
  };

  updateTrust = (obj = {}) => {
    const trusts = _.cloneDeep(this.trusts);
    const currentAccount = this.getCurrentAccount();
    const { address } = currentAccount;
    const { chain, hotPubKey, coldPubKey, node, trusteeAddress, decodedHotKey } = obj;
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
      if (decodedHotKey) findOne.decodedHotKey = decodedHotKey;
    }
    this.changeModel('trusts', trusts);
    this.subScribeNodeStatus();
    console.log(trusts);
  };

  getAllWithdrawalList = async () => {
    const withdrawListResp = await getWithdrawalList('Bitcoin', 0, 100);
    this.changeModel('onChainAllWithdrawList', withdrawListResp.data);
  };
}
