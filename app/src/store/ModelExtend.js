import { action } from 'mobx';
import { _, ChainX, formatNumber, parseQueryString, stringifyQueryString } from '../utils';

export default class ModelExtend {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  changeModel = (k, v, defaultValue) => {
    const change = (k, v, defaultValue) => {
      if (k) {
        this[`${k}_prev`] = _.cloneDeep(this[k]);
        _.set(this, `${k}`, _.isUndefined(defaultValue) ? v : v || defaultValue);
      } else {
        console.error('changeModel参数的k是必须参数');
      }
    };
    if (_.isObject(k)) {
      for (let i in k) {
        if (k.hasOwnProperty(i)) {
          change(i, k[i], defaultValue);
        }
      }
    } else {
      change(k, v, defaultValue);
    }
  };

  dispatch = (payloads = {}) => {
    const { type, payload = {} } = payloads;
    const setLoading = status => {
      // if (_.has(this, `loading.${type}`)) {
      //   this.changeModel(`loading.${type}`, status);
      // }
    };

    if (!type || !this[type]) {
      console.error(`dispatch参数的type是必须参数,并且必须存在${type}这个方法`);
      return Promise.reject(new Error('dispatch参数的type是必须参数,并且必须存在这个方法'));
    }

    setLoading(true);
    const result = this[type] && this[type](payload);
    if (result && result.then) {
      return result.then(res => {
        setLoading(false);
        return res;
      });
    } else {
      setLoading(false);
      return Promise.resolve(result);
    }
  };

  openModal = payload => {
    this.closeModal();
    setTimeout(() => {
      this.rootStore.globalStore.openModal(payload);
    });
  };

  closeModal = payload => {
    setTimeout(() => {
      this.rootStore.globalStore.closeModal(payload);
    });
  };

  getHistory = () => {
    return this.rootStore.globalStore.history || {};
  };

  setQueryParams = (key, value) => {
    const history = this.getHistory();
    const { location: { pathname, search } = {} } = history;
    const searchPrev = parseQueryString(search);
    searchPrev[key] = value;
    return {
      pathname,
      search: `?${stringifyQueryString(searchPrev)}`,
    };
  };

  getParams = () => {
    const history = this.getHistory();
    const { location: { pathname, search } = {} } = history;
    return {
      pathname,
      search: parseQueryString(search),
    };
  };

  isLogin = () => {
    return !_.isEmpty(this.rootStore.accountStore.currentAccount) || !!this.rootStore.accountStore.accounts.length;
  };

  getCurrentAccount = () => {
    return this.rootStore.accountStore.currentAccount;
  };

  decodeAddressAccountId = account => {
    if (account && account.address) {
      return ChainX.account.decodeAddress(account.address).replace(/^0x/, '');
    } else if (typeof account === 'string') {
      return ChainX.account.decodeAddress(account).replace(/^0x/, '');
    }
  };

  encodeAddressAccountId = accountId => {
    if (/^0x/.test(accountId)) {
      return ChainX.account.encodeAddress(accountId);
    } else {
      return ChainX.account.encodeAddress(`0x${accountId}`);
    }
  };

  getAllAssets = () => {
    return this.rootStore.globalStore.getAllAssets();
  };

  getAccountAssets = () => {
    return this.rootStore.assetStore.getAccountAssets();
  };

  setPrecision = (value, token, multiplication = false) => {
    if (_.isNumber(token)) {
      /*直接提供数字设置精度，限币币交易页面pair交易对使用*/
      return formatNumber.toPrecision(value, token, multiplication);
    }
    const assets = this.rootStore.globalStore.assets;
    const findOne = assets.filter((item = {}) => item.name === token)[0] || {};
    return formatNumber.toPrecision(value, findOne.precision, multiplication);
  };

  setDefaultPrecision = (value, multiplication = false) => {
    const assets = this.rootStore.globalStore.assets;
    const findOne = assets.filter((item = {}) => item.name === 'PCX')[0] || {};
    return formatNumber.toPrecision(value, findOne.precision, multiplication);
  };

  getPrecision = token => {
    const assets = this.rootStore.globalStore.assets;
    const findOne = assets.filter((item = {}) => item.name === token)[0] || {};
    return findOne.precision;
  };

  getDefaultPrecision = () => {
    const assets = this.rootStore.globalStore.assets;
    const findOne = assets.filter((item = {}) => item.name === 'PCX')[0] || {};
    return findOne.precision;
  };

  getCurrentNetWork = () => this.rootStore.configureStore.currentNetWork;

  isTestNetWork = () => this.rootStore.configureStore.currentNetWork.value === 'test';

  isMainNetWork = () => this.rootStore.configureStore.currentNetWork.value === 'main';

  isPreMainNetWork = () => this.rootStore.configureStore.currentNetWork.value === 'premain';

  isTestBitCoinNetWork = () => this.rootStore.chainStore.bitCoinNetWork === 'test';
}
