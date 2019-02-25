import { observable } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork } from '../constants';

export default class Configure extends ModelExtend {
  @observable netWork = NetWork;
  @observable currentNetWork = NetWork[0];
  @observable isTestNet = (process.env.CHAINX_NET || '') !== 'main';
  @observable nodes = [
    {
      type: '系统默认',
      name: '本机私有',
      address: 'ws://localhost:6789',
      delay: '',
      links: '',
      syncStatus: '',
    },
  ];

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }
}
