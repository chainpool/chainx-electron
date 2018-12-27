import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import Handicap from './Handicap';

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
              <Handicap {...props} data-block="挂单" />
            </div>
          </div>
          <div className={styles.center}>
            <div className={styles.kline}>kline</div>
            <div className={styles.putOrder}>putorder</div>
          </div>
          <div className={styles.right}>
            <div className={styles.orderPair}>orderPair</div>
            <div className={styles.latestOrder}>latestOrder</div>
          </div>
        </div>
        <div className={styles.bottom}>bottomorder</div>
      </div>
    );
  }
}

export default Trade;
