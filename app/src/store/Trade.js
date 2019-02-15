import { _, formatNumber, moment_helper, observable, resOk, resFail, toJS } from '../utils';
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
    unitPrecision: '',
    assetsPrecision: '',
  };
  @observable orderPairs = [];
  @observable buyList = [];
  @observable sellList = [];
  @observable currentOrderList = [];

  reload = () => {
    this.getOrderPairs();
    this.getQuotations();
    this.getAccountAssets();
    this.getAccountOrder();
  };

  showUnitPrecision = (precision, unitPrecision) => {
    return value => {
      const show = precision - unitPrecision;
      const reg = new RegExp(`(\.\\d{` + show + `})0*$`);
      return String(value).replace(reg, '$1');
    };
  };

  getAccountOrder = async () => {
    const account = this.getCurrentAccount();
    if (account.address) {
      const res = await getOrders(account.address, 0, 100);
      console.log(res.data, '-------委托列表 ');
      if (res && res.data) {
        this.changeModel(
          {
            currentOrderList: res.data.map((item = {}) => {
              const filterPair = this.getPair({ id: item.pair });

              const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
              return {
                ...item,
                createTimeShow: moment_helper.formatHMS(item.createTime * 1000),
                priceShow: showUnit(this.setPrecision(item.price, filterPair.precision)),
                amountShow: this.setPrecision(item.amount, filterPair.assets),
                hasfillAmountShow: this.setPrecision(item.hasfillAmount, filterPair.assets),
                hasfillAmountPercent: formatNumber.percent(item.hasfillAmount / item.amount, 1),
                reserveLastShow: this.setPrecision(
                  item.reserveLast,
                  item.direction === 'Buy' ? filterPair.currency : filterPair.assets
                ),
                filterPair,
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
    // res.buy = [[100, 100000], [101, 100001], [102, 100002], [103, 100003], [104, 100004]];
    // res.sell = [[105, 100005], [106, 100006], [107, 100007], [108, 100008], [109, 100009]];
    res.buy = _.orderBy(res.buy, (item = []) => item[0], ['desc']);
    res.sell = _.orderBy(res.sell, (item = []) => item[0], ['desc']);
    const formatList = (list, action) => {
      const showUnit = this.showUnitPrecision(currentPair.precision, currentPair.unitPrecision);
      return list.map((item = [], index) => {
        let totalAmount = 0;
        if (action === 'sell') {
          totalAmount = list.slice(index, list.length).reduce((sum, item = []) => sum + item[1], 0);
        } else {
          totalAmount = list.slice(0, index + 1).reduce((sum, item = []) => sum + item[1], 0);
        }
        return {
          priceShow: showUnit(this.setPrecision(item[0], currentPair.precision)),
          amountShow: this.setPrecision(item[1], currentPair.assets),
          id: item.id,
          piece: item.piece,
          totalAmountShow: this.setPrecision(totalAmount, currentPair.assets),
        };
      });
    };
    if (res) {
      let { buy: buyList = [], sell: sellList = [] } = res;
      buyList = formatList(buyList, 'buy');
      sellList = formatList(sellList, 'sell');
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
    // if (this.orderPairs.length) return Promise.resolve(this.orderPairs);
    let res = await getOrderPairs();
    res = res.map((item = {}) => {
      const precision = item.precision;
      return {
        ...item,
        precision,
        lastPriceShow: this.showUnitPrecision(precision, item.unitPrecision)(
          this.setPrecision(item.lastPrice, precision)
        ),
      };
    });
    this.changeModel('orderPairs', res, []);
    console.log(res, '------pair交易对列表');
    return res;
  };

  getPair = ({ id }) => {
    let currentPair = {};
    const findOne = this.orderPairs.filter((item = {}) => item.id === +id)[0];
    if (findOne) {
      currentPair = findOne;
    } else {
      currentPair = this.orderPairs[0];
    }
    return {
      ...currentPair,
      assetsPrecision: this.getPrecision(currentPair.assets),
    };
  };

  switchPair = ({ id }) => {
    this.changeModel('currentPair', this.getPair({ id }), {});
  };

  putOrder = ({ signer, acceleration, pairId, orderType, direction, amount, price }) => {
    const currentPair = this.currentPair;
    price = this.setPrecision(price, currentPair.precision, true);
    amount = this.setPrecision(amount, currentPair.assets, true);
    return new Promise((resolve, reject) => {
      putOrder(signer, acceleration, pairId, orderType, direction, Number(amount), Number(price), (err, result) => {
        if (err) {
          return reject(err);
        }
        if (resOk(result)) {
          this.reload();
          resolve(result);
        }
        if (resFail(result)) {
          return reject(err);
        }
      });
    });
  };

  cancelOrder = ({ signer, acceleration, pairId, index }) => {
    cancelOrder(signer, acceleration, pairId, index, (err, result) => {
      resOk(result) && this.reload();
    });
  };

  clearAll = () => {
    this.changeModel({
      currentOrderList: [],
    });
    this.rootStore.assetStore.changeModel({
      accountAssets: [],
    });
  };
}
