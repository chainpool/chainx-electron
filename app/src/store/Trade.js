import {
  _,
  formatNumber,
  moment_helper,
  observable,
  computed,
  toJS,
  localSave,
  parseQueryString,
  ChainX,
} from '../utils';
import ModelExtend from './ModelExtend';
import {
  getOrderPairs,
  getOrderPairsApi,
  getQuotations,
  getQuotationsApi,
  putOrder,
  cancelOrder,
  getOrders,
  getOrdersApi,
} from '../services';

export default class Trade extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable loading = {
    putOrderBuy: false,
    putOrderSell: false,
    cancelOrder: true,
  };

  @observable name = 'trade';
  @computed get currentPair() {
    const prev = {
      assets: '',
      currency: '',
      precision: '',
      unitPrecision: '',
      assetsPrecision: '',
      lastPriceShow: '',
    };
    return {
      ...prev,
      ...this.getPair({}),
    };
  }
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
      // const reg = new RegExp(`(\.\\d{` + show + `})0*$`);
      // return String(value).replace(reg, '$1');
      const re = new RegExp(`(\\d*\.\\d{` + show + `})\\d*$`);
      const m = String(value).match(re);
      return m ? m[1] : 0;
    };
  };

  getAccountOrder = async () => {
    const account = this.getCurrentAccount();
    if (account.address) {
      const data = await getOrdersApi({
        accountId: ChainX.account.decodeAddress(account.address),
      });
      const reflectData = data.map(item => ({
        createTime: item.create_time,
      }));
      const res = await getOrders(account.address, 0, 100);
      console.log(data, '----------data');
      console.log(res, '------------------res');
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
    const count = 10;
    const data = await getQuotationsApi({
      id: currentPair.id,
      count,
    });
    const reflectData = { buy: [], sell: [], id: '', piece: '' };
    reflectData.buy = data.bids.reduce((sum, next = {}) => {
      sum.push([next.price, next.amount]);
      return sum;
    }, []);
    reflectData.sell = data.asks.reduce((sum, next = {}) => {
      sum.push([next.price, next.amount]);
      return sum;
    }, []);
    reflectData.id = currentPair.id;
    reflectData.piece = count;
    /*await getQuotations(currentPair.id, [0, 10])*/
    const res = reflectData;
    // console.log(res, '-----------盘口列表');
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
    const update = async () => {
      const data = await getOrderPairsApi();
      const reflectData = data
        .map((item = {}) => ({
          assets: item.currency_pair[0],
          currency: item.currency_pair[1],
          id: item.pairid,
          precision: item.precision,
          unitPrecision: item.unit_precision,
          online: item.online,
          lastPrice: item.price.last_price,
        }))
        .sort((a, b) => a.id - b.id);
      /*await getOrderPairs()*/
      let res = reflectData;
      res = res.map((item = {}) => {
        const precision = item.precision;
        const priceShow = price =>
          this.showUnitPrecision(precision, item.unitPrecision)(this.setPrecision(price, precision));

        return {
          ...item,
          precision,
          lastPriceShow: priceShow(item.lastPrice),
          maxLastPriceShow: priceShow(item.lastPrice * 1.1),
          minLastPriceShow: priceShow(item.lastPrice * 0.9),
        };
      });
      this.changeModel('orderPairs', res, []);
      localSave.set('orderPair', res || []);
      return res;
    };

    const pairs = this.orderPairs.length ? this.orderPairs : localSave.get('orderPair');
    if (pairs && pairs.length) {
      update();
      this.changeModel('orderPairs', pairs, []);
      return Promise.resolve(pairs);
    } else {
      return await update();
    }
  };

  getPair = ({ id }) => {
    const history = this.getHistory();
    const {
      location: { search },
    } = history;
    id = id || parseQueryString(search).id;
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

  putOrder = ({ pairId, orderType, direction, amount, price, successToast, failToast }) => {
    const currentPair = this.currentPair;
    price = this.setPrecision(price, currentPair.precision, true);
    amount = this.setPrecision(amount, currentPair.assets, true);
    const extrinsic = putOrder(pairId, orderType, direction, Number(amount), Number(price));
    return {
      extrinsic,
      loading: status => this.changeModel(`loading[putOrder${direction}]`, status),
      success: () => this.reload(),
      successToast,
      failToast,
    };
  };

  cancelOrder = ({ pairId, index }) => {
    const extrinsic = cancelOrder(pairId, index);
    return {
      extrinsic,
      beforeSend: () => {
        this.changeModel(
          'currentOrderList',
          this.currentOrderList.map((item = {}) => {
            if (item.index !== index) return item;
            else {
              return {
                ...item,
                loading: true,
              };
            }
          })
        );
      },
      loading: status => this.changeModel(`loading.cancelOrder`, status),
      success: () => this.reload(),
    };
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
