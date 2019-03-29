import { observable, computed, autorun, localSave, _, fetchFromWs, fetchFromHttp, toJS } from '../utils';
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
  @observable isTestNet = true || (process.env.CHAINX_NET || '') !== 'main';
  @observable api = this.resetApi(
    this.refreshLocalNodesOrApi('Api')
      ? localSave.get('api')
      : [
          {
            type: '系统默认',
            name: 'api.chainx.org',
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

  getBestNodeAndApi = () => {
    const bestNode = this.nodes.filter(item => item.best)[0];
    const bestApi = this.api.filter(item => item.best)[0];
    return [bestNode, bestApi];
  };

  setBestNodeOrApi = ({ target, index }) => {
    const list = target === 'Node' ? this.nodes : this.api;
    const data = list.map((item, ins) => {
      if (ins === index) {
        return {
          ...item,
          best: true,
        };
      }
      return {
        ...item,
        best: false,
      };
    });
    this.changeModel(target === 'Node' ? 'nodes' : 'api', data);
    window.location.reload();
  };

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

  subscribeNodeOrApi = async ({ refresh, target, callback }) => {
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
      return (isHttp ? fromHttp(url) : fromWs(url)).then(r => {
        return {
          data: Number(r.data.block.header.number),
          wastTime: r.wastTime,
        };
      });
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

    const caculatePercent = currentIndex => {
      const list = _.cloneDeep(target === 'Node' ? this.nodes : this.api) || [];
      const sortedMaxBlockList = [...list].sort((a, b) => b.block - a.block);
      const maxBlock = sortedMaxBlockList[0] || {};
      const sortedList = [...list]
        .filter((item = {}) => item.block && item.delay)
        .sort((a = {}, b = {}) => {
          if (maxBlock.block - a.block <= 2 && maxBlock.block - b.block <= 2) {
            return a.delay - b.delay;
          }
          return b.block - a.block;
        });
      const bestNodeOrApi = sortedList[0] || {};
      const prevBestNodeOrApi = list.filter((item = {}) => item.best)[0] || {};
      // console.log(bestNodeOrApi, `最优${target === 'Node' ? '节点' : 'Api'}`);
      if (bestNodeOrApi && bestNodeOrApi.block) {
        const max = _.get(maxBlock, 'block');
        list.forEach((item = {}) => {
          if (item.block && max) {
            item.syncStatus =
              maxBlock.block - item.block <= 2
                ? '100.00%'
                : Number(((item.block / max) * 100).toString().match(/^\d+(?:.\d{0,2})?/)) + '%';
          }
        });
        if (prevBestNodeOrApi.address !== bestNodeOrApi.address) {
          if (this.autoSwitchBestNode) {
            prevBestNodeOrApi.best = false;
            bestNodeOrApi.best = true;
            console.log(
              `---------------1分钟后切换到最优${target === 'Node' ? '节点' : 'Api'}，最优结果：${bestNodeOrApi.name}`,
              bestNodeOrApi
            );
            reloadPage();
          } else {
            console.log(
              `用户未允许自动切换${target === 'Node' ? '节点' : 'Api'}功能，最优结果：${bestNodeOrApi.name}`,
              bestNodeOrApi
            );
          }
        } else {
          console.log(`最优${target === 'Node' ? '节点' : 'Api'}相等，不切换,最优结果：${bestNodeOrApi.name}`);
        }
        /*初始websocket连接失败用下面这行重新连接 最可靠的节点*/
        this.changeModel(target === 'Node' ? 'nodes' : 'api', list);
      }
      if (target === 'Node' && bestNodeOrApi.address && _.isFunction(callback)) callback(currentIndex);
    };

    for (let i = 0; i < list.length; i++) {
      if (target === 'Node') {
        const getIntentions = async () => {
          fetchSystemPeers(list[i].address)
            .then((result = {}) => {
              const res = result.data;
              if (res && res.length) {
                changeNodesOrApi(i, 'links', res && res.length ? res.length : '');
                changeNodesOrApi(i, 'delay', res ? result.wastTime : '');
              }
            })
            .catch(() => {
              changeNodesOrApi(i, 'links', '--');
              changeNodesOrApi(i, 'delay', 'timeOut');
            });
        };
        const getBlockNumber = () => {
          getBestNodeNumber(list[i].address)
            .then((result = {}) => {
              const res = result.data;
              if (res) {
                changeNodesOrApi(i, 'block', res);
                caculatePercent(i);
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
                caculatePercent(i);
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
