import { action } from 'mobx';
import { _, toJS, formatNumber } from '../utils';

export default class ModelExtend {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  changeModel = (k, v, defaultValue) => {
    const change = (k, v, defaultValue) => {
      if (k) {
        this[`${k}_prev`] = this[k];
        _.set(this, `${k}`, v || defaultValue);
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
      if (_.has(this, `loading.${type}`)) {
        this.changeModel(`loading.${type}`, status);
      }
    };

    if (!type || !this[type]) {
      console.error('dispatch参数的type是必须参数,并且必须存在这个方法');
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

  isLogin = () => {
    return !_.isEmpty(this.rootStore.accountStore.currentAccount) || !!this.rootStore.accountStore.accounts.length;
  };

  getCurrentAccount = () => {
    return this.rootStore.accountStore.currentAccount;
  };

  getAllAssets = () => {
    return this.rootStore.globalStore.getAllAssets();
  };

  setPrecision = (value, token) => {
    const assets = this.rootStore.globalStore.assets;
    const findOne = assets.filter((item = {}) => item.name === token)[0] || {};
    console.log(value, token, formatNumber.toPrecision(value, findOne.precision));
    return formatNumber.toPrecision(value, findOne.precision);
  };
}
