import { observable } from '@utils';

import ModelExtend from './ModelExtend';

export default class Global extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }
  @observable
  modal = {
    status: false,
    name: '',
    data: '',
  };

  openModal = (payload = {}) => {
    this.changeModel('modal', {
      status: true,
      ...payload,
    });
  };
  closeModal = () => {
    this.changeModel('modal', {
      status: false,
      name: '',
      data: '',
    });
  };
}
