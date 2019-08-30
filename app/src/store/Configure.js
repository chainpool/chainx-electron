import { _, autorun, computed, fetchFromHttp, fetchFromWs, localSave, observable } from '../utils';
import ModelExtend from './ModelExtend';
import { ConfigureVersion, NetWork } from '../constants';

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
      const list = localSave.get(target) || [];
      return list.filter((item = {}) => item.isSystem && item.Version === ConfigureVersion)[0];
    };

    this.concatNodeOrApi = (defaultNodesOrApi = [], selfNodesOrApi = []) => {
      const bestCount = defaultNodesOrApi.filter(item => item.best);
      const versionCount = defaultNodesOrApi.filter(item => item.Version);
      if ((defaultNodesOrApi.length && bestCount.length === 0) || bestCount.length > 1) {
        throw Error('默认节点或Api必须且只有一个best属性等于true');
      }
      if (defaultNodesOrApi.length && versionCount.length === 0) {
        throw Error('默认节点或Api必须至少有一个Version属性等于ConfigureVersion');
      }

      const findOne = selfNodesOrApi.filter(item => item.best)[0];
      if (findOne) {
        defaultNodesOrApi = [...defaultNodesOrApi].map(item => {
          item.best = null;
          return item;
        });
      }
      selfNodesOrApi = selfNodesOrApi.map(item => ({
        ...item,
        type: 'UserDefined',
        name: item.name === 'ThisMachine' ? 'ThisMachine' : item.name,
      }));
      return defaultNodesOrApi.concat(selfNodesOrApi);
    };

    autorun(() => {
      localSave.set('testNodes', this.testNodes);
      localSave.set('mainNodes', this.mainNodes);
      localSave.set('premainNodes', this.premainNodes);
      localSave.set('testApi', this.testApi);
      localSave.set('mainApi', this.mainApi);
      localSave.set('premainApi', this.premainApi);
      localSave.set('autoSwitchBestNode', this.autoSwitchBestNode);
      localSave.set('autoSwitchBestApi', this.autoSwitchBestApi);
      localSave.set('currentNetWork', this.currentNetWork);
    });
  }

  @observable autoSwitchBestNode = localSave.get('autoSwitchBestNode') || false;
  @observable autoSwitchBestApi =
    localSave.get('autoSwitchBestApi') === undefined ? true : localSave.get('autoSwitchBestApi');
  @observable netWork = NetWork;
  @observable currentNetWork = localSave.get('currentNetWork') || NetWork[0];
  @observable factNetWork = '';

  @observable testApi = this.resetApi(
    this.refreshLocalNodesOrApi('testApi')
      ? localSave.get('testApi')
      : this.concatNodeOrApi(
          [
            // {
            //   type: 'SystemDefault',
            //   name: 'api.chainx.org',
            //   best: true,
            //   address: 'https://api.chainx.org',
            //   isSystem: true,
            //   Version: ConfigureVersion,
            // },
          ],
          (localSave.get('testApi') || []).filter((item = {}) => !item.isSystem)
        )
  );

  @observable premainApi = this.resetApi(
    this.refreshLocalNodesOrApi('premainApi')
      ? localSave.get('premainApi')
      : this.concatNodeOrApi(
          [
            {
              type: 'SystemDefault',
              name: 'api.chainx.org',
              best: true,
              address: 'https://api.chainx.org',
              isSystem: true,
              Version: ConfigureVersion,
            },
          ],
          (localSave.get('premainApi') || []).filter((item = {}) => !item.isSystem)
        )
  );

  @observable mainApi = this.resetApi(
    this.refreshLocalNodesOrApi('mainApi')
      ? localSave.get('mainApi')
      : this.concatNodeOrApi(
          [
            {
              type: 'SystemDefault',
              name: 'api.org',
              best: true,
              address: 'https://api.chainx.org',
              isSystem: true,
              Version: ConfigureVersion,
            },
            {
              type: 'SystemDefault',
              name: 'api.cn',
              address: 'https://api.chainx.org.cn',
              isSystem: true,
            },
          ],
          (localSave.get('mainApi') || []).filter((item = {}) => !item.isSystem)
        )
  );

  @observable testNodes = this.resetNode(
    this.refreshLocalNodesOrApi('testNodes')
      ? localSave.get('testNodes')
      : this.concatNodeOrApi(
          [
            // {
            //   type: 'SystemDefault',
            //   name: 'w1.org',
            //   best: true,
            //   isSystem: true,
            //   Version: ConfigureVersion,
            //   address: 'wss://w1.chainx.org/ws',
            // },
            // {
            //   type: 'SystemDefault',
            //   name: 'w2.org',
            //   isSystem: true,
            //   address: 'wss://w2.chainx.org/ws',
            // },
            // {
            //   type: 'SystemDefault',
            //   name: 'hashquark',
            //   isSystem: true,
            //   address: 'wss://chainx.hashquark.io',
            // },
            // {
            //   type: 'SystemDefault',
            //   name: 'buildlinks',
            //   isSystem: true,
            //   address: 'wss://chainx.buildlinks.org',
            // },
          ],
          (localSave.get('testNodes') || []).filter((item = {}) => !item.isSystem)
        )
  );

  @observable premainNodes = this.resetNode(
    this.refreshLocalNodesOrApi('premainNodes')
      ? localSave.get('premainNodes')
      : this.concatNodeOrApi(
          [
            {
              type: 'SystemDefault',
              name: 'w1',
              best: true,
              isSystem: true,
              Version: ConfigureVersion,
              address: 'wss://w1.chainx.org/ws',
            },
            {
              type: 'SystemDefault',
              name: 'w2',
              isSystem: true,
              address: 'wss://w2.chainx.org/ws',
            },
          ],
          (localSave.get('premainNodes') || []).filter((item = {}) => !item.isSystem)
        )
  );

  @observable mainNodes = this.resetNode(
    this.refreshLocalNodesOrApi('mainNodes')
      ? localSave.get('mainNodes')
      : this.concatNodeOrApi(
          [
            {
              type: 'SystemDefault',
              name: 'w1.org',
              best: true,
              isSystem: true,
              Version: ConfigureVersion,
              address: 'wss://w1.chainx.org/ws',
            },
            {
              type: 'SystemDefault',
              name: 'w2.org',
              isSystem: true,
              address: 'wss://w2.chainx.org/ws',
            },
            {
              type: 'SystemDefault',
              name: 'HashQuark',
              isSystem: true,
              address: 'wss://chainx.hashquark.io',
            },
            {
              type: 'SystemDefault',
              name: 'BuildLinks',
              isSystem: true,
              address: 'wss://chainx.buildlinks.org',
            },
            {
              type: 'SystemDefault',
              name: 'w1.cn',
              isSystem: true,
              address: 'wss://w1.chainx.org.cn/ws',
            },
          ],
          (localSave.get('mainNodes') || []).filter((item = {}) => !item.isSystem)
        )
  );

  @computed
  get nodes() {
    if (this.isTestNetWork()) {
      return this.testNodes;
    } else if (this.isMainNetWork()) {
      return this.mainNodes;
    } else if (this.isPreMainNetWork()) {
      return this.premainNodes;
    }
    return [];
  }

  set nodes(nodes) {
    if (this.isTestNetWork()) {
      this.testNodes = nodes;
    } else if (this.isMainNetWork()) {
      this.mainNodes = nodes;
    } else if (this.isPreMainNetWork()) {
      this.premainNodes = nodes;
    }
  }

  @computed
  get api() {
    if (this.isTestNetWork()) {
      return this.testApi;
    } else if (this.isMainNetWork()) {
      return this.mainApi;
    } else if (this.isPreMainNetWork()) {
      return this.premainApi;
    }

    return null;
  }

  set api(api) {
    if (this.isTestNetWork()) {
      this.testApi = api;
    } else if (this.isMainNetWork()) {
      this.mainApi = api;
    } else if (this.isPreMainNetWork()) {
      this.premainApi = api;
    }
  }

  @computed get TradeVersion() {
    return true;
  }

  @computed get isTestNet() {
    //这个测试网决定了UI显示测试网还是主网
    return this.isTestNetWork() || this.isPreMainNetWork();
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

  setCurrentNetWork({ name, value }) {
    this.changeModel('currentNetWork', { name, value });
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
          timeOut: 7000,
        });
      };

      const fromWs = url => {
        return fetchFromWs({
          url,
          method: 'chain_getBlock',
          timeOut: 7000,
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
      }, 0);
    };

    const caculatePercent = currentIndex => {
      const list = _.cloneDeep(target === 'Node' ? this.nodes : this.api) || [];
      const sortedMaxBlockList = [...list]
        .filter((item = {}) => item.block && item.block !== '--')
        .sort((a, b) => b.block - a.block);
      const maxBlock = sortedMaxBlockList[0] || {};
      const sortedList = [...list]
        .filter((item = {}) => item.block && item.block !== '--' && item.delay && item.delay !== '--')
        .sort((a = {}, b = {}) => {
          if (maxBlock.block - a.block <= 2 && maxBlock.block - b.block <= 2) {
            return a.delay - b.delay;
          }
          return b.block - a.block;
        });
      const bestNodeOrApi = sortedList[0] || {};
      const prevBestNodeOrApi = list.filter((item = {}) => item.best)[0] || {};
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
            // console.log(
            //   `---------------1分钟后切换到最优${target === 'Node' ? '节点' : 'Api'}，最优结果：${bestNodeOrApi.name}`,
            //   bestNodeOrApi
            // );
            reloadPage();
          } else {
            // console.log(
            //   `用户未允许自动切换${target === 'Node' ? '节点' : 'Api'}功能，最优结果：${bestNodeOrApi.name}`,
            //   bestNodeOrApi
            // );
          }
        } else {
          // console.log(`最优${target === 'Node' ? '节点' : 'Api'}相等，不切换,最优结果：${bestNodeOrApi.name}`);
        }
        /*初始websocket连接失败用下面这行重新连接 最可靠的节点*/
        this.changeModel(target === 'Node' ? 'nodes' : 'api', list);
      } else {
        console.log('没找到bestNode', list);
      }
      if (target === 'Node' && bestNodeOrApi.address && _.isFunction(callback)) callback(currentIndex);
    };

    for (let i = 0; i < list.length; i++) {
      if (target === 'Node') {
        const getIntentions = async () =>
          fetchSystemPeers(list[i].address)
            .then((result = {}) => {
              const res = result.data;
              if (res && res.length) {
                changeNodesOrApi(i, 'links', res && res.length ? res.length : '');
              }
            })
            .catch(() => {
              changeNodesOrApi(i, 'links', '--');
            });

        const getBlockNumber = () =>
          getBestNodeNumber(list[i].address)
            .then((result = {}) => {
              const res = result.data;
              if (res) {
                changeNodesOrApi(i, 'delay', res ? result.wastTime : '');
                changeNodesOrApi(i, 'block', res);
                caculatePercent(i);
              }
            })
            .catch(() => {
              changeNodesOrApi(i, 'delay', 'timeOut');
              changeNodesOrApi(i, 'syncStatus', '--');
            });
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
          type: 'UserDefined',
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
        break;
      }

      // no default
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
