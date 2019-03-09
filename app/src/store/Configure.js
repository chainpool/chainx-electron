import { observable, autorun, localSave, formatNumber, _, toJS, fetchFromWs } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork } from '../constants';
import { pipe, startWith } from 'rxjs/operators';

export default class Configure extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
    this.reset = nodes => {
      return nodes.map(item => ({
        ...item,
        syncStatus: '',
        links: '',
        delay: '',
        block: '',
        times: [],
      }));
    };

    this.refreshLocalNodes = () => {
      const nodes = localSave.get('nodes') || [];
      const findOne = nodes.filter((item = {}) => item.isSystem)[0];
      if (!findOne) {
        localSave.remove('nodes');
      }
      return localSave.get('nodes') && localSave.get('nodes').length;
    };

    autorun(() => {
      localSave.set('nodes', this.nodes);
      localSave.set('autoSwitchBestNode', this.autoSwitchBestNode);
    });
  }

  @observable autoSwitchBestNode = localSave.get('autoSwitchBestNode') || false;
  @observable netWork = NetWork;
  @observable currentNetWork = NetWork[0];
  @observable isTestNet = (process.env.CHAINX_NET || '') !== 'main';
  @observable nodes = this.reset(
    this.refreshLocalNodes()
      ? localSave.get('nodes')
      : [
          {
            type: '系统默认',
            name: 'wallet-server',
            best: true,
            address: process.env.CHAINX_NODE_URL,
            isSystem: true,
          },
          {
            type: '系统默认',
            name: '本机',
            address: 'ws://localhost:8097',
            isSystem: true,
            isLocalhost: true,
          },
          {
            type: '系统默认',
            name: 'w1',
            isSystem: true,
            address: 'wss://w1.chainx.org/ws',
          },
          {
            type: '系统默认',
            name: 'w2',
            isSystem: true,
            address: 'wss://w2.chainx.org/ws',
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
      return fetchFromWs({
        wsUrl,
        method: 'chain_getBlock',
      });
    };

    const isHttp = /^[http|https]/.test(url);
    return (isHttp ? fromHttp(url) : fromWs(url)).then(r => Number(r.block.header.number));
  };

  subscribe = async ({ refresh }) => {
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

    const fetchSystemPeers = wsUrl => {
      return fetchFromWs({
        wsUrl,
        method: 'system_peers',
      });
    };

    for (let j = 0; j < nodes.length; j++) {
      const getIntentions = async () => {
        const startTime = Date.now();
        const res = await fetchSystemPeers(nodes[j].address);
        const endTime = Date.now();
        if (res && res.length) {
          changeNodes(j, 'links', res && res.length ? res.length : '');
          changeNodes(j, 'delay', res ? endTime - startTime : '');
        }
      };

      const switchWs = () => {
        clearInterval(this.interval);
        this.interval = setTimeout(() => {
          const { pathname, search } = this.setQueryParams('bestNode', true);
          if (refresh) {
            window.location.href = `${pathname}${search}`;
          }
        }, 60 * 1000);
      };

      const caculatePercent = () => {
        const nodes = _.cloneDeep(this.nodes) || [];
        const sortedNodes = nodes
          .filter((item = {}) => item.block && item.delay)
          .sort((a = {}, b = {}) => Number(a.delay) - Number(b.delay));
        const bestNode = sortedNodes[0] || {};
        const prevBestNode = nodes.filter((item = {}) => item.best)[0] || {};
        if (bestNode && bestNode.block) {
          const max = _.get(_.cloneDeep(nodes).sort((a = {}, b = {}) => b.block - a.block)[0], 'block');
          nodes.map((item = {}) => {
            if (item.block && max) {
              item.syncStatus = formatNumber.percent(item.block / max, 2);
            }
          });
          if (prevBestNode.address !== bestNode.address) {
            if (this.autoSwitchBestNode) {
              prevBestNode.best = false;
              bestNode.best = true;
              console.log(sortedNodes, bestNode.address, bestNode.name, '---------------1分钟后切换到最优链节');
              switchWs();
            } else {
              console.log('用户未允许自动切换功能');
            }
          } else {
            console.log(bestNode.address, prevBestNode.address, '=========bestNode.address与prevBestNode.address相等');
          }
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

      getIntentions();
      getBlockNumber();
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
    this.subscribe({ refresh: false });
  };

  updateAutoSwitchBestNode = ({ autoSwitchBestNode }) => {
    this.changeModel('autoSwitchBestNode', autoSwitchBestNode);
  };
}
