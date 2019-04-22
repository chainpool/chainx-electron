import { _, formatNumber, moment_helper, observable, computed, localSave, parseQueryString, moment } from '../utils';
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
  getBlockTime,
} from '../services';
import { from, of, combineLatest as combine } from 'rxjs';
import { combineLatest, mergeMap, map, mergeAll, catchError, filter, tap, startWith } from 'rxjs/operators';

export default class Trade extends ModelExtend {
  @observable loading = {
    putOrderBuy: false,
    putOrderSell: false,
    cancelOrder: true,
    getHistoryAccountOrder: false,
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
  @observable _currentOrderList = [];
  @observable historyAccountPageTotal = 1;
  @observable historyAccountCurrentPage = 1;
  @observable historyOrderList = [];
  @observable showCurrent = false;

  @computed get currentOrderList() {
    const currentPair = this.currentPair;
    if (this.showCurrent) {
      return this._currentOrderList.filter(item => item.pair === currentPair.id);
    }
    return this._currentOrderList;
  }

  reload = () => {
    clearTimeout(this.interval);
    this.interval = setTimeout(() => {
      this.getOrderPairs();
      this.getQuotations();
      this.getAccountAssets();
      this.getCurrentAccountOrder();
      this.getHistoryAccountOrder();
      this.getLatestOrder();
    }, 300);
  };

  getAccountAssets = () => {
    return this.rootStore.assetStore.getAccountAssets();
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
    let res = await getKlineApi({
      pairid: currentPair.id,
      type: interval,
      start_date: startTime,
      end_date: endTime,
    });
    if (res && res.length) {
      const filterPair = currentPair;
      const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
      res = res.map(item => ({
        ...item,
        closeShow: showUnit(this.setPrecision(item.close, filterPair.precision)),
        highShow: showUnit(this.setPrecision(item.high, filterPair.precision)),
        lowShow: showUnit(this.setPrecision(item.low, filterPair.precision)),
        openShow: showUnit(this.setPrecision(item.open, filterPair.precision)),
        volumeShow: this.setPrecision(item.volume, filterPair.assets),
      }));
      return res;
    }
  };

  getLatestOrder = async () => {
    const currentPair = this.currentPair;
    let res = await getLatestOrderApi({ pairId: currentPair.id, count: 100 });
    // console.log(res, '最新成交');
    res = (res || []).map((item = {}) => {
      const filterPair = currentPair;
      const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
      return {
        ...item,
        priceShow: showUnit(this.setPrecision(item.price, filterPair.precision)),
        amountShow: this.setPrecision(item.amount, filterPair.assets),
        timeShow: moment_helper.formatHMS(item['block.time'], 'HH:mm:ss'),
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
        averagePriceShow: this.setPrecision(item.fill_aver, filterPair.currency),
        // averagePriceShow: this.setPrecision(item.sum / hasfillAmountShow, filterPair.currency),
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
    return from(getOrders(account.address, 0, 100))
      .pipe(
        map(res => {
          return res.data;
        }),
        mergeMap((items = []) => {
          if (!items.length) return of(items);
          return combine(
            items.map(item => {
              return from(getBlockTime({ height: item.createdAt })).pipe(
                map((res = {}) => {
                  return {
                    ...item,
                    time: res.time,
                  };
                }),
                catchError(() => {
                  return of({
                    ...item,
                    time: null,
                    blockHeight: item.createdAt,
                  });
                })
              );
            })
          );
        })
      )
      .subscribe((res = []) => {
        const data = res.map((item = {}) => {
          return {
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
            timeShow: item.blockHeight ? item.blockHeight : moment_helper.formatHMS(item.time, 'MM-DD HH:mm:ss'),
          };
        });
        const _currentOrderList = this.processOrderData(data);

        this.changeModel(
          {
            _currentOrderList,
          },
          []
        );
      });
  };

  getHistoryAccountOrder = async () => {
    const currentAccount = this.getCurrentAccount();
    const currentPair = this.currentPair;
    if (currentAccount.address) {
      this.changeModel('loading.getHistoryAccountOrder', true);
      return from(
        this.isApiSwitch(
          getOrdersApi({
            accountId: this.decodeAddressAccountId(currentAccount),
            page: this.historyAccountCurrentPage,
            status: '3',
            ...(this.showCurrent ? { pairid: currentPair.id } : {}),
          })
        )
      )
        .pipe(
          map((res = {}) => {
            const pageTotal = Math.ceil(res.total / 10);
            this.changeModel('historyAccountPageTotal', pageTotal);
            return res.items;
          }),
          tap(res => console.log(res, '------------历史成交')),
          mergeMap((items = []) => {
            if (!items.length) return of(items);
            return this.isApiSwitch(
              combine(
                items.map((item1 = {}) => {
                  let sum = 0;
                  if (!item1.fill_index || !item1.fill_index.length) {
                    return of(item1);
                  }
                  return from(getFillOrdersApi({ id: (item1.fill_index || []).join(','), pair_id: item1.pairid })).pipe(
                    map((item2 = []) => {
                      const res = (item2 || []).map((item = {}) => {
                        const filterPair = this.getPair({ id: String(item.pairid) });
                        // const showUnit = this.showUnitPrecision(filterPair.precision, filterPair.unitPrecision);
                        const amountShow = this.setPrecision(item.amount, filterPair.assets);
                        const totalShow = this.setPrecision(item.price * amountShow, filterPair.currency);
                        sum += item.price * amountShow;
                        const maker_userShow = this.encodeAddressAccountId(item.maker_user);
                        const taker_userShow = this.encodeAddressAccountId(item.taker_user);
                        return {
                          ...item,
                          time: moment.formatHMS(item['block.time'], 'MM-DD HH:mm:ss'),
                          priceShow: this.setPrecision(item.price, filterPair.currency),
                          other_userShow:
                            [maker_userShow, taker_userShow].filter(item => item !== currentAccount.address)[0] ||
                            maker_userShow,
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
                fill_aver: item.fill_aver,
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
                timeShow: moment_helper.formatHMS(item['block.time'], 'MM-DD HH:mm:ss'),
              };
            });

          const historyOrderList = this.processOrderData(dataApi);

          this.changeModel({
            'loading.getHistoryAccountOrder': false,
            historyOrderList,
          });
        });
    }
  };

  getQuotations = async ({ hasStarWith } = {}) => {
    const currentPair = this.currentPair;
    const count = 20;
    return from(getQuotations(currentPair.id, 10))
      .pipe(
        hasStarWith ? startWith({ buy: [], sell: [] }) : tap(res => res),
        combineLatest(
          from(
            this.isApiSwitch(
              getQuotationsApi({
                pairId: currentPair.id,
                count: count,
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
        console.log(dataRpc, dataApi, '盘口-----dataRpc,dataApi');
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
          maxLastPriceShow: item.maximumBid > 0 ? priceShow(item.maximumBid) : Infinity,
          minLastPriceShow: item.minimumOffer > 0 ? priceShow(item.minimumOffer) : -Infinity,
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

  putOrder = ({ pairId, orderType, direction, amount, price }) => {
    const currentPair = this.currentPair;
    price = this.setPrecision(price, currentPair.precision, true);
    amount = this.setPrecision(amount, currentPair.assets, true);
    const extrinsic = putOrder(pairId, orderType, direction, Number(amount), Number(price));
    return {
      extrinsic,
      loading: status => this.changeModel(`loading[putOrder${direction}]`, status),
      success: () => this.reload(),
    };
  };

  cancelOrder = ({ pairId, index }) => {
    const extrinsic = cancelOrder(pairId, index);
    return {
      extrinsic,
      beforeSend: () => {
        this.changeModel(
          '_currentOrderList',
          this._currentOrderList.map((item = {}) => {
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
      _currentOrderList: [],
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

  changeShowCurrent = () => {
    this.changeModel({
      showCurrent: !this.showCurrent,
    });
  };
}
