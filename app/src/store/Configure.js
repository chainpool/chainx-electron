import { observable, computed, autorun, localSave, formatNumber, _, fetchFromWs, fetchFromHttp } from '../utils';
import ModelExtend from './ModelExtend';
import { NetWork, ConfigureVersion } from '../constants';

export default class Configure extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
    this.resetNode = nodes => {
      return nodes.map(item => ({
        ...item,
        syncStatus: '',
        links: '',
        delay: '',
        block: '',
      }));
    };
    this.resetApi = api => {
      return api.map(item => ({
        ...item,
        syncStatus: '',
        delay: '',
        block: '',
      }));
    };

    this.refreshLocalNodesOrApi = target => {
      const localTarget = target === 'Node' ? 'nodes' : 'api';
      const list = localSave.get(localTarget) || [];
      const findOne = list.filter((item = {}) => item.isSystem && item.Version === ConfigureVersion)[0];
      if (!findOne) {
        localSave.remove(localTarget);
      }
      return localSave.get(localTarget) && localSave.get(localTarget).length;
    };

    autorun(() => {
      localSave.set('nodes', this.nodes);
      localSave.set('api', this.api);
      localSave.set('autoSwitchBestNode', this.autoSwitchBestNode);
      localSave.set('autoSwitchBestApi', this.autoSwitchBestApi);
    });
  }

  @observable autoSwitchBestNode = localSave.get('autoSwitchBestNode') || false;
  @observable autoSwitchBestApi =
    localSave.get('autoSwitchBestApi') === undefined ? true : localSave.get('autoSwitchBestApi');
  @observable netWork = NetWork;
  @observable currentNetWork = NetWork[0];
  @observable isTestNet = (process.env.CHAINX_NET || '') !== 'main';
  @observable api = this.resetApi(
    this.refreshLocalNodesOrApi('Api')
      ? localSave.get('api')
      : [
          {
            type: '系统默认',
            name: 'api.chainx.org',
            best: true,
            address: 'api.chainx.org',
            isSystem: true,
            Version: ConfigureVersion,
          },
        ]
  );
  @observable nodes = this.resetNode(
    this.refreshLocalNodesOrApi('Node')
      ? localSave.get('nodes')
      : [
          {
            type: '系统默认',
            name: 'wallet-server',
            best: true,
            address: process.env.CHAINX_NODE_URL,
            isSystem: true,
            Version: ConfigureVersion,
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
  @computed get TradeVersion() {
    return true;
  }

  resetNodesOrApi = target => {
    if (target === 'Node') {
      this.changeModel('nodes', this.resetNode(this.nodes));
    } else {
      this.changeModel('api', this.resetApi(this.api));
    }
  };

  setCurrentNetWork({ name, ip }) {
    this.changeModel('currentNetWork', { name, ip });
  }

  getBestNodeNumber = url => {
    const fromHttp = httpUrl => {
      return fetchFromHttp({
        url: httpUrl,
        method: 'POST',
        methodAlias: 'chain_getBlock',
      }).then(res => res.json());
    };

    const fromWs = url => {
      return fetchFromWs({
        url,
        method: 'chain_getBlock',
      });
    };

    const isHttp = /^[http|https]/.test(url);
    return (isHttp ? fromHttp(url) : fromWs(url)).then(r => Number(r.block.header.number));
  };

  subscribeNodeOrApi = async ({ refresh, target }) => {
    const list = target === 'Node' ? this.nodes : this.api;
    this.resetNodesOrApi(target);
    const changeNodesOrApi = (ins, key, value = '') => {
      if (target === 'Node') {
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
      } else {
        this.changeModel(
          'api',
          this.api.map((item, index) => {
            if (index !== ins) return item;
            return {
              ...item,
              [key]: value,
            };
          })
        );
      }
    };

    const fetchSystemPeers = url => {
      return fetchFromWs({
        url,
        method: 'system_peers',
      });
    };

    const reloadPage = () => {
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
        .sort((a = {}, b = {}) => a.delay - b.delay);
      const bestNode = sortedNodes[0] || {};
      const prevBestNode = nodes.filter((item = {}) => item.best)[0] || {};
      if (bestNode && bestNode.block) {
        const max = _.get(_.cloneDeep(nodes).sort((a = {}, b = {}) => b.block - a.block)[0], 'block');
        nodes.forEach((item = {}) => {
          if (item.block && max) {
            item.syncStatus = formatNumber.percent(item.block / max, 2);
          }
        });
        if (prevBestNode.address !== bestNode.address) {
          if (this.autoSwitchBestNode) {
            prevBestNode.best = false;
            bestNode.best = true;
            console.log(sortedNodes, bestNode.address, bestNode.name, '---------------1分钟后切换到最优链节');
            reloadPage();
          } else {
            console.log('用户未允许自动切换功能');
          }
        } else {
          console.log(bestNode.address, prevBestNode.address, '=========bestNode.address与prevBestNode.address相等');
        }
        this.changeModel('nodes', nodes);
      }
    };

    for (let i = 0; i < list.length; i++) {
      const getIntentions = async () => {
        const startTime = Date.now();
        const res = await fetchSystemPeers(list[i].address);
        const endTime = Date.now();
        if (res && res.length) {
          changeNodesOrApi(i, 'links', res && res.length ? res.length : '');
          changeNodesOrApi(i, 'delay', res ? endTime - startTime : '');
        }
      };

      const getBlockNumber = () => {
        this.getBestNodeNumber(list[i].address).then(res => {
          if (res) {
            changeNodesOrApi(i, 'block', res);
            caculatePercent();
          }
        });
      };

      if (target === 'Node') {
        getIntentions();
        getBlockNumber();
      } else {
        console.log('jj');
      }
    }
  };

  updateNodeOrApi = ({ action, ...rest }) => {
    const { name, address, index, target } = rest;
    if (target !== 'Node' || target !== 'Api') {
      throw new Error('增删该查target必须时Node或Api');
    }
    const list = target === 'Node' ? [...this.nodes] : [...this.api];
    switch (action) {
      case 'add':
        list.push({
          type: '自定义',
          name,
          address,
        });
        break;
      case 'delete':
        list.splice(index, 1);
        break;
      case 'update': {
        const findOne = list.filter((item, ins) => ins === index)[0] || {};
        list.splice(index, 1, { ...findOne, address, name });
      }
    }

    if (target === 'Node') {
      this.changeModel('nodes', list);
    } else {
      this.changeModel('api', list);
    }
    this.subscribeNodeOrApi({ refresh: false, target });
  };

  updateAutoSwitchBestNode = ({ autoSwitchBestNode }) => {
    this.changeModel('autoSwitchBestNode', autoSwitchBestNode);
  };

  updateAutoSwitchBestApi = ({ autoSwitchBestApi }) => {
    this.changeModel('autoSwitchBestApi', autoSwitchBestApi);
  };
}
