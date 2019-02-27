import { observable, autorun, localSave, Rx, _, toJS } from '../utils';
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
      links: '',
      syncStatus: '',
      block: '',
    },
  ];

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }

  update = () => {};

  subscribe = async () => {
    let i = 0;
    const readyNodes = [];
    const nodes = this.nodes;
    const caculateCount = () => {
      i++;
      if (i === nodes.length) {
        console.log(i, '-----------------caculateCount');
        const subs = Rx.combineLatest(...readyNodes);
        this.subs = subs.subscribe((res = []) => {
          console.log(toJS(this.nodes), res, '===========');
          this.changeModel(
            'nodes',
            this.nodes.map((item, index) => ({
              ...item,
              ...(_.get(res[index], 'number') ? { block: _.get(res[index], 'number') } : {}),
            }))
          );
        });
      }
    };
    for (let i = 0; i < nodes.length; i++) {
      const ChainX = new Chainx(nodes[i].address);
      console.log(ChainX.isRpcReady, i, '======================================');
      ChainX.isRpcReady()
        .then(() => {
          readyNodes.push(ChainX.chain.subscribeNewHead());
          caculateCount();
        })
        .catch(() => {
          caculateCount();
        });
    }

    // for (let node in nodes) {
    //   const ChainX = new Chainx(nodes[node].address);
    //   await ChainX.isRpcReady();
    //   readyNodes.push(ChainX.chain.subscribeNewHead());
    // }
  };

  updateNode = ({ action, ...rest }) => {
    this.subs && this.subs.unsubscribe();
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
    this.subscribe();
  };
}
