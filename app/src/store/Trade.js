import { moment_helper, observable, resOk, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import { getOrderPairs, getQuotations, putOrder, getOrders } from '../services';

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
  @observable currentOrderList = [];

  reload = () => {
    this.getQuotations();
    this.getAccountAssets();
    this.getAccountOrder();
  };

  getAccountOrder = async () => {
    const currentPair = this.currentPair;
    const account = this.getCurrentAccount();
    if (account.address) {
      const res = await getOrders(account.address, 0, 100);
      console.log(res.data, '-------');
      if (res && res.data) {
        this.changeModel(
          {
            currentOrderList: res.data.map((item = {}) => {
              return {
                ...item,
                createTime: moment_helper.formatHMS(item.createTime * 1000),
                price: this.setPrecision(item.price, currentPair.precision),
                amount: this.setPrecision(item.amount, currentPair.assets),
                hasfillAmount: this.setPrecision(item.hasfillAmount, currentPair.assets),
                reserveLast: this.setPrecision(
                  item.reserveLast,
                  item.direction === 'Buy' ? currentPair.precision : currentPair.assets
                ),
              };
            }),
          },
          []
        );
      }
    }
  };

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
    // console.log(res);
  };

  getOrderPairs = async () => {
    if (this.orderPairs.length) return Promise.resolve(this.orderPairs);
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

  putOrder = ({ signer, acceleration, pairId, orderType, direction, amount, price }) => {
    const currentPair = this.currentPair;
    price = this.setPrecision(price, currentPair.precision, true);
    amount = this.setPrecision(amount, currentPair.assets, true);
    putOrder(signer, acceleration, pairId, orderType, direction, Number(amount), Number(price), (err, result) => {
      resOk(result) && this.reload();
    });
  };
}
