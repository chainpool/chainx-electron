import { autorun, computed, observable } from 'mobx';
import { _, localSave } from '../utils';
import ModelExtend from './ModelExtend';
import { ipc as ipcMsg } from '@constants';

const inElectron = process.env.CHAINX_BUILD_FOR_ELECTRON === 'true';
let ipc;
if (inElectron) {
  const { ipcRenderer } = window.require('electron');
  ipc = ipcRenderer;
}

export default class Store extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);

    autorun(() => {
      localSave.set('currentSelect', this.currentAccount);
      if (!inElectron) {
        localSave.set('accounts', this.accounts);
      }
    });

    let defaultAccounts = [];
    if (inElectron) {
      const originAccounts = ipc.sendSync(ipcMsg.GET_KEYSTORE);
      defaultAccounts = originAccounts.map(account => {
        return {
          tag: account.tag,
          address: account.address,
          encoded: account,
        };
      });
    } else {
      defaultAccounts = localSave.get('accounts');
    }

    this.accounts = defaultAccounts;
  }

  @observable accounts = localSave.get('accounts') || [];
  @observable currentAccount = localSave.get('currentSelect') || {};

  @computed get accountsList() {
    return this.accounts.map((item = {}) => ({
      label: item.tag,
      value: item.address,
    }));
  }

  @computed get isValidator() {
    // 是否是节点
    const intentions = this.rootStore.electionStore.validatorsWithAddress || [];
    const targetIntention = intentions.find(intention => intention.address === this.currentAccount.address);
    return !!targetIntention;
  }

  @computed get isActiveValidator() {
    // 是否是节点
    const intentions = this.rootStore.electionStore.validatorsWithAddress || [];
    const targetIntention = intentions.find(intention => intention.address === this.currentAccount.address);
    return !!targetIntention && targetIntention.isValidator;
  }

  @computed get isTrustee() {
    // 是否信托节点
    const intentions = this.rootStore.electionStore.validatorsWithAddress || [];
    const targetIntention = intentions.find(intention => intention.address === this.currentAccount.address);
    return !!targetIntention && targetIntention.isTrustee;
  }

  @computed get currentAddress() {
    return this.currentAccount && this.currentAccount.address;
  }

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

    const history = this.getHistory();
    const nextAddress = newCurrentAccount.address;
    const { pathname, search } = this.setQueryParams('address', nextAddress);
    if (nextAddress) {
      history.push({ search });
    } else {
      history.push({ pathname });
    }
    this.changeModel('currentAccount', newCurrentAccount);
  }

  addAccount({ tag, address, encoded }) {
    // address已经存在的不再重复加入
    if (this.accounts.filter(item => item.address === address)[0]) return;
    if (inElectron) {
      // TODO: 考虑用异步的方式保存keystore
      const success = ipc.sendSync(ipcMsg.SAVE_KEYSTORE, tag, address, encoded);
      if (!success) {
        return;
      }
    }
    this.changeModel('accounts', [...this.accounts, { tag, address, encoded }]);
    this.setCurrentAccount(address);
  }

  deleteAccount({ address }) {
    const accounts = [...this.accounts];
    const index = this.accounts.findIndex(account => account.address === address);
    if (index < 0) {
      return;
    }

    if (inElectron) {
      const success = ipc.sendSync(ipcMsg.DELETE_KEYSTORE, address);
      if (!success) {
        return;
      }
    }

    accounts.splice(index, 1);
    this.changeModel('accounts', accounts);
    this.setCurrentAccount();
  }

  updateEncoded({ address, encoded }) {
    const accounts = [...this.accounts];
    const index = this.accounts.findIndex(account => account.address === address);
    if (index < 0) {
      return;
    }

    const account = this.accounts[index];

    if (inElectron) {
      const success = ipc.sendSync(ipcMsg.SAVE_KEYSTORE, account.tag, address, encoded);
      if (!success) {
        return;
      }
    }

    accounts.splice(index, 1, { ...account, encoded });
    this.changeModel('accounts', accounts);
    this.setCurrentAccount();
  }

  updateTag({ address, tag }) {
    const accounts = [...this.accounts];
    const index = this.accounts.findIndex(account => account.address === address);
    if (index < 0) {
      return;
    }

    const account = this.accounts[index];

    if (inElectron) {
      const success = ipc.sendSync(ipcMsg.SAVE_KEYSTORE, tag, address, account.encoded);
      if (!success) {
        return;
      }
    }

    accounts.splice(index, 1, { ...account, tag });
    this.changeModel('accounts', accounts);
    this.setCurrentAccount();
  }

  switchAccount({ address }) {
    this.setCurrentAccount(address);
  }
}
