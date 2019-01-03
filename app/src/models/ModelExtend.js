import { action } from 'mobx';
import { _ } from '../utils';

export default class ModelExtend {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  changeModel = (k, v) => {
    if (k) {
      this[`${k}_prev`] = this[k];
      _.set(this, `${k}`, v);
    } else {
      console.error('changeModel参数的k是必须参数');
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
    return !_.isEmpty(this.rootStore.accountStore.currentAccount);
  };

  getCurrentAccount = () => {
    return this.rootStore.accountStore.currentAccount;
  };
}
