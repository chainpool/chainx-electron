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
  token: 'Token',
  memo: 'Memo',
  dest: 'TargetAccount',
  target: 'TargetAccount',
  value: 'Amount',
  tx: 'Tx',
  pair_index: 'TradingPairID',
  order_type: 'OrderType',
  order_index: 'OrderNumber',
  revocation_index: 'RevocationNumber',
  withdrawal_id_list: 'WithdrawNumber',
  direction: 'Direction',
  price: 'Price',
  desire_to_run: 'Participate',
  amount: 'Amount',
  next_key: 'BlockAuthoringAddress',
  about: 'BriefIntroduction',
  ext: 'Memo',
  chain: 'Chain',
  hot_entity: 'HotEntity',
  cold_entity: 'ColdEntity',
  ethereum_signature: 'ethereum_signature',
  sign_data: 'sign_data',
  input_data: 'TargetAccount',
  header: 'BlockHeader',
  from: 'SourceNode',
  to: 'TargetAccount',
  multi_sig_addr: 'PublicMultiSigTrusteeAddress',
  proposal: 'Sign',
  multi_sig_id: 'SigTrusteeID',
};

const values = {
  Sell: 'Sell',
  Buy: 'Buy',
  Limit: 'LimitOrder',
  false: 'False',
  true: 'True',
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
    return result.reduce((sum, next) => {
      return sum.concat({
        label: next.label,
        value: next.value !== undefined ? next.value : 'NoThing',
      });
    }, []);
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
      operation = 'GetSDOT';
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
        { name: 'url', nameTrans: () => 'Website' },
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
        { name: 'addr', nameTrans: () => 'ReceiptAddress' },
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
      info = merge(args, [{ name: 'name', nameTrans: 'NodeName' }]);
      break;
    }
    case 'XBridgeOfBTC|push_header': {
      info = merge(args, [{ name: 'header' }]);
      break;
    }
    case 'XMultiSig|execute': {
      operation = 'ExecuteMultiSign';
      info = merge(args, [{ name: 'multi_sig_addr' }, { name: 'proposal' }]);
      break;
    }
    case 'XMultiSig|confirm': {
      operation = 'ConfirmMultiSign';
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
