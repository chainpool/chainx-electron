import { observable, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import { getOrderPairs, getQuotations } from '../services';

export default class Trade extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'trade';
  @observable currentPair = {
    assets: '',
    currency: '',
    precision: '',
  };
  @observable orderPairs = [];
  @observable buyList = [];
  @observable sellList = [];

  getQuotations = async () => {
    const currentPair = this.currentPair;
    const res = await getQuotations(currentPair.id, 1);
    const formatList = list => {
      return list.map((item = []) => ({
        price: this.setPrecision(item[0], currentPair.precision),
        amount: this.setPrecision(item[1], currentPair.assets),
        id: item.id,
        piece: item.piece,
      }));
    };
    if (res) {
      let { buy: buyList = [], sell: sellList = [] } = res;
      buyList = formatList(buyList);
      sellList = formatList(sellList);
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
    // console.log(toJS(currentPair));
  };
}
