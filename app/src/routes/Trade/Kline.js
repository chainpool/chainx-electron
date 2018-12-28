import React from 'react';
import moment from 'moment';
import SwitchPair from './Mixin/SwitchPair';
import { _ } from '../../utils';

import * as styles from './Kline.less';
class Kline extends SwitchPair {
  state = {};

  startInit = () => {
    this.startKline();
  };

  startKline = () => {
    const TradingView = window.TradingView;
    const tradeView = document.getElementById('tradeView');
    if (!tradeView) return;
    const widget = new TradingView.widget({
      disabled_features: [
        'volume_force_overlay',
        'hide_left_toolbar_by_default',
        //
        'go_to_date',
        'use_localstorage_for_settings',
        'save_chart_properties_to_local_storage',
        'header_widget',
        //
        'main_series_scale_menu',
        'adaptive_logo',
        'show_logo_on_all_charts',
        'display_market_status',

        'timeframes_toolbar',
        'chart_property_page_background',
      ],
      toolbar_bg: 'transparent',
      symbol: 'Chainx',
      library_path: '/',
      width: '100%',
      height: '100%',
      timezone: 'Asia/Hong_Kong',
      custom_css_url: '/override.css',
      container_id: 'tradeView',
      locale: 'zh',
      overrides: {
        'paneProperties.legendProperties.showLegend': false,
        volumePaneSize: 'medium',
      },
      datafeed: {
        onReady(callback) {
          setTimeout(() => {
            callback({});
          });
        },
        searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {},
        resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
          setTimeout(() => {
            onSymbolResolvedCallback({
              name: '',
              timezone: 'Asia/Shanghai',
              description: '',
              exchange: '', //交易所的略称
              minmov: 1, //最小波动
              pricescale: 100, //价格精度
              pointvalue: 1,
              session: '24x7',
              has_intraday: true, // 是否具有日内（分钟）历史数据
              has_weekly_and_monthly: true,
              has_no_volume: false, //布尔表示商品是否拥有成交量数据
              has_empty_bars: true,
              type: 'stock',
              supported_resolutions: ['1', '5', '15', '30', '60', '240', 'D', '5D', 'W', 'M'], // 分辨率选择器中启用一个分辨率数组
              data_status: 'streaming', //数据状态码。状态显示在图表的右上角。streaming(实时)endofday(已收盘)pulsed(脉冲)
            });
          });
        },
        getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest = true) => {
          const [startTime, endTime] = [String(Math.min(from, to)), String(Math.max(from, to))];

          const getdays = (startTime, endTime, isInclude = false) => {
            const days = Math.ceil(moment.duration(endTime - startTime).asDays());
            const daysArray = [];
            for (let i = 0; i < days - 2; i++) {
              daysArray.push(startTime + (i + 1) * 1 * 24 * 60 * 60 * 1000);
            }
            return daysArray;
          };

          const periods = getdays(startTime * 1000, endTime * 1000);

          let data = periods.map(item => {
            const h = _.random(30, 40);
            const o = _.random(10, 20);
            const c = _.random(10, 30);
            const l = _.random(10, 20);
            const v = _.random(100, 3000);
            return [item / 1000, o, c, h, l, v];
          });

          data = data.map(item => ({
            time: Number(item[0]) * 1000,
            open: Number(item[1]),
            close: Number(item[2]),
            high: Number(item[3]),
            low: Number(item[4]),
            volume: Number(item[5]),
          }));

          onHistoryCallback(data, { noData: true });
        },
        subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {},
        unsubscribeBars(subscriberUID) {},
      },
    });
    widget.onChartReady(() => {
      if (widget) {
        this.widget = widget;
        this.changeState({ loaded: true });
        // this.widget.chart().executeActionById('drawingToolbarAction');
        this.widget.chart().createStudy('Moving Average', true, false, [5, 'close', 0], null, {
          'Plot.color': '#684A95',
        });
        this.widget.chart().createStudy('Moving Average', true, false, [10, 'close', 0], null, {
          'Plot.color': '#5677A4',
        });
        this.widget.chart().createStudy('Moving Average', true, false, [30, 'close', 0], null, {
          'Plot.color': '#417D57',
        });
        this.widget.chart().createStudy('Moving Average', true, false, [60, 'close', 0], null, {
          'Plot.color': '#782C6C',
        });
      }
    });
  };

  render() {
    return (
      <div className={styles.kline}>
        <div id="tradeView" className={styles.tradeView} />
      </div>
    );
  }
}

export default Kline;
