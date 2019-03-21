import {
  _,
  formatNumber,
  moment_helper,
  observable,
  computed,
  localSave,
  parseQueryString,
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
import { combineLatest, mergeMap, map, mergeAll, catchError, filter } from 'rxjs/operators';

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
      const hasfillAmountShow = this.setPrecision(item.hasfillAmount, filterPair.assets);
      return {
        ...item,
        createTimeShow: item.createTime ? moment_helper.formatHMS(item.createTime) : '',
        priceShow: showUnit(this.setPrecision(item.price, filterPair.precision)),
        amountShow: this.setPrecision(item.amount, filterPair.assets),
        sumShow: this.setPrecision(item.sum, filterPair.currency),
        averagePriceShow: this.setPrecision(item.sum / hasfillAmountShow, filterPair.currency),
        hasfillAmountShow,
        hasfillAmountPercent: formatNumber.percent(item.hasfillAmount / item.amount, 2),
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
      accountid: item.submitter,
      index: item.index,
      pair: item.pairIndex,
      createTime: item.createdAt,
      amount: item.amount,
      price: item.price,
      hasfillAmount: item.alreadyFilled,
      reserveLast: item.remaining,
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

  getHistoryAccountOrder = async () => {
    const account = this.getCurrentAccount();
    if (account.address) {
      return from(
        this.isApiSwitch(
          getOrdersApi({
            accountId: this.decodeAddressAccountId(account),
          })
        )
      )
        .pipe(
          map((res = {}) => res.items),
          mergeMap((items = []) => {
            return this.isApiSwitch(
              combine(
                items.map((item1 = {}) => {
                  let sum = 0;
                  return from(getFillOrdersApi({ accountId: item1.accountid, index: item1.id })).pipe(
                    map((item2 = []) => {
                      const res = (item2 || []).map((item = {}) => {
                        const filterPair = this.getPair({ id: String(item.pairid) });
                        // const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
                        const amountShow = this.setPrecision(item.amount, filterPair.assets);
                        const totalShow = this.setPrecision(item.price * amountShow, filterPair.currency);
                        sum += item.price * amountShow;
                        return {
                          ...item,
                          time: item.time,
                          priceShow: this.setPrecision(item.price, filterPair.assets),
                          maker_userShow: this.encodeAddressAccountId(item.maker_user),
                          hasfillAmountPercent: formatNumber.percent(item.amount / item1.amount, 2),
                          amountShow,
                          totalShow,
                          filterPair,
                        };
                      });
                      return {
                        ...item1,
                        sum,
                        expand: res,
                      };
                    }),
                    catchError(() => {
                      return of({
                        ...item1,
                        sum,
                        expand: [],
                      });
                    })
                  );
                })
              )
            );
          }),
          map((res = []) => {
            return {
              items: res,
            };
          })
        )
        .subscribe((resApi = { items: [] }) => {
          const dataApi = resApi.items
            .filter((item = {}) => {
              return (
                item.status === 'AllExecuted' ||
                item.status === 'ParitialExecutedAndCanceled' ||
                item.status === 'Canceled'
              );
            })
            .map((item = {}) => {
              return {
                accountid: item.accountid,
                index: item.id,
                pair: item.pairid,
                createTime: item.height,
                amount: item.amount,
                price: item.price,
                hasfillAmount: item.hasfill_amount,
                reserveLast: item.reserve_last,
                direction: item.direction,
                status: item.status,
                expand: item.expand,
                sum: item.sum,
              };
            });

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
        maker_userShow: this.encodeAddressAccountId(item.maker_user),
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
          ).pipe(
            catchError(err => {
              console.log(err, 'getQuotationsApi错误');
              return of({ bids: [], asks: [] });
            })
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
        console.log(dataRpc, dataApi, '-----dataRpc,dataApi');
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
