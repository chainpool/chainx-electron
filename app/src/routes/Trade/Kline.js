import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import { _, formatNumber, moment_helper, SetFullScreen } from '../../utils';
import { chartProperties, fullScreen, insertIndicator } from '../../resource/index';

import * as styles from './Kline.less';
import { FormattedMessage } from '../../components';

const intervals = [
  { name: '1min', value: '1' },
  { name: '5min', value: '5' },
  { name: '30min', value: '30' },
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

  componentUpdate = prevProps => {
    const { language: languagePrev } = prevProps;
    const { language } = this.props;
    if (languagePrev !== language && this.widget) {
      try {
        this.widget.setLanguage(language);
      } catch {}
    }
  };

  startInit = () => {
    if (this.widget) {
      try {
        this.widget.chart().setSymbol(this.getSymbol());
      } catch {}
    } else {
      this.startKline();
    }
  };

  changeTheme = () => {
    if (_.get(window, 'frames[0].document')) {
      const iframe = window.frames[0].document.getElementsByTagName('html')[0];
      /*theme-dark*/
      iframe.setAttribute('class', '');
    }
  };

  getSymbol = () => {
    const {
      model: {
        currentPair: { assets, currency },
      },
    } = this.props;

    return String(`${currency}/${assets}`);
  };

  getInterval = resolution => {
    let interval;
    const dayMinutes = 24 * 60 * 60;
    switch (resolution) {
      case '1':
      case '5':
      case '30':
        interval = 60 * Number(resolution);
        break;
      case 'D':
        interval = 1 * dayMinutes;
        break;
      case '5D':
        interval = 5 * dayMinutes;
        break;
      case 'W':
        interval = 7 * dayMinutes;
        break;
      case 'M':
        interval = 30 * dayMinutes;
        break;

      // no default
    }
    return interval;
  };

  getDefaultInterval = () => {
    const findOne = intervals.filter(item => item.default)[0];
    return findOne.value;
  };

  startKline = () => {
    const {
      model: { dispatch, orderPairs },
      language,
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
      symbol: this.getSymbol(),
      library_path: `file://${window.__dirname}/app/build/`,
      width: '100%',
      height: 344,
      autosize: false,
      timezone: 'Asia/Hong_Kong',
      custom_css_url: './override.css',
      container_id: 'tradeView',
      locale: language,
      interval: this.getDefaultInterval(),
      overrides: {
        'paneProperties.legendProperties.showLegend': false,
        volumePaneSize: 'small',
      },
      datafeed: {
        onReady(callback) {
          setTimeout(() => {
            callback({});
          });
        },
        resolveSymbol(symbolName, onSymbolResolvedCallback) {
          const filterOne = orderPairs.filter((item = {}) => `${item.currency}/${item.assets}` === symbolName)[0];
          const pricescale = filterOne.precision - filterOne.unitPrecision;
          setTimeout(() => {
            onSymbolResolvedCallback({
              name: symbolName,
              ticker: symbolName,
              timezone: 'Asia/Shanghai',
              minmov: 1, //最小波动
              pricescale: Number(formatNumber.toPrecision(1, pricescale, true)), //价格精度
              pointvalue: 1,
              session: '24x7',
              has_intraday: true, // 是否具有日内（分钟）历史数据
              has_weekly_and_monthly: true,
              has_no_volume: false, //布尔表示商品是否拥有成交量数据
              has_empty_bars: true,
              type: 'bitcoin',
              supported_resolutions: ['1', '5', '30', 'D', '5D', 'W', 'M'], // 分辨率选择器中启用一个分辨率数组
              data_status: 'streaming', //数据状态码。状态显示在图表的右上角。streaming(实时)endofday(已收盘)pulsed(脉冲)
            });
          });
        },
        getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest = true) => {
          const [startTime, endTime] = [String(Math.min(from, to)), String(Math.max(from, to))];
          console.log(moment_helper.formatHMS(startTime * 1000), moment_helper.formatHMS(endTime * 1000));
          const interval = this.getInterval(resolution);
          dispatch({
            type: 'getKline',
            payload: {
              interval: interval,
              startTime: startTime,
              endTime: endTime,
            },
          }).then((res = []) => {
            const data = res.map((item = {}) => ({
              close: item.closeShow,
              open: item.openShow,
              high: item.highShow,
              low: item.lowShow,
              volume: Number(item.volumeShow),
              time: item.time * 1000,
            }));
            try {
              onHistoryCallback(data, { noData: true });
            } catch {}
          });
        },
        subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {},
        unsubscribeBars(subscriberUID) {},
      },
    });
    widget.onChartReady(() => {
      if (widget) {
        try {
          this.changeTheme();
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
        } catch {}
      }
    });
  };

  render() {
    const { interval } = this.state;
    const tools = [
      {
        name: insertIndicator,
        onClick: () => {
          this.widget && this.widget.chart().executeActionById('insertIndicator');
        },
      },
      {
        name: <FormattedMessage id={'TimeSharing'} />,
        value: 'realTime',
      },
      ...intervals,
      {
        name: chartProperties,
        onClick: () => {
          this.widget.chart().executeActionById('chartProperties');
        },
      },
      {
        name: fullScreen,
        onClick: () => {
          const ifra = document.getElementsByTagName('iframe')[0];
          ifra && SetFullScreen(ifra);
        },
      },
    ];
    return (
      <div className={styles.kline}>
        <div className={styles.tools}>
          <ul>
            {tools.map((item, index) => (
              <li
                className={interval === item.value ? styles.active : null}
                key={index}
                onClick={() => {
                  if (!this.widget || item.value === interval) return;
                  if (item.value) {
                    if (item.value === 'realTime') {
                      if (interval === '1') {
                        this.widget.chart().setChartType(3);
                      } else {
                        this.widget.chart().setResolution('1', () => {
                          this.widget.chart().setChartType(3);
                        });
                      }
                    } else {
                      this.widget.chart().setChartType(1);
                      this.widget.chart().setResolution(item.value, () => {});
                    }
                    this.setState({
                      interval: item.value,
                    });
                  }
                  if (item.onClick) {
                    item.onClick();
                  }
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
