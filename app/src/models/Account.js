import { computed, observable } from 'mobx';
import { _, localSave } from '../utils';
import ModelExtend from './ModelExtend';

export default class Store extends ModelExtend {
  @observable accounts = localSave.get('accounts') || [];
  @observable currentAccount = {};

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
    localSave.set('accounts', this.accounts);
  }

  addAccount({ tag, address, encoded }) {
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

  updateEncoded(tag, encoded) {
    const account = this.accounts.find(account => account.tag === tag);
    if (account) {
      this.changeModel('encoded', encoded);
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
    this.setCurrentAccount(address);
  }
}
