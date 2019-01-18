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
    // console.log(orderPairs, '====');
    return orderPairs;
  };

  switchPair = async ({ id }) => {
    let currentPair = {};
    const findOne = this.orderPairs.filter((item = {}) => item.id === +id)[0];
    if (findOne) {
      currentPair = findOne;
    } else {
      currentPair = this.orderPairs[0];
    }
    this.changeModel('currentPair', currentPair, {});
  };
}
