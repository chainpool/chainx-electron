import { computed, observable } from 'mobx';
import ModelExtend from './ModelExtend';

export default class Store extends ModelExtend {
  @observable accounts = [
    { name: 'Chainx1', address: '5DeCxFFfGv5eR7JNDasJa6K2fiPuCVP8WBLi4y894oX41opq' },
    { name: 'Chainx2', address: '5DeCxFFfGv5eR7JNDasJa6K2fiPuCVP8WBLi4y894oX41opq' },
  ];
  @observable currentIndex = 0;

  @computed get currentAccount() {
    if (typeof this.currentIndex !== 'undefined') {
      return this.accounts[this.currentIndex];
    }

    return null;
  }

  setCurrentIndex(index) {
    if (index >= 0 && index < this.accounts.length) {
      this.changeModel('currentIndex', index);
    }
  }

  add({ tag, address, encoded }) {
    if (this.accounts.filter(account => account.tag === tag).length > 0) {
      return;
    }

    this.changeModel('accounts', [...this.accounts, { tag, address, encoded }]);
    if (this.accounts.length === 1) {
      this.setCurrentIndex(0);
    }
  }

  delete(tag) {
    const index = this.accounts.findIndex(account => account.tag === tag);
    if (index >= 0) {
      this.changeModel('accounts', [...this.accounts].splice(index - 1, 1));
    }

    if (this.accounts.length <= 0) {
      this.setCurrentIndex(undefined);
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
