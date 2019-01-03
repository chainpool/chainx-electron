import { lodash_helper, moment_helper } from './helper';
import { observer, inject } from 'mobx-react';
import Account from '@chainx/account';
import Keystore from '@chainx/keystore';

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
    return inject(func)(observer(c));
  };
};

export const setColumnsWidth = (table = [], widths = []) => {
  return table.map((item, index) => ({
    ...item,
    width: widths[index],
  }));
};

export const ChainX = {
  Account,
  Keystore,
};

export const Patterns = {
  decode: (encoded, password, errMsg = '密码错误') => {
    try {
      ChainX.Keystore.decrypt(encoded, password);
      return '';
    } catch (e) {
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
