import { observable } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork } from '../constants';

export default class Configure extends ModelExtend {
  @observable netWork = NetWork;
  @observable currentNetWork = NetWork[0];
  @observable isTestNet = (process.env.CHAINX_NET || '') !== 'main';

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }
}
