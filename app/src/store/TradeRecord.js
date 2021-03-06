import { observable } from 'mobx';
import ModelExtend from './ModelExtend';
import { getTradeDetailApi, getTradeRecordApi } from '../services';
import { combineLatest as combine, from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { moment_helper, translation } from '../utils';

export default class TradeRecord extends ModelExtend {
  @observable tradeRecordsPageTotal = 1;
  @observable tradeRecords = [];
  @observable loading = {
    getTradeRecordApi: '',
  };

  getTradeRecordApi = async ({ page }) => {
    const account = this.getCurrentAccount();
    this.changeModel('loading.getTradeRecordApi', true);
    return from(
      this.isApiUseAble(
        getTradeRecordApi({
          accountId: this.decodeAddressAccountId(account),
          page,
        }),
        []
      )
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
        this.changeModel({
          'loading.getTradeRecordApi': false,
          tradeRecords: res.map(item => ({
            ...item,
            ...translation({
              ...item,
              options: item,
              currentAccount: account,
              setPrecision: this.setPrecision,
              setDefaultPrecision: this.setDefaultPrecision,
              getPair: this.rootStore.tradeStore.getPair,
              showUnitPrecision: this.rootStore.tradeStore.showUnitPrecision,
              originIntentions: this.rootStore.electionStore.originIntentions,
              nativeAssetName: this.rootStore.globalStore.nativeAssetName,
              encodeAddressAccountId: this.encodeAddressAccountId,
              accounts: this.rootStore.accountStore.accounts,
            }),
          })),
        });
      });
  };
}
