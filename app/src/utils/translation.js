import _ from 'lodash';

const calls = {
  unnominate: '撤销投票',
  sudo: '设置',
  set_block_producer: '设置出块人',
  push_header: '提交块头',
  final_hint: '设置',
  claim: '提息',
  set: '设置',
  setup_trustee: '信托设置',
  withdraw: '提现',
  nominate: '投票',
  create_withdraw_tx: '申请提现',
  sign_withdraw_tx: '响应提现',
  cancel_order: '撤单',
  register: '注册节点',
  put_order: '挂单',
  unfreeze: '解冻',
  push_transaction: '提交交易',
  transfer: '转账',
  refresh: '更新节点',
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
  input_data: 'input_data',
};

const values = {
  Sell: '卖出',
  Buy: '买入',
  Limit: '限价单',
  false: '否',
  true: '是',
};

const translation = ({ module, call, args = [], setPrecision, setDefaultPrecision, getPair, showUnitPrecision }) => {
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
        { name: 'value', dataTrans: (v, d) => setPrecision(v, d.token) },
        { name: 'memo' },
        { name: 'dest' },
      ]);
      break;
    }
    case 'XTokens|claim': {
      info = merge(args, [{ name: 'token' }]);
      break;
    }
    case 'XStaking|claim': {
      info = merge(args, [{ name: 'target' }]);
      break;
    }
    case 'XBridgeOfSDOT|claim': {
      info = merge(args, [{ name: 'ethereum_signature' }, { name: 'sign_data' }, { name: 'input_data' }]);
      break;
    }
    case 'XBridgeOfBTC|sign_withdraw_tx': {
      info = merge(args, [{ name: 'tx' }]);
      break;
    }
    case 'XStaking|nominate': {
      info = merge(args, [
        { name: 'value', dataTrans: v => setDefaultPrecision(v) },
        { name: 'memo' },
        { name: 'target' },
      ]);
      break;
    }
    case 'XStaking|unnominate': {
      info = merge(args, [
        { name: 'value', dataTrans: v => setDefaultPrecision(v) },
        { name: 'memo' },
        { name: 'target' },
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
            return showUnit(setPrecision(v, filterPair.precision));
          },
        },
        {
          name: 'amount',
          dataTrans: (v, r) => {
            const filterPair = getPair({ id: r.pair_index });
            return setPrecision(v, filterPair.assets);
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
      info = merge(args, [{ name: 'revocation_index' }, { name: 'target' }]);
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
  }

  return {
    operation,
    info,
  };
};

export default translation;
