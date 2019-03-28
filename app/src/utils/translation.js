import _ from 'lodash';
const translation = ({ module, call, args = [], setPrecision }) => {
  const getDefault = name => {
    switch (name) {
      case 'token':
        return '币种';
      case 'memo':
        return '备注';
      case 'dest':
        return '目标账户';
      case 'value':
        return '金额';
    }
  };
  const merge = (args = [], selfArgs = []) => {
    return selfArgs.reduce((result, next, index) => {
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
          label = filterOne.name;
        }
        if (_.isFunction(next.dataTrans)) {
          value = next.dataTrans(filterOne.data, primaryArgsObj);
        } else if (next.dataTrans) {
          value = next.dataTrans;
        } else {
          value = filterOne.data;
        }

        return `${result}${label}:${value}${index === selfArgs.length - 1 ? '' : ';'}`;
      }
      return result;
    }, '');
  };
  let [operation, info] = ['', ''];

  switch (`${module}|${call}`) {
    case 'XAssets|transfer': {
      operation = '转账';
      info = merge(args, [
        { name: 'token', nameTrans: v => getDefault(v) },
        { name: 'value', nameTrans: v => getDefault(v), dataTrans: (v, d) => setPrecision(v, d.token) },
        { name: 'memo', nameTrans: v => getDefault(v) },
      ]);
      break;
    }
    case 'XTokens|claim': {
      operation = '提息';
      info = merge(args, [{ name: 'token', nameTrans: v => getDefault(v) }]);
      break;
    }
    case 'XBridgeOfBTC|sign_withdraw_tx': {
      operation = '签名';
      info = merge(args, [{ name: 'tx', nameTrans: v => '信托签名' }]);
    }
  }

  return {
    operation,
    info,
  };
};

export default translation;
