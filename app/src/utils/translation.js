import _ from 'lodash';
import { setBlankSpace } from '../utils';

const calls = {
  unnominate: 'DecreaseNomination',
  sudo: 'Setup',
  set_block_producer: 'SetBlockProducer',
  push_header: 'PushHeader',
  final_hint: 'Setup',
  claim: 'ClaimDividend',
  set: 'Setup',
  setup_trustee: 'TrusteeSettings',
  withdraw: 'Withdraw',
  nominate: 'Nominate',
  renominate: 'SwitchNominate',
  create_withdraw_tx: 'ApplicationWithdrawal',
  sign_withdraw_tx: 'ResponseWithDraw',
  cancel_order: 'CancelOrder',
  register: 'RegisterNode',
  put_order: 'PlaceOrder',
  unfreeze: 'Unfreeze',
  push_transaction: 'SubmittingTransactions',
  transfer: 'Transfer',
  refresh: 'UpdateNode',
  remove_multi_sig_for: 'RemoveMultiSign',
  setup_bitcoin_trustee: 'SetupTrustee',
};

const argvs = {
  token: '币种',
  memo: '备注',
  dest: '目标账户',
  target: '目标账户',
  value: '数量',
  tx: '原文',
  pair_index: '交易对id',
  order_type: '订单类型',
  order_index: '委托编号',
  revocation_index: '解冻编号',
  withdrawal_id_list: '提现编号',
  direction: '方向',
  price: '价格',
  desire_to_run: '参选',
  amount: '数量',
  next_key: '出块地址',
  about: '简介',
  ext: '备注',
  chain: '链',
  hot_entity: '热公钥',
  cold_entity: '冷公钥',
  ethereum_signature: 'ethereum_signature',
  sign_data: 'sign_data',
  input_data: '目标账户',
  header: '块头',
  from: '源节点',
  to: '目标节点',
  multi_sig_addr: '多签地址',
  proposal: '签名',
  multi_sig_id: '多签id',
};

const values = {
  Sell: '卖出',
  Buy: '买入',
  Limit: '限价单',
  false: '否',
  true: '是',
};

