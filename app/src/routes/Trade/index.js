import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import Handicap from './Handicap';
import OrderPair from './OrderPair';
import LatestOrder from './LatestOrder';
import Kline from './Kline';

import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ tradeStore: model }) => ({ model }))
class Trade extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    const props = {
      ...this.props,
    };

    return (
      <div className={styles.trade}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.handicap}>
              <Handicap {...props} data-desc="挂单" />
            </div>
          </div>
          <div className={styles.center}>
            <div className={styles.kline}>
              <Kline {...props} data-desc="K线图" />
            </div>
            <div className={styles.putOrder}>putorder</div>
          </div>
          <div className={styles.right}>
            <div className={styles.orderPair}>
              <OrderPair {...props} data-desc="货币对" />
            </div>
            <div className={styles.latestOrder}>
              <LatestOrder {...props} data-desc="最新成交" />
            </div>
          </div>
        </div>
        <div className={styles.bottom}>bottomorder</div>
      </div>
    );
  }
}

export default Trade;
