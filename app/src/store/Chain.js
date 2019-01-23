import ModelExtend from './ModelExtend';
import { computed, observable } from 'mobx';
import { _ } from '@utils/index';
import { subscribeNewHead } from '../services';

let newHeadSubscription;

class Chain extends ModelExtend {
  @observable blockNumber;
  @observable blockTime;
  @observable blockDuration = 3000; // 出块时间3s TODO: 暂时写死，后边从storage去拿

  @computed get normalizedBlockNumber() {
    return this.blockNumber && this.blockNumber.toLocaleString();
  }

  setBlockNumber(blockNumber) {
    this.changeModel('blockNumber', blockNumber);
  }

  subscribeNewHead() {
    newHeadSubscription = subscribeNewHead().subscribe(head => {
      this.setBlockNumber(head.number);
      this.changeModel('blockTime', new Date(head.now * 1000));
    });

    console.log(newHeadSubscription);
  }

  unSubscribeNewHead() {
    if (_.isFunction(newHeadSubscription)) {
      newHeadSubscription.unsubscribe();
    }
  }
}

export default Chain;
