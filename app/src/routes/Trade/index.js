import React from 'react';
import { Toast } from '../../components';
import SwitchPair from './Mixin/SwitchPair';
import Handicap from './Handicap';
import OrderPair from './OrderPair';
import LatestOrder from './LatestOrder';
import Kline from './Kline';
import PutOrder from './PutOrder';
import PersonalOrder from './PersonalOrder';

import { Inject, parseQueryString } from '../../utils';
import * as styles from './index.less';

@Inject(({ tradeStore: model }) => ({ model }))
class Trade extends SwitchPair {
  state = {};

  startInit = () => {
    const {
      model: { dispatch },
      location: { search },
    } = this.props;
    const id = parseQueryString(search).id;
    dispatch({
      type: 'switchPair',
      payload: {
        id,
      },
    });
  };

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
            <div className={styles.putOrder}>
              <PutOrder {...props} data-desc="下单" />
            </div>
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
        <div className={styles.bottom}>
          <div className={styles.personalOrder}>
            <PersonalOrder {...props} data-desc="当前委托和历史委托" />
          </div>
        </div>
      </div>
    );
  }
}

export default Trade;
