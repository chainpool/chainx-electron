import { observable, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import { getOrderPairs, getQuotations } from '../services';

export default class Trade extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'trade';
  @observable currentPair = {};
  @observable orderPairs = [];

  getQuotations = async () => {
    const quotations = await getQuotations(this.currentPair.id, 1);
    console.log(quotations);
  };

  getOrderPairs = async () => {
    const orderPairs = await getOrderPairs();
    this.changeModel('orderPairs', orderPairs, []);
    return orderPairs;
  };

  switchPair = ({ id }) => {
    let currentPair = {};
    const findOne = this.orderPairs.filter((item = {}) => item.id === +id)[0];
    if (findOne) {
      currentPair = findOne;
    } else {
      currentPair = this.orderPairs[0];
    }
    this.changeModel('currentPair', currentPair, {});
    return currentPair;
  };
}
