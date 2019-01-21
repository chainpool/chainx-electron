import { computed, observable } from 'mobx';
import { _, localSave } from '../utils';
import ModelExtend from './ModelExtend';

export default class Store extends ModelExtend {
  @observable accounts = localSave.get('accounts') || [];
  @observable currentAccount = localSave.get('currentSelect') || {};

  setCurrentAccount(address = '') {
    let newCurrentAccount = this.accounts.filter(item => item.address === this.currentAccount.address)[0];
    const findAccount = _.find(this.accounts, (item = {}) => item.address === address);
    const currentAccount = _.find(this.accounts, (item = {}) => item.address === this.currentAccount.address);
    if (findAccount) {
      newCurrentAccount = findAccount;
    } else if (!currentAccount && this.accounts.length) {
      newCurrentAccount = this.accounts[0];
    } else if (!currentAccount && !this.accounts.length) {
      newCurrentAccount = {};
    }
    this.changeModel('currentAccount', newCurrentAccount);
    localSave.set('currentSelect', newCurrentAccount);
    localSave.set('accounts', this.accounts);
  }

  addAccount({ tag, address, encoded }) {
    // address已经存在的不再重复加入
    if (this.accounts.filter(item => item.address === address)[0]) return;
    this.changeModel('accounts', [...this.accounts, { tag, address, encoded }]);
    this.setCurrentAccount();
  }

  deleteAccount({ address }) {
    const accounts = [...this.accounts];
    const index = this.accounts.findIndex(account => account.address === address);
    if (index > -1) {
      accounts.splice(index, 1);
      this.changeModel('accounts', accounts);
      this.setCurrentAccount();
    }
  }

  updateEncoded({ address, encoded }) {
    const accounts = [...this.accounts];
    const index = this.accounts.findIndex(account => account.address === address);
    if (index > -1) {
      accounts.splice(index, 1, { ...this.accounts[index], encoded });
      this.changeModel('accounts', accounts);
      this.setCurrentAccount();
    }
  }

  updateTag({ address, tag }) {
    const accounts = [...this.accounts];
    const index = this.accounts.findIndex(account => account.address === address);
    if (index > -1) {
      accounts.splice(index, 1, { ...this.accounts[index], tag });
      this.changeModel('accounts', accounts);
      this.setCurrentAccount();
    }
  }

  switchAccount({ address }) {
    this.rootStore.accountStore.setCurrentAccount(address);
  }
}
