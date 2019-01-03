import { computed, observable } from 'mobx';
import { _, localSave } from '../utils';
import ModelExtend from './ModelExtend';

export default class Store extends ModelExtend {
  @observable accounts = localSave.get('accounts') || [];
  @observable currentAccount = {};

  setCurrentAccount(address = '') {
    let newCurrentAccount = this.currentAccount || {};
    const findAccount = _.find(this.accounts, (item = {}) => item.address === address);
    const currentAccount = _.find(this.accounts, (item = {}) => item.address === this.currentAccount.address);
    if (findAccount) {
      newCurrentAccount = findAccount;
    } else if (!currentAccount && this.accounts.length) {
      newCurrentAccount = this.accounts[0];
    }
    this.changeModel('currentAccount', newCurrentAccount);
    localSave.set('accounts', this.accounts);
  }

  addAccount({ tag, address, encoded }) {
    this.changeModel('accounts', [...this.accounts, { tag, address, encoded }]);
    this.setCurrentAccount();
  }

  delete(tag) {
    const index = this.accounts.findIndex(account => account.tag === tag);
    if (index >= 0) {
      this.changeModel('accounts', [...this.accounts].splice(index - 1, 1));
    }
  }

  updateEncoded(tag, encoded) {
    const account = this.accounts.find(account => account.tag === tag);
    if (account) {
      this.changeModel('encoded', encoded);
    }
  }

  updateTag(tag, newTag) {
    const account = this.accounts.find(account => account.tag === tag);
    if (account) {
      this.changeModel('tag', newTag);
    }
  }

  switchAccount({ address }) {
    this.setCurrentAccount(address);
  }
}
