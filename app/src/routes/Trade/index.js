import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import Handicap from './Handicap';
import OrderPair from './OrderPair';
import PutOrder from './PutOrder';
import PersonalOrder from './PersonalOrder';

import { Inject, parseQueryString } from '../../utils';
import * as styles from './index.less';

@Inject(({ tradeStore: model }) => ({ model }))
class Trade extends SwitchPair {
  state = {
    show: false,
  };

  startInit = async () => {
    const { model: { dispatch } = {} } = this.props;
    await dispatch({ type: 'getOrderPairs' });
    this.setState({
      show: true,
    });
  };

  render() {
    const { show } = this.state;
    const props = {
      ...this.props,
    };

    return show ? (
      <div className={styles.trade}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.handicap}>
              <Handicap {...props} data-desc="挂单" />
            </div>
          </div>
          <div className={styles.center}>
            <div className={styles.putOrder}>
              <PutOrder {...props} data-desc="下单" />
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.orderPair}>
              <OrderPair {...props} data-desc="货币对" />
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.personalOrder}>
            <PersonalOrder {...props} data-desc="当前委托和历史委托" />
          </div>
        </div>
      </div>
    ) : null;
  }
}

export default Trade;
