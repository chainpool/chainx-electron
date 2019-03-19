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
            name: 'https://api.chainx.org',
            best: true,
            address: 'https://api.chainx.org',
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

  subscribeNodeOrApi = async ({ refresh, target }) => {
    const list = target === 'Node' ? this.nodes : this.api;
    this.resetNodesOrApi(target);
    const changeNodesOrApi = (ins, key, value = '') => {
      const data = target === 'Node' ? this.nodes : this.api;
      this.changeModel(
        target === 'Node' ? 'nodes' : 'api',
        data.map((item, index) => {
          if (index !== ins) return item;
          return {
            ...item,
            [key]: value,
          };
        })
      );
    };

    const fetchSystemPeers = url => {
      return fetchFromWs({
        url,
        method: 'system_peers',
      });
    };

    const getBestNodeNumber = url => {
      const fromHttp = httpUrl => {
        return fetchFromHttp({
          url: httpUrl,
          method: 'POST',
          methodAlias: 'chain_getBlock',
        });
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

    const getBestApiNumber = url => {
      return fetchFromHttp({
        url: `${url}/chain/height`,
        method: 'GET',
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
      const list = _.cloneDeep(target === 'Node' ? this.nodes : this.api) || [];
      const sortedList = list
        .filter((item = {}) => item.block && item.delay)
        .sort((a = {}, b = {}) => a.delay - b.delay);
      const bestNode = sortedList[0] || {};
      const prevBestNodeOrApi = list.filter((item = {}) => item.best)[0] || {};
      if (bestNode && bestNode.block) {
        const max = _.get(_.cloneDeep(list).sort((a = {}, b = {}) => b.block - a.block)[0], 'block');
        list.forEach((item = {}) => {
          if (item.block && max) {
            item.syncStatus = formatNumber.percent(item.block / max, 2);
          }
        });
        if (prevBestNodeOrApi.address !== bestNode.address) {
          if (this.autoSwitchBestNode) {
            prevBestNodeOrApi.best = false;
            bestNode.best = true;
            console.log(sortedList, bestNode.address, bestNode.name, '---------------1分钟后切换到最优链节');
            reloadPage();
          } else {
            console.log('用户未允许自动切换功能');
          }
        } else {
          console.log(
            bestNode.address,
            prevBestNodeOrApi.address,
            '=========bestNode.address与prevBestNode.address相等'
          );
        }
        this.changeModel(target === 'Node' ? 'nodes' : 'api', list);
      }
    };

    for (let i = 0; i < list.length; i++) {
      if (target === 'Node') {
        const getIntentions = async () => {
          const startTime = Date.now();
          fetchSystemPeers(list[i].address)
            .then(res => {
              const endTime = Date.now();
              if (res && res.length) {
                changeNodesOrApi(i, 'links', res && res.length ? res.length : '');
                changeNodesOrApi(i, 'delay', res ? endTime - startTime : '');
              }
            })
            .catch(() => {
              changeNodesOrApi(i, 'links', '--');
              changeNodesOrApi(i, 'delay', 'timeOut');
            });
        };

        const getBlockNumber = () => {
          getBestNodeNumber(list[i].address)
            .then(res => {
              if (res) {
                changeNodesOrApi(i, 'block', res);
                caculatePercent();
              }
            })
            .catch(() => {
              changeNodesOrApi(i, 'syncStatus', '--');
            });
        };
        getIntentions();
        getBlockNumber();
      } else {
        const getBlockNumber = () => {
          const startTime = Date.now();
          getBestApiNumber(list[i].address)
            .then(res => {
              const endTime = Date.now();
              if (res) {
                changeNodesOrApi(i, 'block', res.height);
                changeNodesOrApi(i, 'delay', endTime - startTime);
                caculatePercent();
              }
            })
            .catch(() => {
              changeNodesOrApi(i, 'delay', 'timeOut');
              changeNodesOrApi(i, 'syncStatus', '--');
            });
        };
        getBlockNumber();
      }
    }
  };

  updateNodeOrApi = ({ action, ...rest }) => {
    const { name, address, index, target } = rest;
    if (target !== 'Node' && target !== 'Api') {
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
