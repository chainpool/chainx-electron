import { localSave, lodash_helper, moment_helper } from './helper';
import { BigNumber } from 'bignumber.js';
import { default as queryString } from 'query-string';
import { inject, observer as observerable } from 'mobx-react';
import device from 'current-device';
import { SCRYPT_PARAMS } from '../constants';
import { default as Chainx } from 'chainx.js';
import wif from 'wif';
import bip38 from 'bip38';
import { default as bitcoin } from 'bitcoinjs-lib';
import { default as WAValidator } from 'wallet-address-validator';

//------------------通用部分
export { request } from './request';
export const _ = lodash_helper;
export const moment = moment_helper;
export { localSave, moment_helper, accountSave, Rx } from './helper';
export { default as classNames } from 'classnames';
export { default as translation } from './translation';
// export { default as io } from './io';

// ----------------------------项目适用
export { toJS, observable, computed, action, runInAction, autorun } from 'mobx';

const getBestNode = () => {
  const currentNetWork = localSave.get('currentNetWork') || { value: 'test' };
  let nodes = [];
  if (currentNetWork.value === 'test') {
    nodes = localSave.get('testNodes') || [];
  } else if (currentNetWork.value === 'main') {
    nodes = localSave.get('mainNodes') || [];
  } else if (currentNetWork.value === 'premain') {
    nodes = localSave.get('premainNodes') || [];
  }
  const findOne = nodes.filter((item = {}) => item.best)[0] || {};
  const bestAddress = findOne.address || process.env.CHAINX_NODE_URL || 'ws://127.0.0.1:9944';
  const otherNodesAddress = nodes.filter((item = {}) => item.address !== bestAddress).map((item = {}) => item.address);
  return [bestAddress, otherNodesAddress];
};
const [bestAddress, otherNodesAddress] = getBestNode();
export const ChainX = new Chainx(bestAddress, otherNodesAddress);

export const hexPrefix = hex => {
  if (/^0x/.test(hex)) {
    return hex;
  }
  return `0x${hex}`;
};

export const convertAddressChecksum = address => {
  try {
    ChainX.account.decodeAddress(address, false);
    return address;
  } catch (error) {
    if (error && error.message && error.message.includes('checksum')) {
      return ChainX.account.encodeAddress(ChainX.account.decodeAddress(address, true));
    } else {
      throw new Error('Invalid address');
    }
  }
};

export const convertAddressChecksumAccount = (account = {}) => {
  if (!account.address) return {};
  try {
    return {
      ...account,
      address: convertAddressChecksum(account.address),
    };
  } catch (err) {
    return account;
  }
};

export const convertAddressChecksumAll = (accounts = []) => {
  if (!accounts.length) return accounts;
  return accounts.map((item = {}) => {
    return convertAddressChecksumAccount(item);
  });
};

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

export const getAllPubsFromRedeemScript = redeemScript => {
  const chunks = bitcoin.script.decompile(Buffer.from(redeemScript, 'hex'));
  const pubBufs = chunks.slice(1, chunks.length - 2);
  return pubBufs.map(chunk => chunk.toString('hex'));
};

export const getMNFromRedeemScript = redeemScript => {
  const chunks = bitcoin.script.decompile(Buffer.from(redeemScript, 'hex'));
  const m = chunks[0] - 80;
  const n = chunks[chunks.length - 2] - 80;
  return {
    m,
    n,
  };
};

