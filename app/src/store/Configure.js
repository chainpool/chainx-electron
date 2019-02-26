import { observable, autorun, localSave } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork } from '../constants';

export default class Configure extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
    autorun(() => {
      localSave.set('nodes', this.nodes);
    });
  }

  @observable netWork = NetWork;
  @observable currentNetWork = NetWork[0];
  @observable isTestNet = (process.env.CHAINX_NET || '') !== 'main';
  @observable nodes = localSave.get('nodes') || [];

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }

  update = () => {};

  updateNode = ({ action, ...rest }) => {
    const { name, address, index } = rest;
    const nodes = [...this.nodes];
    switch (action) {
      case 'add':
        {
          nodes.push({
            type: '自定义',
            name,
            address,
          });
        }
        break;
      case 'delete':
        {
          nodes.splice(index, 1);
        }
        break;
      case 'update': {
        const findOne = nodes.filter((item, ins) => ins === index)[0] || {};
        nodes.splice(index, 1, { ...findOne, address, name });
      }
    }
    this.changeModel('nodes', nodes);
  };
}
