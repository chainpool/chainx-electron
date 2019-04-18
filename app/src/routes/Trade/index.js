import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import Handicap from './Handicap';
import OrderPair from './OrderPair';
import LatestOrder from './LatestOrder';
import PutOrder from './PutOrder';
import PersonalOrder from './PersonalOrder';
import Kline from './Kline';

import { Inject } from '../../utils';

import * as styles from './index.less';

@Inject(({ tradeStore: model, configureStore, assetStore }) => ({ model, configureStore, assetStore }))
class Trade extends SwitchPair {
  constructor(props) {
    super(props);
    this.putOrderRef = React.createRef();
    this.state = {
      show: false,
    };
  }

  startInit = async () => {
    await this.fetchPoll(this.getOrderPairs);
    this.setState({
      show: true,
    });
  };

  getOrderPairs = () => {
    const { model: { dispatch } = {} } = this.props;
    return dispatch({ type: 'getOrderPairs' });
  };

  render() {
    const { show } = this.state;
    const {
      configureStore: { TradeVersion },
    } = this.props;
    const props = {
      ...this.props,
    };

    return show ? (
      TradeVersion ? (
        <div className={styles.tradeAfter}>
          <div className={styles.top}>
            <div className={styles.left}>
              <div className={styles.handicap}>
                <Handicap {...props} data-desc="挂单" refs={this.putOrderRef} />
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.kline}>
                <Kline {...props} data-desc="k线图" />
              </div>
              <div className={styles.putOrder}>
                <PutOrder {...props} data-desc="下单" ref={this.putOrderRef} />
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.orderPair}>
                <OrderPair {...props} data-desc="货币对" />
              </div>
              <div className={styles.atestOrder}>
                <LatestOrder {...props} data-desc="最新成交列表" />
              </div>
            </div>
          </div>
          <div className={styles.bottom}>
            <div className={styles.personalOrder}>
              <PersonalOrder {...props} data-desc="当前委托和历史委托" />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.tradePrimary}>
          <div className={styles.top}>
            <div className={styles.left}>
              <div className={styles.handicap}>
                <Handicap {...props} data-desc="挂单" refs={this.putOrderRef} />
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.putOrder}>
                <PutOrder {...props} data-desc="下单" ref={this.putOrderRef} />
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
      )
    ) : null;
  }
}

export default Trade;
