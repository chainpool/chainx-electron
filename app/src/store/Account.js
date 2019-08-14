import { autorun, computed, observable } from 'mobx';
import { _, localSave, convertAddressChecksumAll, isElectron } from '../utils';
import ModelExtend from './ModelExtend';
import { default as downloadFile } from 'downloadjs';
import { Toast } from '../components';
import { SimulatedAccount } from '../constants';

export default class Store extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);

    autorun(() => {
      localSave.set('currentSelectTest', this.currentSelectTest);
      localSave.set('currentSelectMain', this.currentSelectMain);
      localSave.set('currentSelectPreMain', this.currentSelectPreMain);
      localSave.set('accountsTest', this.accountsTest);
      localSave.set('accountsMain', this.accountsMain);
      localSave.set('accountsPreMain', this.accountsPreMain);
    });
  }

  @observable accountsTest = localSave.get('accountsTest') || localSave.get('accounts') || [];
  @observable accountsMain = localSave.get('accountsMain') || [];
  @observable accountsPreMain = localSave.get('accountsPreMain') || [];
  @observable currentSelectTest = localSave.get('currentSelectTest') || {};
  @observable currentSelectMain = localSave.get('currentSelectMain') || {};
  @observable currentSelectPreMain = localSave.get('currentSelectPreMain') || {};

  @computed
  get currentAccount() {
    if (this.isTestNetWork()) {
      return this.currentSelectTest;
    } else if (this.isMainNetWork()) {
      return this.currentSelectMain;
    } else if (this.isPreMainNetWork()) {
      return this.currentSelectPreMain;
    }

    return null;
  }

  set currentAccount(account) {
    if (this.isTestNetWork()) {
      this.currentSelectTest = account;
    } else if (this.isMainNetWork()) {
      this.currentSelectMain = account;
    } else if (this.isPreMainNetWork()) {
      this.currentSelectPreMain = account;
    }
  }

  @computed
  get accounts() {
    if (this.isTestNetWork()) {
      return this.accountsTest.filter((item = {}) => !item.net || item.net === 'test');
    } else if (this.isMainNetWork()) {
      if (!isElectron() && this.accountsMain.findIndex(item => item.address === SimulatedAccount.address) === -1) {
        const newList = [...this.accountsMain];
        newList.unshift(SimulatedAccount);
        return newList;
      }
      return this.accountsMain;
    } else if (this.isPreMainNetWork()) {
      return this.accountsPreMain;
    }

    return [];
  }

  set accounts(accounts) {
    if (this.isTestNetWork()) {
      this.accountsTest = accounts;
    } else if (this.isMainNetWork()) {
      this.accountsMain = accounts;
    } else if (this.isPreMainNetWork()) {
      this.accountsPreMain = accounts;
    }
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

  updateAllAccounts = () => {
    const accounts = [...this.accounts];
    this.changeModel('accounts', convertAddressChecksumAll(accounts));
  };

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

  addAccount({ tag, address, encoded, download = true }) {
    // address已经存在的不再重复加入
    const filterOne = this.accounts.filter(item => item.address === address)[0];
    const factNetWork = this.getFactNetWork();
    const currentNetWork = this.getCurrentNetWork();
    if (filterOne) {
      Toast.warn(`重复导入账户提醒`, `该账户已经存在于系统中,标签名为${filterOne.tag},不能重复导入`);
      return;
    }
    const user = { tag, address, encoded, net: currentNetWork.value };
    this.changeModel('accounts', [...this.accounts, user]);
    if (currentNetWork.value !== factNetWork) {
      Toast.warn(`您当前创建的账户类型是${currentNetWork.value === 'test' ? '测试网' : '主网'}账户`);
    }
    if (download) {
      this.exportKeystore(user);
    }
    this.setCurrentAccount(address);
  }

  deleteAccount({ address }) {
    const accounts = [...this.accounts];
    const index = this.accounts.findIndex(account => account.address === address);
    if (index < 0) {
      return;
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
    accounts.splice(index, 1, { ...account, tag });
    this.changeModel('accounts', accounts);
    this.setCurrentAccount();
  }

  exportKeystore = ({ address, tag, encoded, net }) => {
    const user = { address, tag, encoded, net };
    downloadFile(JSON.stringify(user), `${address}`);
  };

  switchAccount({ address }) {
    this.setCurrentAccount(address);
  }
}
