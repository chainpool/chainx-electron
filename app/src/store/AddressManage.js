import { observable, autorun } from 'mobx';
import { localSave } from '../utils';
import ModelExtend from './ModelExtend';

export default class AddressMannage extends ModelExtend {
  constructor(...args) {
    super(...args);

    autorun(() => {
      localSave.set('addresses', this.addresses);
    });
  }

  @observable addresses = localSave.get('addresses') || [];

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
