import { observable, autorun } from 'mobx';
import ModelExtend from './ModelExtend';
import { getTradeRecordApi, getTradeDetailApi } from '../services';
import { from, of, combineLatest as combine } from 'rxjs';
import { combineLatest, mergeMap, map, mergeAll, catchError, filter, tap } from 'rxjs/operators';
import { translation, moment_helper } from '../utils';

export default class TradeRecord extends ModelExtend {
  constructor(...args) {
    super(...args);
  }

  @observable tradeRecordsPageTotal = 1;
  @observable tradeRecords = [];

  getTradeRecordApi = async ({ page }) => {
    const account = this.getCurrentAccount();

    return from(
      getTradeRecordApi({
        accountId: this.decodeAddressAccountId(account),
        page,
      })
    )
      .pipe(
        map((res = {}) => {
          const pageTotal = Math.ceil(res.total / 10);
          this.changeModel('tradeRecordsPageTotal', pageTotal);
          return res.items;
        }),
        mergeMap((items = []) => {
          if (!items.length) return of([]);
          return combine(
            items.map((item = {}) => {
              return from(getTradeDetailApi({ txhash: item.hash })).pipe(
                map((item1 = {}) => {
                  return {
                    ...item,
                    id: `0x${item.hash}`,
                    module: item1.module,
                    call: item1.call,
                    args: item1.args,
                    timeShow: moment_helper.formatHMS(item1.time),
                  };
                }),
                catchError(() => {
                  return of(item);
                })
              );
            })
          );
        }),
        catchError(() => {
          return of([]);
        })
      )
      .subscribe(res => {
        console.log(res, `-----------tradeRecords,页码：${page}`);
        this.changeModel(
          'tradeRecords',
          res.map(item => ({
            ...item,
            ...translation({
              ...item,
              setPrecision: this.setPrecision,
              setDefaultPrecision: this.setDefaultPrecision,
              getPair: this.rootStore.tradeStore.getPair,
              showUnitPrecision: this.rootStore.tradeStore.showUnitPrecision,
            }),
          }))
        );
      });
  };
}
