import { computed, observable } from 'mobx';
import { _, localSave } from '../utils';
import ModelExtend from './ModelExtend';

console.log(localSave.get('accounts'));

export default class Store extends ModelExtend {
  @observable accounts = localSave.get('accounts') || [];
  @observable currentAccount = {};

  setCurrent(address) {
    let newCurrentAccount = this.currentAccount || {};
    const findAccount = _.find(this.accounts, (item = {}) => item.address === address);
    const currentAccount = _.find(this.accounts, (item = {}) => item.address === this.currentAccount.address);
    if (findAccount) {
      newCurrentAccount = findAccount;
    } else if (!currentAccount && this.accounts[0]) {
      newCurrentAccount = this.accounts[0];
    }
    this.changeModel('currentAccount', newCurrentAccount);
    localSave.set('accounts', this.accounts);
  }

  add({ tag, address, encoded }) {
    this.changeModel('accounts', [...this.accounts, { tag, address, encoded }]);
    this.setCurrent();
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
}
