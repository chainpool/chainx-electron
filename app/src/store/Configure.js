import { observable, autorun, localSave } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork } from '../constants';
import { default as Chainx } from 'chainx.js';

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
  @observable nodes = localSave.get('nodes') || [
    {
      type: '自定义',
      name: '159',
      address: process.env.CHAINX_NODE_URL,
      delay: '',
      links: '',
      syncStatus: '',
    },
  ];

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }

  update = () => {};

  subScribe = async () => {
    const nodes = this.nodes;
    const ChainX = new Chainx(nodes[0].address);
    await ChainX.isRpcReady();
    ChainX.chain.subscribeNewHead().subscribe(res => {
      // console.log(res, '============');
    });
  };

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
