import { observable, autorun, localSave, formatNumber, _, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork } from '../constants';
import { default as Chainx } from 'chainx.js';
import { pipe, startWith } from 'rxjs/operators';

export default class Configure extends ModelExtend {
  static Amount = 0;
  constructor(rootStore) {
    super(rootStore);
    this.reset = nodes => {
      return nodes.map(item => ({
        ...item,
        type: '自定义',
        syncStatus: '',
        links: '',
        block: _.uniqueId(), // 保证每次重置
        times: [],
        sum: 0,
        speed: 0,
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
        name: '默认传入',
        best: true,
        address: process.env.CHAINX_NODE_URL,
      },
    ]
  );

  resetNodes = () => {
    this.changeModel('nodes', this.reset(this.nodes));
  };

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }

  getBestNumber = url => {
    const id = _.uniqueId();
    const message = JSON.stringify({ id, jsonrpc: '2.0', method: 'chain_getBlock', params: [] });
    const fromHttp = httpUrl => {
      return fetch(httpUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: message,
      }).then(res => res.json());
    };

    const fromWs = wsUrl => {
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        ws.onmessage = m => {
          try {
            const data = JSON.parse(m.data);
            if (data.id === id) {
              resolve(data);
              ws.close();
            }
          } catch (err) {
            reject(err);
          }
        };
        ws.onopen = () => {
          ws.send(message);
        };
      });
    };

    const isHttp = /^[http|https]/.test(url);
    return (isHttp ? fromHttp(url) : fromWs(url)).then(r => Number(r.result.block.header.number));
  };

  subscribe = async ({ refresh }) => {
    let i = 0;
    let readyNodes = [];
    const nodes = this.nodes;
    this.resetNodes();

    const changeNodes = (ins, key, value = '') => {
      this.changeModel(
        'nodes',
        this.nodes.map((item, index) => {
          if (index !== ins) return item;
          return {
            ...item,
            [key]: value,
          };
        })
      );
    };

    for (let j = 0; j < nodes.length; j++) {
      const ChainX = new Chainx(nodes[j].address);

      const getIntentions = async () => {
        const startTime = Date.now();
        const res = await ChainX.chain.systemPeers();
        const endTime = Date.now();
        if (res && res.length) {
          changeNodes(j, 'links', res && res.length ? res.length : '');
          changeNodes(j, 'delay', res ? endTime - startTime : '');
        }
      };

      const caculatePercent = () => {
        const nodes = _.cloneDeep(this.nodes);
        const bestNode = nodes.filter((item = {}) => item.block).sort((a = {}, b = {}) => b.block - a.block)[0] || {};
        if (bestNode && bestNode.block) {
          const max = bestNode.block;
          nodes.map((item = {}) => {
            if (item.block) {
              item.syncStatus = formatNumber.percent(item.block / max, 2);
            }
          });
          this.changeModel('nodes', nodes);
        }
      };

      const getBlockNumber = () => {
        this.getBestNumber(nodes[j].address).then(res => {
          if (res) {
            changeNodes(j, 'block', res);
            caculatePercent();
          }
        });
      };

      ChainX.isRpcReady()
        .then(() => {
          getIntentions();
          getBlockNumber();
        })
        .catch(() => {
          getIntentions();
          getBlockNumber();
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
    this.subscribe({ refresh: true });
  };
}
