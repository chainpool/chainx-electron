import { lodash_helper, moment_helper } from './helper';
import { default as queryString } from 'query-string';
import { observer as observerable, inject } from 'mobx-react';
import device from 'current-device';
import { ErrMsg } from '../constants';
import { default as Chainx } from 'chainx.js';

//------------------通用部分
export { request } from './request';
export const _ = lodash_helper;
export const moment = moment_helper;
export { localSave, moment_helper } from './helper';
export { default as classNames } from 'classnames';

// ----------------------------项目适用
export { toJS, observable, action, runInAction } from 'mobx';

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

export const ChainX = new Chainx('ws://192.168.1.252:9944');

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
  precision: (inputValue, precision, errMsg = '小数位数') => {
    if (inputValue && !_.isNaN(precision)) {
      inputValue = parseFloat(inputValue);
      const length = _.get(String(inputValue).split('.')[1] || 0, 'length');
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
};
