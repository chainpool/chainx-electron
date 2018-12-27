import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

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
            <div className={styles.handicap}>dd</div>
          </div>
          <div className={styles.center}>
            <div className={styles.kline}>dd</div>
            <div className={styles.putOrder}>dd</div>
          </div>
          <div className={styles.right}>
            <div className={styles.orderPair}>dd</div>
            <div className={styles.latestOrder}>dd</div>
          </div>
        </div>
        <div className={styles.bottom} />
      </div>
    );
  }
}

export default Trade;
