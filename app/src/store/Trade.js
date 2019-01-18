import { observable } from '../utils';
import ModelExtend from './ModelExtend';
import { getOrderPairs } from '../services';

export default class Trade extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'trade';
  @observable currentPair = {};
  @observable orderPairs = [];

  getOrderPairs = async () => {
    const orderPairs = await getOrderPairs();
    console.log(orderPairs, '-----');
    this.changeModel('orderPairs', orderPairs, []);
  };

  switchPair = id => {};
}
