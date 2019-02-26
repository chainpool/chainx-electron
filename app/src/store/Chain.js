import ModelExtend from './ModelExtend';
import { computed, observable } from 'mobx';
import { _ } from '@utils/index';
import { subscribeNewHead, getBlockPeriod } from '../services';

let newHeadSubscription;

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
    newHeadSubscription = subscribeNewHead().subscribe(head => {
      const blockTime = new Date(head.now * 1000);
      this.setBlockNumber(head.number);
      this.changeModel('blockTime', blockTime);
      _.isFunction(callback) && callback(blockTime);
    });
    return newHeadSubscription;
  }

  unSubscribeNewHead() {
    if (_.isFunction(newHeadSubscription)) {
      newHeadSubscription.unsubscribe();
    }
  }

  async getBlockPeriod() {
    const period = await getBlockPeriod();
    this.changeModel('blockDuration', period * 1000);
  }
}

export default Chain;