export const Patterns = {
  decode: (encoded, password, errMsg = 'PasswordError') => {
    try {
      ChainX.account.fromKeyStore(encoded, password);
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  isPrivateKey: (privateKey, errMsg = 'AccountImportPrivateKeyNotFormat') => {
    try {
      return /^0x[0-9a-fA-F]{64}$/.test(privateKey) || /^0x[0-9a-fA-F]{170}$/.test(privateKey) ? '' : errMsg;
    } catch (err) {
      return errMsg;
    }
  },
  isMnemonicValid: (mnemonic, errMsg = 'AccountImportMnemonicNotFormat') => {
    try {
      return ChainX.account.isMnemonicValid(mnemonic) ? '' : errMsg;
    } catch (err) {
      return errMsg;
    }
  },
  isBTCAddress: (address, isTestNet, errMsg = 'AddressFormatError') => {
    const valid = WAValidator.validate(address, 'BTC', isTestNet ? 'testnet' : 'prod');
    if (valid) {
      return '';
    }
    return errMsg;
  },
  isEthereumAddress: (address, isTestNet, errMsg = 'AddressFormatError') => {
    const valid = WAValidator.validate(address, 'ETH', isTestNet ? 'testnet' : 'prod');
    if (valid) {
      return '';
    }
    return errMsg;
  },
  isChainXAddress: (address, errMsg = 'AddressFormatError') => {
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
  isChainXAccountPubkey: (accountId, errMsg = 'AddressFormatError') => {
    try {
      const result = ChainX.account.encodeAddress(hexPrefix(accountId));
      if (!result) {
        return errMsg;
      }
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  isWsAddress: (address, errMsg = 'AddressFormatError') => {
    return /[ws|wss]:\/\/[\d|.]*/.test(address) ? '' : errMsg;
  },
  isHttpAddress: (address, errMsg = 'AddressFormatError') => {
    return /(http|https):\/\/([\w.]+\/?)\S*/.test(address) ? '' : errMsg;
  },
  isPublicKey: (pubkey, errMsg = 'NotMathTheFormat') => {
    if (pubkey.replace(/^0x/, '').length !== 66) {
      return errMsg;
    } else {
      try {
        bitcoin.ECPair.fromPublicKey(Buffer.from(pubkey.replace(/^0x/, ''), 'hex'), { compressed: true });
        return '';
      } catch (err) {
        return errMsg;
      }
    }
  },
  isHotPrivateKey: (priKey, pubKey, isTest, callback, errMsg = 'NotMathTheFormat') => {
    try {
      const decoded = wif.decode(priKey);
      _.isFunction(callback) && callback(decoded);
      try {
        let ecPair = bitcoin.ECPair.fromWIF(priKey, isTest ? bitcoin.networks.testnet : bitcoin.networks.bitcoin); // 导入私钥
        return ecPair.publicKey.toString('hex') === pubKey ? '' : 'HotEntityNotMathHotPrivateEntity';
      } catch (err) {
        return 'HotEntityNotMathHotPrivateEntity';
      }
    } catch (err) {
      return errMsg;
    }
  },
  isHotPrivateKeyPassword: (decodedHotPrivateKey, password, callback, errMsg = 'PasswordError') => {
    try {
      const decryptedKey = bip38.decrypt(decodedHotPrivateKey, password, () => {}, SCRYPT_PARAMS);
      _.isFunction(callback) && callback(decryptedKey);
      return '';
    } catch (err) {
      return errMsg;
    }
  },
  required: (value, errMsg = 'Required') => {
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
  smaller: (inputValue, baseValue, errMsg = 'BalanceNotEnough') => {
    if (!_.isNaN(inputValue) && !_.isNaN(baseValue)) {
      return Number(inputValue) >= Number(baseValue) ? errMsg : '';
    }
  },
  smallerOrEqual: (inputValue, baseValue, errMsg = 'BalanceNotEnough') => {
    if (!_.isNaN(inputValue) && !_.isNaN(baseValue)) {
      return Number(inputValue) > Number(baseValue) ? errMsg : '';
    }
  },
  characterLength: (inputValue = '', minLength, maxLength) => {
    let result = inputValue.length > minLength ? '' : `最少${minLength}个字符`;
    result = inputValue.length > maxLength ? `最多${maxLength}个字符` : result;
    return result;
  },
  precision: (inputValue, precision) => {
    if (inputValue && !_.isNaN(precision)) {
      inputValue = String(inputValue).replace(/(\.\d+?)0*$/, '$1'); //parseFloat(inputValue);
      const length = _.get(String(inputValue).split('.')[1] || 0, 'length');
      return length > Number(precision) ? `小数位数最大${precision}位` : '';
    }
  },
  passwordUpperAndLower: (value, errMsg = 'PasswordUpperAndLower') => {
    const result = RegEx.checkUpperAndCase.test(value);
    if (result) return '';
    return errMsg;
  },
  isTransactionTx: (tx, isTest, errMsg = 'NotMathTheFormat') => {
    try {
      const transactionRaw = bitcoin.Transaction.fromHex(tx.replace(/^0x/, ''));
      bitcoin.TransactionBuilder.fromTransaction(
        transactionRaw,
        isTest ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
      );
      return '';
    } catch {
      return errMsg;
    }
  },
  isTransactionTxSigned: (tx, isTest, errMsg = '未签名') => {
    const network = isTest ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    const transactionRaw = bitcoin.Transaction.fromHex(tx.replace(/^0x/, ''));
    const txb = bitcoin.TransactionBuilder.fromTransaction(transactionRaw, network);
    const inputs = txb.__inputs[0];
    return _.get(inputs, 'signatures.length') ? '' : errMsg;
  },
  isRedeemScript: (redeemScript, errMsg = '赎回脚本格式错误') => {
    try {
      const res = getAllPubsFromRedeemScript(redeemScript);
      return res.length ? '' : errMsg;
    } catch {
      return errMsg;
    }
  },
  check: value => {
    return (...params) => {
      if (!Patterns[value]) {
        return console.error('check对应的方法必须存在');
      }
      const result = Patterns[value](...params);
      return result;
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
  checkAuthorization: /^(\w+:.+@)?((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]):([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$)/,
  checkAuthorizationHttps: /^(\w+:.+@)?([\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$)/,
  checkUpperAndCase: /(?=.*[a-z])(?=.*[A-Z])/,
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

export const fetchFromWs = window.fetchFromWs;

export const fetchFromNodeHttp = window.fetchFromNodeHttp;

export const fetchFromHttp = ({
  url,
  method = 'POST',
  methodAlias,
  params = [],
  body,
  timeOut = 5000,
  header = {},
}) => {
  const id = _.uniqueId();
  const message = body ? JSON.stringify(body) : JSON.stringify({ id, jsonrpc: '2.0', method: methodAlias, params });
  const request = () =>
    fetch(url, {
      method: method,
      headers: {
        method,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...header,
      },
      ...(method.toUpperCase() === 'GET' ? {} : { body: message }),
    })
      .then(async res => {
        try {
          if (res && res.status >= 200 && res.status < 300) {
            return res.json();
          } else {
            const result = await res.json();
            return Promise.reject({
              status: res.status,
              message: result,
            });
          }
        } catch (e) {
          return Promise.reject({
            status: res.status,
            message: e.message,
          });
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
          reject('请求超时');
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

export const setNet = net => ChainX.account.setNet(net);

export const isElectron = () => window.electronStore;

export const groupArrayByCount = (array = [], count) => {
  const result = [];
  let newArray = [];
  while (array.length && count) {
    if (newArray.length < count) {
      newArray.push(array.shift());
    } else {
      result.push(newArray.slice());
      newArray = [];
    }
  }
  if (newArray.length) {
    result.push(newArray);
  }

  return result;
};

export const showAssetName = asset => {
  switch (asset) {
    case 'BTC':
      return 'X-BTC';
    case 'SDOT':
      return 'S-DOT';
    case 'L-BTC':
      return 'L-BTC';
    case 'PCX':
      return 'PCX';
    default:
      return '未知资产';
  }
};

export const add0x = str => {
  if (typeof str !== 'string') {
    return str;
  }

  return `0x${str.replace(/^0x/i, '')}`;
};

export const remove0x = str => {
  if (typeof str !== 'string') {
    return str;
  }

  return str.replace(/^0x/i, '');
};
