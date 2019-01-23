import { moment_helper, observable, resOk, toJS } from '../utils';
import ModelExtend from './ModelExtend';
import { getOrderPairs, getQuotations, putOrder, cancelOrder, getOrders } from '../services';

export default class Trade extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'trade';
  @observable currentPair = {
    assets: '',
    currency: '',
    precision: '',
    assetsPrecision: '',
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
      // console.log(res.data, '-------');
      if (res && res.data) {
        this.changeModel(
          {
            currentOrderList: res.data.map((item = {}) => {
              return {
                ...item,
                createTimeShow: moment_helper.formatHMS(item.createTime * 1000),
                priceShow: this.setPrecision(item.price, currentPair.precision),
                amountShow: this.setPrecision(item.amount, currentPair.assets),
                hasfillAmountShow: this.setPrecision(item.hasfillAmount, currentPair.assets),
                reserveLastShow: this.setPrecision(
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
    const res = await getQuotations(currentPair.id, [0, 10]);
    console.log(res, '-----------盘口列表');
    const formatList = list => {
      return list.map((item = []) => ({
        priceShow: this.setPrecision(item[0], currentPair.precision),
        amountShow: this.setPrecision(item[1], currentPair.assets),
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
  };

  getOrderPairs = async () => {
    if (this.orderPairs.length) return Promise.resolve(this.orderPairs);
    let res = await getOrderPairs();
    const currentPair = this.currentPair;
    res = res.map(item => ({
      ...item,
      lastPriceShow: this.setPrecision(item.lastPrice, currentPair.precision),
    }));
    this.changeModel('orderPairs', res, []);
    return res;
  };

  switchPair = ({ id }) => {
    let currentPair = {};
    const findOne = this.orderPairs.filter((item = {}) => item.id === +id)[0];
    if (findOne) {
      currentPair = findOne;
    } else {
      currentPair = this.orderPairs[0];
    }
    this.changeModel(
      'currentPair',
      {
        ...currentPair,
        assetsPrecision: this.getPrecision(currentPair.assets),
      },
      {}
    );
  };

  putOrder = ({ signer, acceleration, pairId, orderType, direction, amount, price }) => {
    const currentPair = this.currentPair;
    price = this.setPrecision(price, currentPair.precision, true);
    amount = this.setPrecision(amount, currentPair.assets, true);
    return new Promise(resolve => {
      putOrder(signer, acceleration, pairId, orderType, direction, Number(amount), Number(price), (err, result) => {
        if (resOk(result)) {
          this.reload();
          resolve(result);
        }
      });
    });
  };

  cancelOrder = ({ signer, acceleration, pairId, index }) => {
    cancelOrder(signer, acceleration, pairId, index, (err, result) => {
      resOk(result) && this.reload();
    });
  };
}
