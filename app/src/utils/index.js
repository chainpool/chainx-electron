import { localSave, lodash_helper, moment_helper } from './helper';
import { BigNumber } from 'bignumber.js';
import { default as queryString } from 'query-string';
import { observer as observerable, inject } from 'mobx-react';
import device from 'current-device';
import { ErrMsg, BitcoinTestNet, SCRYPT_PARAMS } from '../constants';
import { default as Chainx } from 'chainx.js';
import wif from 'wif';
import bip38 from 'bip38';
import { default as bitcoin } from 'bitcoinjs-lib';

//------------------通用部分
export { request } from './request';
export const _ = lodash_helper;
export const moment = moment_helper;
export { localSave, moment_helper, Rx } from './helper';
export { default as classNames } from 'classnames';

// ----------------------------项目适用
export { toJS, observable, computed, action, runInAction, autorun } from 'mobx';

const getBestNode = () => {
  const nodes = localSave.get('nodes') || [];
  const findOne = nodes.filter((item = {}) => item.best)[0] || {};
  return findOne.address || process.env.CHAINX_NODE_URL || 'ws://127.0.0.1:9944';
};

export const ChainX = new Chainx(getBestNode());

export const resOk = result => {
  console.log(result);
  return result && result.result === 'ExtrinsicSuccess';
};

