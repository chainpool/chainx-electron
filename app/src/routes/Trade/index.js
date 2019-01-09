import React from 'react';
import { Toast } from '../../components';
import SwitchPair from './Mixin/SwitchPair';
import Handicap from './Handicap';
import OrderPair from './OrderPair';
import LatestOrder from './LatestOrder';
import Kline from './Kline';
import PutOrder from './PutOrder';
import PersonalOrder from './PersonalOrder';

import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ tradeStore: model }) => ({ model }))
class Trade extends SwitchPair {
  state = {};

  startInit = () => {
    setTimeout(() => {
      Toast.success(
        '挂单已完成',
        <div>
          交易对 PCX/BTC; 方向 买入；报价 0.00043527
          <br />
          数量 3.74638923
        </div>
      );
    }, 1000);
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
