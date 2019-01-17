import ModelExtend from './ModelExtend';
import { computed, observable } from 'mobx';
import { _, ChainX } from '@utils/index';
import { getBlockNumberObservable } from '../services';

let unsubscribeFn;

class Chain extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable blockNumber;

  @computed get normalizedBlockNumber() {
    return this.blockNumber && this.blockNumber.toLocaleString();
  }

  setBlockNumber(blockNumber) {
    this.changeModel('blockNumber', blockNumber);
  }

  async subscribeBlockNumber() {
    const observable = getBlockNumberObservable();

    unsubscribeFn = observable.subscribe(blockNumber => {
      this.setBlockNumber(parseInt(blockNumber));
    });

    return observable;
  }

  unsubscribe() {
    if (unsubscribeFn) {
      _.isFunction(unsubscribeFn) && unsubscribeFn();
    }
  }
}

export default Chain;
