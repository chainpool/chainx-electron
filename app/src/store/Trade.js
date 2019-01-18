import { observable, toJS } from '../utils';
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
    this.changeModel('orderPairs', orderPairs, []);
    return orderPairs;
  };

  switchPair = async id => {
    // const assets = await this.getAllAssets();
  };
}
