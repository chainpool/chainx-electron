import ModelExtend from './ModelExtend';
import { observable } from 'mobx';

class Chain extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable blockNumber;

  setBlockNumber(blockNumber) {
    this.changeModel('blockNumber', blockNumber);
  }
}

export default Chain;