export const resFail = result => {
  console.log(result);
  return result && result.result === 'ExtrinsicFailed';
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
      return /^0x[0-9a-fA-F]{64}$/.test(privateKey) || /^0x[0-9a-fA-F]{170}$/.test(privateKey) ? '' : errMsg;
    } catch (err) {
      return errMsg;
    }
  },
  isMnemonicValid: (mnemonic, errMsg = ErrMsg.mnemonicNotFormat) => {
    try {
      return ChainX.account.isMnemonicValid(mnemonic) ? '' : errMsg;
    } catch (err) {
      return errMsg;
    }
  },
  isChainXAddress: (address, errMsg = '地址格式错误') => {
    try {
      const result = ChainX.account.isAddressValid(address);
      if (!result) {
        return errMsg;
      }
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  isWsAddress: (address, errMsg = '地址格式错误') => {
    return /[ws|wss]:\/\/[\d|.]*/.test(address) ? '' : errMsg;
  },
  isHttpAddress: (address, errMsg = '地址格式错误') => {
    return /(http|https):\/\/([\w.]+\/?)\S*/.test(address) ? '' : errMsg;
  },
  isPublicKey: (pubkey, errMsg = '格式错误') => {
    try {
      Buffer.from(pubkey, 'hex');
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  isHotPrivateKey: (prikey, pubkey, callback, errMsg = '热私钥格式错误') => {
    try {
      const decoded = wif.decode(prikey);
      _.isFunction(callback) && callback(decoded);
      try {
        let ecPair = bitcoin.ECPair.fromWIF(
          prikey,
          BitcoinTestNet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
        ); // 导入私钥
        return ecPair.publicKey.toString('hex') === pubkey ? '' : '热私钥与热公钥不匹配';
      } catch (err) {
        return '热私钥与热公钥不匹配';
      }
    } catch (err) {
      return errMsg;
    }
  },
  isHotPrivateKeyPassword: (decodedHotPrivateKey, password, callback, errMsg = '密码错误') => {
    try {
      const decryptedKey = bip38.decrypt(decodedHotPrivateKey, password, () => {}, SCRYPT_PARAMS);
      _.isFunction(callback) && callback(decryptedKey);
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  required: (value, errMsg = '必填') => {
    return !value && value !== 0 ? errMsg : '';
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
    if (!_.isNaN(inputValue) && !_.isNaN(baseValue)) {
      return Number(inputValue) >= Number(baseValue) ? errMsg : '';
    }
  },
  smallerOrEqual: (inputValue, baseValue, errMsg = '余额不足') => {
    if (!_.isNaN(inputValue) && !_.isNaN(baseValue)) {
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

export const stringifyQueryString = payload => {
  return queryString.stringify(payload);
};

export const RegEx = {
  number: /^[0-9]*$/,
  decimalNumber: /^[0-9]+([.|。]{1}[0-9]*){0,1}$/,
  website: /^[0-9a-zA-Z.]*$/,
  checkDecimalNumber: precision => new RegExp('^[0-9]+([.|。]{1}[0-9]{0,' + precision + '}){0,1}$'),
  checkIsIP: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]):([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
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

export const getDeepPath = (routers, path) =>
  routers.filter(one =>
    _.find(
      path
        .split('/')
        .filter(item => item)
        .concat(path.slice(1)),
      item => `/${item}` === one.path
    )
  ) || [];

export const setBlankSpace = (value, unit) => {
  return `${value} ${unit}`;
};

export const fetchFromWs = ({ url, method, params = [], timeOut = 5000 }) => {
  const id = _.uniqueId();
  const message = JSON.stringify({ id, jsonrpc: '2.0', method, params });
  let startTime;
  let endTime;
  const request = () =>
    new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.onmessage = m => {
        try {
          const data = JSON.parse(m.data);
          if (data.id === id) {
            endTime = Date.now();
            resolve({
              data: data.result,
              wastTime: endTime - startTime,
            });
            ws.close();
          }
        } catch (err) {
          reject(err);
        }
      };
      ws.onopen = () => {
        startTime = Date.now();
        ws.send(message);
      };
      ws.onerror = err => {
        ws.close();
        reject(err);
      };
    });
  if (timeOut) {
    return Promise.race([
      request(),
      new Promise((resovle, reject) => {
        setTimeout(() => {
          reject(new Error('请求超时'));
        }, timeOut);
      }),
    ]);
  } else {
    return request();
  }
};

export const fetchFromHttp = ({ url, method = 'POST', methodAlias, params = [], timeOut = 5000 }) => {
  const id = _.uniqueId();
  const message = JSON.stringify({ id, jsonrpc: '2.0', method: methodAlias, params });
  const request = () =>
    fetch(url, {
      method: method,
      headers: {
        method,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      ...(method.toUpperCase() === 'GET' ? {} : { body: message }),
    })
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          return res.json();
        } else {
          return Promise.reject(res.statusText);
        }
      })
      .catch(err => {
        return Promise.reject(err);
      });
  if (timeOut) {
    return Promise.race([
      request(),
      new Promise((resovle, reject) => {
        setTimeout(() => {
          reject(new Error('请求超时'));
        }, timeOut);
      }),
    ]);
  } else {
    return request();
  }
};

export const isRepeat = arr => {
  let hash = {};
  for (let i in arr) {
    if (hash[arr[i]]) {
      return true;
    }
    hash[arr[i]] = true;
  }
  return false;
};

export const generateKlineData = (startTime, endTime) => {
  const getdays = (startTime, endTime, isInclude = false) => {
    const days = Math.ceil(moment.moment.duration(endTime - startTime).asDays());
    const daysArray = [];
    for (let i = 0; i < days - 2; i++) {
      daysArray.push(startTime + (i + 1) * 1 * 24 * 60 * 60 * 1000);
    }
    return daysArray;
  };

  const periods = getdays(startTime, endTime);

  let data = periods.map(item => {
    const h = _.random(30, 40);
    const o = _.random(10, 20);
    const c = _.random(10, 30);
    const l = _.random(10, 20);
    const v = _.random(100, 3000);
    return [item / 1000, o, c, h, l, v];
  });

  data = data.map(item => ({
    time: Number(item[0]) * 1000,
    open: Number(item[1]),
    close: Number(item[2]),
    high: Number(item[3]),
    low: Number(item[4]),
    volume: Number(item[5]),
  }));

  return data;
};

export const SetFullScreen = Ele => {
  if (document.documentElement.requestFullscreen) {
    Ele.requestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    Ele.mozRequestFullScreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    Ele.webkitRequestFullscreen();
  }
};
