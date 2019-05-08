import { autorun, computed, observable } from 'mobx';
import { _, localSave, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import { Toast } from '../components';
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
      localSave.set('currentSelectTest', this.currentAccountTest);
      localSave.set('currentSelectMain', this.currentAccountMain);
      localSave.set('currentSelectPreMain', this.currentAccountPreMain);
      localSave.set('accounts', this._accounts);
    });
  }

  @observable _accounts = localSave.get('accounts') || [];
  @observable currentAccountTest = localSave.get('currentSelectTest') || {};
  @observable currentAccountMain = localSave.get('currentAccountMain') || {};
  @observable currentAccountPreMain = localSave.get('currentAccountPreMain') || {};

  @computed
  get currentAccount() {
    if (this.isTestNetWork()) {
      return this.currentAccountTest;
    } else if (this.isMainNetWork()) {
      return this.currentAccountMain;
    } else if (this.isPreMainNetWork()) {
      return this.currentAccountPreMain;
    }
  }

  set currentAccount(account) {
    if (this.isTestNetWork()) {
      this.currentAccountTest = account;
    } else if (this.isMainNetWork()) {
      this.currentAccountMain = account;
    } else if (this.isPreMainNetWork()) {
      this.currentAccountPreMain = account;
    }
  }

  @computed
  get accounts() {
    if (this.isTestNetWork()) {
      return this._accounts.filter((item = {}) => item.net === 'test' || !item.net);
    } else if (this.isMainNetWork()) {
      return this._accounts.filter((item = {}) => item.net === 'main');
    } else if (this.isPreMainNetWork()) {
      return this._accounts.filter((item = {}) => item.net === 'premain');
    }
  }

  set accounts(accounts) {
    this._accounts = accounts;
  }

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
    // 是否是验证节点
    const intentions = this.rootStore.electionStore.validatorsWithAddress || [];
    const targetIntention = intentions.find(intention => intention.address === this.currentAccount.address);
    return !!targetIntention && targetIntention.isValidator;
  }

  @computed get isTrustee() {
    // 是否是信托节点
    const intentions = this.rootStore.electionStore.validatorsWithAddress || [];
    const targetIntention = intentions.find(intention => intention.address === this.currentAccount.address);
    return !!targetIntention && targetIntention.isTrustee && targetIntention.isTrustee.length;
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
    const filterOne = this.accounts.filter(item => item.address === address)[0];
    const currentNetWork = this.getCurrentNetWork();
    if (filterOne) {
      Toast.warn(`重复导入账户提醒`, `该账户已经存在于系统中,标签名为${filterOne.tag},不能重复导入`);
      return;
    }
    if (inElectron) {
      // TODO: 考虑用异步的方式保存keystore
      const success = ipc.sendSync(ipcMsg.SAVE_KEYSTORE, tag, address, encoded);
      if (!success) {
        return;
      }
    }
    this.changeModel('accounts', [...this._accounts, { tag, address, encoded, net: currentNetWork.value }]);
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
