import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import { _, toJS } from '../../utils';

import * as styles from './Kline.less';

const intervals = [
  { name: '1min', value: '1' },
  { name: '5min', value: '5' },
  { name: '15min', value: '15' },
  { name: '30min', value: '30' },
  { name: '1hour', value: '60' },
  { name: '4hour', value: '240' },
  { name: '1day', value: 'D', default: true },
  { name: '5day', value: '5D' },
  { name: '1week', value: 'W' },
  { name: '1mon', value: 'M' },
];
class Kline extends SwitchPair {
  constructor(props) {
    super(props);
    this.state = {
      interval: this.getDefaultInterval(),
    };
  }

  startInit = () => {
    if (this.widget) {
      this.widget.chart().setSymbol(this.getId());
    } else {
      this.startKline();
    }
  };

  getId = () => {
    const {
      model: { getQueryParams },
    } = this.props;
    const { id } = getQueryParams();
    return id;
  };

  getInterval = resolution => {
    let interval;
    const dayMinutes = 24 * 60 * 60;
    switch (resolution) {
      case '1':
      case '5':
      case '15':
      case '30':
      case '60':
      case '240':
        {
          interval = 60 * Number(resolution);
        }
        break;
      case 'D':
        {
          interval = 1 * dayMinutes;
        }
        break;
      case '5D':
        {
          interval = 5 * dayMinutes;
        }
        break;
      case 'W':
        {
          interval = 6 * dayMinutes;
        }
        break;
      case 'M':
        {
          interval = 30 * dayMinutes;
        }
        break;
    }
    return interval;
  };

  getDefaultInterval = () => {
    const findOne = intervals.filter(item => item.default)[0];
    return findOne.value;
  };

  startKline = () => {
    const {
      model: { dispatch },
    } = this.props;
    const TradingView = window.TradingView;
    const tradeView = document.getElementById('tradeView');
    if (!tradeView) return;
    const widget = new TradingView.widget({
      enabled_features: ['keep_left_toolbar_visible_on_small_screens', 'hide_left_toolbar_by_default'],
      disabled_features: [
        'volume_force_overlay',
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
      symbol: this.getId(),
      library_path: '/',
      width: '100%',
      height: 344,
      autosize: false,
      timezone: 'Asia/Hong_Kong',
      custom_css_url: '/override.css',
      container_id: 'tradeView',
      locale: 'zh',
      interval: this.getDefaultInterval(),
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
        resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
          setTimeout(() => {
            onSymbolResolvedCallback({
              name: 'chainX',
              ticker: symbolName,
              timezone: 'Asia/Shanghai',
              description: 'chainX',
              exchange: 'chainX', //交易所的略称
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
          const interval = this.getInterval(resolution);
          dispatch({
            type: 'getKline',
            payload: {
              interval: interval,
              startTime: startTime * 1000,
              endTime: endTime * 1000,
            },
          }).then((res = []) => {
            const data = res.map((item = {}) => ({
              ...item,
              volume: _.random(100, 3000),
            }));
            onHistoryCallback(data, { noData: true });
          });
        },
        subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {},
        unsubscribeBars(subscriberUID) {},
      },
    });
    widget.onChartReady(() => {
      if (widget) {
        this.widget = widget;
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
    const { interval } = this.state;
    const tools = [...intervals];
    return (
      <div className={styles.kline}>
        <div className={styles.tools}>
          <ul>
            {tools.map((item, index) => (
              <li
                className={interval === item.value ? styles.active : null}
                key={index}
                onClick={() => {
                  if (!this.widget) return;
                  this.setState({
                    interval: item.value,
                  });
                  this.widget.chart().setResolution(item.value, () => {});
                }}>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <div id="tradeView" className={styles.tradeView} />
      </div>
    );
  }
}

export default Kline;
