import { observable, autorun } from 'mobx';
import { computed, convertAddressChecksumAll, localSave } from '../utils';
import ModelExtend from './ModelExtend';

export default class AddressMannage extends ModelExtend {
  constructor(...args) {
    super(...args);

    autorun(() => {
      localSave.set('testAddresses', this.testAddresses);
      localSave.set('mainAddresses', this.mainAddresses);
      localSave.set('premainAddresses', this.testAddresses);
      localSave.set('allTransferAddress', this.allTransferAddress);
    });
  }

  @observable testAddresses = localSave.get('testAddresses') || [];
  @observable mainAddresses = localSave.get('mainAddresses') || [];
  @observable premainAddresses = localSave.get('premainAddresses') || [];

  @observable allTransferAddress = localSave.get('allTransferAddress') || [];

  @computed
  get addresses() {
    if (this.isTestNetWork()) {
      return this.testAddresses;
    } else if (this.isMainNetWork()) {
      return this.mainAddresses;
    } else if (this.isPreMainNetWork()) {
      return this.premainAddresses;
    }

    return [];
  }

  set addresses(addresses) {
    if (this.isTestNetWork()) {
      this.testAddresses = addresses;
    } else if (this.isMainNetWork()) {
      this.mainAddresses = addresses;
    } else if (this.isPreMainNetWork()) {
      this.premainAddresses = addresses;
    }
  }

  @computed
  get transferAddress() {
    const currentNetWork = this.getCurrentNetWork();
    return this.allTransferAddress.filter(item => item.net === currentNetWork.value);
  }

  set transferAddress(addresses) {
    this.allTransferAddress = addresses;
  }

  addTransferAddress = ({ address }) => {
    const currentNetWork = this.getCurrentNetWork();
    this.changeModel('allTransferAddress', [
      {
        address,
        net: currentNetWork.value,
      },
      ...this.allTransferAddress,
    ]);
  };

  updateAllAddress = () => {
    const addresses = [...this.addresses];
    this.changeModel('addresses', convertAddressChecksumAll(addresses));
  };

  addAddress(address) {
    this.changeModel('addresses', [...this.addresses, address]);
  }

  removeAddress(index) {
    const addresses = [...this.addresses];
    addresses.splice(index, 1);
    this.changeModel('addresses', addresses);
  }

  updateLabel({ index, label }) {
    const addresses = [...this.addresses];
    addresses.splice(index, 1, { ...this.addresses[index], label });
    this.changeModel('addresses', addresses);
  }
}
