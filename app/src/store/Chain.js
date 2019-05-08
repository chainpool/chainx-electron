import ModelExtend from './ModelExtend';
import { computed, observable } from 'mobx';
import { _ } from '@utils/index';
import { subscribeNewHead, getBlockPeriod, chainProperties } from '../services';
import { fetchFromWs } from '../utils';

class Chain extends ModelExtend {
  @observable blockNumber;
  @observable blockTime;
  @observable blockDuration = 2000; // 出块时间

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
      return this.getType(res.data);
    }
  };

  getChainProperties = async () => {
    const res = await chainProperties();
    if (res) {
      return this.getType(res) || 'test';
    }
  };

  getType = data => {
    const { address_type, network_type } = data;
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