const translation = ({
  module,
  call,
  args = [],
  setPrecision,
  setDefaultPrecision,
  getPair,
  showUnitPrecision,
  originIntentions = [],
  nativeAssetName,
  encodeAddressAccountId,
  accounts = [],
}) => {
  const findNode = v => _.get(originIntentions.filter((item = {}) => item.account === `0x${v}`)[0], 'name') || v;
  const findAccount = v =>
    _.get(accounts.filter((item = {}) => item.address === encodeAddressAccountId(v))[0], 'tag') ||
    encodeAddressAccountId(v);
  const merge = (args = [], selfArgs = []) => {
    const result = selfArgs.reduce((result, next) => {
      const primaryArgsObj = args.reduce((result, next) => {
        return {
          ...result,
          [next.name]: next.data,
        };
      }, {});
      const filterOne = args.filter(item => item.name === next.name)[0];
      if (filterOne) {
        let label = '';
        let value = '';
        if (_.isFunction(next.nameTrans)) {
          label = next.nameTrans(filterOne.name, primaryArgsObj);
        } else if (next.nameTrans) {
          label = next.nameTrans;
        } else {
          label = argvs[filterOne.name];
        }
        if (_.isFunction(next.dataTrans)) {
          value = next.dataTrans(filterOne.data, primaryArgsObj);
        } else if (next.dataTrans) {
          value = next.dataTrans;
        } else {
          value = values[filterOne.data] || filterOne.data;
        }

        result.push({
          label,
          value,
        });
        return result;
      }
      return result;
    }, []);
    return result.reduce((sum, next, index) => {
      return `${sum}${next.label}:${next.value !== undefined ? next.value : ''}${
        index === result.length - 1 ? '' : ','
      }`;
    }, '');
  };
  let [operation, info] = ['', ''];
  operation = calls[call];

  switch (`${module}|${call}`) {
    case 'XAssets|transfer': {
      info = merge(args, [
        { name: 'token' },
        { name: 'value', dataTrans: (v, d) => setBlankSpace(setPrecision(v, d.token), d.token) },
        { name: 'memo' },
        { name: 'dest', dataTrans: v => findAccount(v) },
      ]);
      break;
    }
    case 'XTokens|claim': {
      info = merge(args, [{ name: 'token' }]);
      break;
    }
    case 'XStaking|claim': {
      info = merge(args, [{ name: 'target', dataTrans: v => findNode(v) }]);
      break;
    }
    case 'XBridgeOfSDOT|claim': {
      operation = '领SDOT';
      info = merge(args, [{ name: 'input_data', dataTrans: v => v }]);
      break;
    }
    case 'XBridgeOfBTC|sign_withdraw_tx': {
      info = merge(args, [{ name: 'tx' }]);
      break;
    }
    case 'XStaking|nominate': {
      info = merge(args, [
        { name: 'value', dataTrans: v => setBlankSpace(setDefaultPrecision(v), nativeAssetName) },
        { name: 'memo' },
        { name: 'target', dataTrans: v => findNode(v) },
      ]);
      break;
    }
    case 'XStaking|unnominate': {
      info = merge(args, [
        { name: 'value', dataTrans: v => setDefaultPrecision(v) },
        { name: 'memo' },
        { name: 'target', dataTrans: v => findNode(v) },
      ]);
      break;
    }
    case 'XStaking|renominate': {
      info = merge(args, [
        { name: 'from', dataTrans: v => findNode(v) },
        { name: 'to', dataTrans: v => findNode(v) },
        { name: 'value', dataTrans: v => setBlankSpace(setDefaultPrecision(v), nativeAssetName) },
        { name: 'memo' },
      ]);
      break;
    }
    case 'XSpot|put_order': {
      info = merge(args, [
        { name: 'pair_index' },
        { name: 'order_type' },
        { name: 'direction' },
        {
          name: 'price',
          dataTrans: (v, r) => {
            const filterPair = getPair({ id: r.pair_index });
            const showUnit = showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
            return setBlankSpace(showUnit(setPrecision(v, filterPair.precision)), filterPair.currency);
          },
        },
        {
          name: 'amount',
          dataTrans: (v, r) => {
            const filterPair = getPair({ id: r.pair_index });
            return setBlankSpace(setPrecision(v, filterPair.assets), filterPair.assets);
          },
        },
      ]);
      break;
    }
    case 'XSpot|cancel_order': {
      info = merge(args, [{ name: 'pair_index' }, { name: 'order_index' }]);
      break;
    }
    case 'XStaking|unfreeze': {
      info = merge(args, [{ name: 'revocation_index' }, { name: 'target', dataTrans: v => findNode(v) }]);
      break;
    }
    case 'XBridgeOfBTC|create_withdraw_tx': {
      info = merge(args, [{ name: 'withdrawal_id_list' }]);
      break;
    }
    case 'XStaking|refresh': {
      info = merge(args, [
        { name: 'url', nameTrans: () => '官网域名' },
        { name: 'desire_to_run' },
        { name: 'next_key' },
        { name: 'about' },
      ]);
      break;
    }
    case 'Withdrawal|withdraw': {
      info = merge(args, [
        { name: 'token' },
        { name: 'value', dataTrans: (v, r) => setPrecision(v, r.token) },
        { name: 'addr', nameTrans: () => '收款地址' },
        { name: 'ext' },
      ]);
      break;
    }
    case 'XStaking|setup_trustee': {
      info = merge(args, [
        { name: 'chain', dataTrans: (v, r) => _.get(r, 'hot_entity.option') },
        { name: 'hot_entity', dataTrans: v => _.get(v, 'value') },
        { name: 'cold_entity', dataTrans: v => _.get(v, 'value') },
        { name: 'about' },
      ]);
      break;
    }
    case 'XStaking|register': {
      info = merge(args, [{ name: 'name', nameTrans: '节点名称' }]);
      break;
    }
    case 'XBridgeOfBTC|push_header': {
      info = merge(args, [{ name: 'header' }]);
      break;
    }
    case 'XMultiSig|execute': {
      operation = '执行多签';
      info = merge(args, [{ name: 'multi_sig_addr' }, { name: 'proposal' }]);
      break;
    }
    case 'XMultiSig|confirm': {
      operation = '确认多签';
      info = merge(args, [{ name: 'multi_sig_addr' }]);
      break;
    }
    case 'XMultiSig|remove_multi_sig_for': {
      info = merge(args, [{ name: 'multi_sig_addr' }, { name: 'multi_sig_id' }]);
      break;
    }
    case 'XBridgeFeatures|setup_bitcoin_trustee': {
      info = merge(args, [{ name: 'hot_entity' }, { name: 'cold_entity' }]);
      break;
    }
  }

  return {
    operation,
    info,
  };
};

export default translation;
