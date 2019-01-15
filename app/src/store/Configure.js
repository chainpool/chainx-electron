import { observable } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork } from '../constants';

export default class Configure extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable netWork = NetWork;
  @observable currentNetWork = NetWork[0];

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }
}
