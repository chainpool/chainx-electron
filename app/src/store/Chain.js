import ModelExtend from './ModelExtend';
import { observable } from 'mobx';
import { ChainX } from '@utils/index';

let unsubscribeFn;

class Chain extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable blockNumber;

  setBlockNumber(blockNumber) {
    this.changeModel('blockNumber', blockNumber);
  }

  async subscribeBlockNumber() {
    const observable = await ChainX.chain.getBlockNumberObservable();

    unsubscribeFn = observable.subscribe(blockNumber => {
      this.setBlockNumber(parseInt(blockNumber));
    });
  }

  unsubscribe() {
    if (unsubscribeFn) {
      unsubscribeFn();
    }
  }
}

export default Chain;
