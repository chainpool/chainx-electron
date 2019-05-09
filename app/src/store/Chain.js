import ModelExtend from './ModelExtend';
import { computed, observable } from 'mobx';
import { _ } from '@utils/index';
import { subscribeNewHead, getBlockPeriod, chainProperties } from '../services';
import { fetchFromWs } from '../utils';

class Chain extends ModelExtend {
  @observable blockNumber;
  @observable blockTime;
  @observable blockDuration = 2000; // 出块时间
  @observable bitCoinNetWork = 'test';

  @computed get normalizedBlockNumber() {
    return this.blockNumber && this.blockNumber.toLocaleString();
  }

  setBlockNumber(blockNumber) {
    this.changeModel('blockNumber', blockNumber);
  }

  subscribeNewHead({ callback }) {
    return subscribeNewHead().subscribe(head => {
      const blockTime = new Date(head.now * 1000);
      this.setBlockNumber(head.number);
      this.changeModel('blockTime', blockTime);
      _.isFunction(callback) && callback(blockTime);
    });
  }

  async getBlockPeriod() {
    const period = await getBlockPeriod();
    this.changeModel('blockDuration', period * 1000);
  }

  getChainPropertiesFetch = async ({ url }) => {
    const res = await fetchFromWs({
      url,
      method: 'system_properties',
    });
    if (res && res.data) {
      return this.getNetType(res.data);
    }
  };

  getChainProperties = async () => {
    const res = await chainProperties();
    if (res) {
      return this.getNetType(res) || 'test';
    }
  };

  getNetType = data => {
    const { address_type, network_type, bitcoin_type } = data;
    console.log(data, '-----网络类型');
    if (bitcoin_type === 'mainnet') {
      this.changeModel({
        bitCoinNetWork: 'main',
      });
    } else if (bitcoin_type === 'testnet') {
      this.changeModel({
        bitCoinNetWork: 'test',
      });
    }
    if (address_type === 44 && network_type === 'mainnet') {
      return 'main';
    } else if (address_type === 42 && network_type === 'testnet') {
      return 'test';
    } else if (address_type === 44 && network_type === 'testnet') {
      return 'premain';
    }
  };
}

export default Chain;
