import {
  _,
  formatNumber,
  moment_helper,
  observable,
  computed,
  localSave,
  parseQueryString,
  ChainX,
  toJS,
  generateKlineData,
} from '../utils';
import ModelExtend from './ModelExtend';
import {
  getOrderPairs,
  getQuotationsApi,
  getQuotations,
  putOrder,
  cancelOrder,
  getOrders,
  getOrdersApi,
  getLatestOrderApi,
  getFillOrdersApi,
  getKlineApi,
} from '../services';
import { from, of, combineLatest as combine } from 'rxjs';
import { combineLatest, mergeMap, map, mergeAll } from 'rxjs/operators';

export default class Trade extends ModelExtend {
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
      assetsPrecision: '', //原始精度
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
  @observable latestOrderList = [];
  @observable entrustOrderList = [];
  @observable currentOrderList = [];
  @observable historyOrderList = [];

  reload = () => {
    clearTimeout(this.interval);
    this.interval = setTimeout(() => {
      this.getOrderPairs();
      this.getQuotations();
      this.getAccountAssets();
      this.getAccountOrder();
      this.getLatestOrder();
    }, 300);
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

  getKline = async ({ interval, startTime, endTime }) => {
    const currentPair = this.currentPair;
    const res = await getKlineApi({
      pairid: currentPair.id,
      type: interval,
      start_date: startTime,
      end_date: endTime,
    });
    return res;
    //return generateKlineData(startTime, endTime);
  };

  getLatestOrder = async () => {
    const currentPair = this.currentPair;
    let res = await getLatestOrderApi({ pairId: currentPair.id });
    // console.log(res, '最新成交');
    res = (res || []).map((item = {}) => {
      const filterPair = currentPair;
      const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
      return {
        ...item,
        time: moment_helper.format(item['block.time'], 'HH:mm:ss'),
        priceShow: showUnit(this.setPrecision(item.price, filterPair.precision)),
        amountShow: this.setPrecision(item.amount, filterPair.assets),
      };
    });
    this.changeModel('latestOrderList', res);
  };

  processOrderData = data => {
    return data.map((item = {}) => {
      const filterPair = this.getPair({ id: String(item.pair) });
      const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
      return {
        ...item,
        createTimeShow: item.createTime ? moment_helper.formatHMS(item.createTime) : '',
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
    });
  };

  getCurrentAccountOrder = async () => {
    const account = this.getCurrentAccount();
    const res = await getOrders(account.address, 0, 100);
    const data = (res.data || []).map((item = {}) => ({
      accountid: item.accountid,
      index: item.id,
      pair: item.pairid,
      createTime: item['block.time'],
      amount: item.amount,
      price: item.price,
      hasfillAmount: item.hasfill_amount,
      reserveLast: item.reserve_last,
      direction: item.direction,
      status: item.status,
      expand: item.expand,
    }));
    const currentOrderList = this.processOrderData(data);

    this.changeModel(
      {
        currentOrderList,
      },
      []
    );
  };

  getAccountOrder = async () => {
    const account = this.getCurrentAccount();
    if (account.address) {
      return from(
        this.isApiSwitch(
          getOrdersApi({
            accountId: ChainX.account.decodeAddress(account.address).replace(/^0x/, ''),
          })
        )
      )
        .pipe(
          map(res => res.items),
          mergeMap(items => {
            return combine(
              items.map((item1 = {}) => {
                return from(getFillOrdersApi({ accountId: item1.accountid, index: item1.id })).pipe(
                  map((item2 = []) => {
                    const res = (item2 || []).map((item = {}) => {
                      const filterPair = this.getPair({ id: String(item.pairid) });

                      const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
                      const amountShow = this.setPrecision(item.amount, filterPair.assets);
                      return {
                        ...item,
                        time: moment_helper.formatHMS(item['block.time']),
                        priceShow: showUnit(this.setPrecision(item.price, filterPair.precision)),
                        maker_userShow: ChainX.account.encodeAddress(`0x${item.maker_user}`),
                        amountShow,
                        totalShow: this.setPrecision(item.price * amountShow, filterPair.currency),
                        filterPair,
                      };
                    });
                    return {
                      ...item1,
                      expand: res,
                    };
                  })
                );
              })
            );
          }),
          map(res => {
            return {
              items: res,
            };
          })
        )
        .subscribe((resApi = { items: [] }) => {
          const dataApi = resApi.items.map((item = {}) => ({
            accountid: item.accountid,
            index: item.id,
            pair: item.pairid,
            createTime: item['block.time'],
            amount: item.amount,
            price: item.price,
            hasfillAmount: item.hasfill_amount,
            reserveLast: item.reserve_last,
            direction: item.direction,
            status: item.status,
            expand: item.expand,
          }));

          const historyOrderList = this.processOrderData(dataApi);

          this.changeModel(
            {
              historyOrderList,
            },
            []
          );
        });
    }
  };

  getFillAccountOrder = async ({ accountId, index }) => {
    let res = await getFillOrdersApi({ accountId, index });
    if (res && res.length) {
      console.log(res, '--------------res');
    }
    res = (res || []).map((item = {}) => {
      const filterPair = this.getPair({ id: String(item.pairid) });

      const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
      const amountShow = this.setPrecision(item.amount, filterPair.assets);
      return {
        ...item,
        time: moment_helper.formatHMS(item['block.time']),
        priceShow: showUnit(this.setPrecision(item.price, filterPair.precision)),
        maker_userShow: ChainX.account.encodeAddress(`0x${item.maker_user}`),
        amountShow,
        totalShow: this.setPrecision(item.price * amountShow, filterPair.currency),
        filterPair,
      };
    });
    const list = this.historyOrderList.map(item => {
      if (item.index === index) {
        return {
          ...item,
          expand: res,
        };
      }
      return item;
    });
    this.changeModel('historyOrderList', list);
    return res;
  };

  getQuotations = async () => {
    const currentPair = this.currentPair;
    const count = 10;
    return from(getQuotations(currentPair.id, [0, count]))
      .pipe(
        combineLatest(
          from(
            this.isApiSwitch(
              getQuotationsApi({
                pairId: currentPair.id,
                count,
              })
            )
          )
        )
      )
      .subscribe(([resRpc = { buy: [], sell: [] }, resApi = { bids: [], asks: [] }]) => {
        const [dataRpc, dataApi, common] = [
          {},
          {},
          {
            id: currentPair.id,
            piece: count,
          },
        ];

        dataRpc.buy = resRpc.buy.map((item = []) => ({ price: item[0], amount: item[1], direction: 'Buy', ...common }));
        dataRpc.sell = resRpc.sell.map((item = []) => ({
          price: item[0],
          amount: item[1],
          direction: 'Sell',
          ...common,
        }));

        dataApi.buy = resApi.bids.reduce((sum, next = {}) => {
          sum.push({ price: next.price, amount: next.amount, direction: next.direction, ...common });
          return sum;
        }, []);
        dataApi.sell = resApi.asks.reduce((sum, next = {}) => {
          sum.push({ price: next.price, amount: next.amount, direction: next.direction, ...common });
          return sum;
        }, []);
        let [buy, sell] = [[], []];
        if ((dataApi.buy && dataApi.buy.length) || (dataApi.sell && dataApi.sell.length)) {
          buy = dataApi.buy;
          sell = dataApi.sell;
        } else {
          buy = dataRpc.buy;
          sell = dataRpc.sell;
        }
        // buy = _.unionBy(dataRpc.buy.concat(dataApi.buy), 'price');
        // sell = _.unionBy(dataRpc.sell.concat(dataApi.sell), 'price');
        const res = {
          buy,
          sell,
        };

        res.buy = _.orderBy(res.buy, (item = []) => item.price, ['desc']);
        res.sell = _.orderBy(res.sell, (item = []) => item.price, ['desc']);
        //console.log(res, '-----------盘口列表');
        const formatList = (list, action) => {
          const filterPair = currentPair;
          const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
          return list.map((item = [], index) => {
            let totalAmount = 0;
            if (action === 'sell') {
              totalAmount = list.slice(index, list.length).reduce((sum, item = []) => sum + item.amount, 0);
            } else {
              totalAmount = list.slice(0, index + 1).reduce((sum, item = []) => sum + item.amount, 0);
            }
            return {
              priceShow: showUnit(this.setPrecision(item.price, filterPair.precision)),
              amountShow: this.setPrecision(item.amount, filterPair.assets),
              id: item.id,
              piece: item.piece,
              totalAmountShow: this.setPrecision(totalAmount, filterPair.assets),
              direction: item.direction,
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
      });
  };

  getOrderPairs = async () => {
    const update = async () => {
      /*await getOrderPairs()*/
      let res = await getOrderPairs();
      res = (res || []).sort((a, b) => a.id - b.id);
      res = res.map((item = {}) => {
        const precision = item.precision;
        const priceShow = price =>
          this.showUnitPrecision(precision, item.unitPrecision)(this.setPrecision(price, precision));

        return {
          ...item,
          precision,
          lastPriceShow: priceShow(item.lastPrice),
          maxLastPriceShow: item.sellOne > 0 ? priceShow(item.sellOne * 1.1) : Infinity,
          minLastPriceShow: item.buyOne > 0 ? priceShow(item.buyOne * 0.9) : -Infinity,
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
    // console.log(toJS(this.orderPairs), toJS(findOne), id, typeof +id, '----');
    if (findOne) {
      currentPair = findOne;
    } else if (this.orderPairs[0]) {
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
      success: this.reload,
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

  isApiSwitch = (promise, defaultValue = of(undefined)) => {
    if (true || this.rootStore.configureStore.autoSwitchBestApi) {
      return promise;
    } else {
      return defaultValue;
    }
  };
}
