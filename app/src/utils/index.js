import { lodash_helper, moment_helper } from './helper';
import { BigNumber } from 'bignumber.js';
import { default as queryString } from 'query-string';
import { observer as observerable, inject } from 'mobx-react';
import device from 'current-device';
import { ErrMsg } from '../constants';
import { default as Chainx } from 'chainx.js';

//------------------通用部分
export { request } from './request';
export const _ = lodash_helper;
export const moment = moment_helper;
export { localSave, moment_helper, Rx } from './helper';
export { default as classNames } from 'classnames';

// ----------------------------项目适用
export { toJS, observable, action, runInAction } from 'mobx';

export const resOk = result => {
  console.log(result);
  return result && result.result === 'ExtrinsicSuccess';
};

export const Inject = func => {
  return c => {
    return inject(func)(observerable(c));
  };
};

export const observer = observerable;

export const setColumnsWidth = (table = [], widths = []) => {
  return table.map((item, index) => ({
    ...item,
    width: widths[index],
  }));
};

export const ChainX = new Chainx(process.env.CHAINX_NODE_URL || 'ws://127.0.0.1:9944');

export const Patterns = {
  decode: (encoded, password, errMsg = '密码错误') => {
    try {
      ChainX.account.fromKeyStore(encoded, password);
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  isPrivateKey: (privateKey, errMsg = ErrMsg.privateKeyNotFormat) => {
    try {
      ChainX.account.fromPrivateKey(privateKey);
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  isMnemonicValid: (mnemonic, errMsg = ErrMsg.mnemonicNotFormat) => {
    try {
      ChainX.account.isMnemonicValid(mnemonic);
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  isVerifyAddress: (token, value, errMsg = '地址格式错误') => {
    try {
      ChainX.asset.getVerifyAddress(token, value, '');
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  required: (value, errMsg = '必填') => {
    return !value ? errMsg : '';
  },
  equal: (value1, value2, errMsg = '不相等') => {
    if (value1 && value2) {
      return value1 === value2 ? '' : errMsg;
    }
    return '';
  },
  strictEqual: (value1, value2, errMsg = '不相等') => {
    return value1 === value2 ? '' : errMsg;
  },
  smaller: (inputValue, baseValue, errMsg = '余额不足') => {
    if (inputValue && !_.isNaN(baseValue)) {
      return Number(inputValue) > Number(baseValue) ? errMsg : '';
    }
  },
  characterLength: (inputValue = '', minLength, maxLength) => {
    let result = '';
    result = inputValue.length > minLength ? '' : `最少${minLength}个字符`;
    result = inputValue.length > maxLength ? `最多${maxLength}个字符` : result;
    return result;
  },
  precision: (inputValue, precision, errMsg = '小数位数') => {
    if (inputValue && !_.isNaN(precision)) {
      inputValue = String(inputValue).replace(/(\.\d+?)0*$/, '$1'); //parseFloat(inputValue);
      const length = _.get(String(inputValue).split('.')[1] || 0, 'length');
      // console.log(inputValue, length, Number(precision), '+++++++++++++++++++++++++++++++++++');
      return length > Number(precision) ? `小数位数最大${precision}位` : '';
    }
  },

  check: value => {
    return (...params) => {
      if (!Patterns[value]) {
        return console.error('check对应的方法必须存在');
      }
      return Patterns[value](...params);
    };
  },
};

export const getDecimalLength = value => {
  if (value) {
    value = String(value).replace(/0*$/, '');
    return _.get(String(value).split('.')[1] || '', 'length');
  }
};

export const Device = (() => {
  const userAgentInfo = navigator.userAgent;
  return {
    isApp: () => {
      return device.desktop() && !!userAgentInfo.match(/electron/i);
    },
    isPC: () => {
      return device.desktop() && !userAgentInfo.match(/electron/i);
    },
    getOS: () => {
      const platform = navigator.platform;
      const isWin = platform === 'Win32' || platform === 'Windows';
      const isMac =
        platform === 'Mac68K' || platform === 'MacPPC' || platform === 'Macintosh' || platform === 'MacIntel';
      const isUnix = platform === 'X11' && !isWin && !isMac;
      const isLinux = platform.indexOf('Linux') > -1;
      if (isWin) return 'Win';
      if (isMac) return 'Mac';
      if (isUnix) return 'Unix';
      if (isLinux) return 'Linux';
      return 'other';
    },
  };
})();

export const parseQueryString = payload => {
  return queryString.parse(payload);
};

export const RegEx = {
  number: /^[0-9]*$/,
  decimalNumber: /^[0-9]+([.|。]{1}[0-9]*){0,1}$/,
  website: /^[0-9a-zA-Z\.]*$/,
  setDecimalNumber: precision => new RegExp('^[0-9]+([.|。]{1}[0-9]{0,' + precision + '}){0,1}$'),
};

export const isEmpty = value => {
  return _.isUndefined(value) || _.isNull(value) || _.isNaN(value) || value === '';
};
export const formatNumber = {
  localString: value => {
    if (isEmpty(value)) return '';
    return Number(value).toLocaleString();
  },
  toFixed: (value, precision) => {
    if (isEmpty(value)) return '';
    return new BigNumber(Number(value)).toFixed(Number(precision || 0));
  },
  toPrecision: (value, precision = 0, multiplication = false) => {
    precision = Number(precision);
    if (isEmpty(value) || isEmpty(precision) || isNaN(value)) return '';
    if (multiplication) return new BigNumber(value).multipliedBy(Math.pow(10, precision)).toFixed(0);
    return new BigNumber(value).dividedBy(Math.pow(10, precision)).toFixed(precision);
  },
  percent: (value, accuracy = 0) => (value * 100).toFixed(accuracy) + '%',
};
