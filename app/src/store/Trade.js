import { observable } from '../utils';
import ModelExtend from './ModelExtend';
import { getOrderPairs } from '../services';

export default class Trade extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'trade';
  @observable orderPairs = [];

  async getOrderPairs() {
    const orderPairs = await getOrderPairs();
    this.changeModel('orderPairs', orderPairs);
  }
}
