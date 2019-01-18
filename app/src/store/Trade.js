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
  @observable buyList = [];
  @observable sellList = [];

  getQuotations = async () => {
    const res = await getQuotations(this.currentPair.id, 1);
    const formatList = list => {
      return list.map((item = []) => ({
        price: item[0],
        amount: item[1],
        id: item.id,
        piece: item.piece,
      }));
    };
    if (res) {
      let { buy: buyList = [], sell: sellList = [] } = res;
      buyList = formatList(buyList);
      sellList = formatList(sellList);
      console.log(buyList, '-----------');
      this.changeModel(
        {
          buyList,
          sellList,
        },
        []
      );
    }
    // this.changeModel('quotations', res, {});

    console.log(res);
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
