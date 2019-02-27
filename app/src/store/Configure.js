import { observable, autorun, localSave, Rx, _, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork } from '../constants';
import { default as Chainx } from 'chainx.js';
import { pipe, startWith } from 'rxjs/operators';

export default class Configure extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
    this.reset = nodes => {
      return nodes.map(item => ({
        ...item,
        type: '自定义',
        syncStatus: '',
        links: '',
        block: '',
      }));
    };
    autorun(() => {
      localSave.set('nodes', this.nodes);
    });
  }

  @observable netWork = NetWork;
  @observable currentNetWork = NetWork[0];
  @observable isTestNet = (process.env.CHAINX_NET || '') !== 'main';
  @observable nodes = this.reset(
    localSave.get('nodes') || [
      {
        name: '159',
        address: process.env.CHAINX_NODE_URL,
      },
    ]
  );

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }

  subscribe = async () => {
    let i = 0;
    let readyNodes = [];
    const nodes = this.nodes;

    this.changeModel('nodes', this.reset(this.nodes));

    const caculateCount = () => {
      i++;
      if (i === nodes.length) {
        readyNodes.sort((a = {}, b = {}) => a.ins - b.ins);
        readyNodes = readyNodes.map((item = {}) => item.observer);
        const subs = Rx.combineLatest(...readyNodes);
        this.subs = subs.subscribe((res = []) => {
          // console.log(readyNodes, res, '===========');
          this.changeModel(
            'nodes',
            this.nodes.map((item = {}, index) => ({
              ...item,
              ...(_.get(res[index], 'number') ? { block: _.get(res[index], 'number') } : {}),
            }))
          );
        });
      }
    };

    for (let i = 0; i < nodes.length; i++) {
      const ChainX = new Chainx(nodes[i].address);

      const getIntentions = () => {
        const setLinks = (ins, length) => {
          this.changeModel(
            'nodes',
            this.nodes.map((item, index) => {
              if (index !== ins) return item;
              return {
                ...item,
                links: length || '',
              };
            })
          );
        };
        ChainX.stake
          .getIntentions()
          .then((res = []) => {
            setLinks(i, res.length);
          })
          .catch(() => {
            setLinks(i, 0);
          });
      };

      ChainX.isRpcReady()
        .then(() => {
          readyNodes.push({
            ins: i,
            observer: ChainX.chain.subscribeNewHead(),
          });
          caculateCount();
          getIntentions();
        })
        .catch(() => {
          readyNodes.push({
            ins: i,
            observer: Rx.empty().pipe(startWith({})),
          });
          caculateCount();
          getIntentions();
        });
    }
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
