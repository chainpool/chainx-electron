import React from 'react';
import SwitchPair from '../Mixin/SwitchPair';

import * as styles from './index.less';
import { Tab } from '../../components';
import CurrentOrderTable from './CurrentOrderTable';
import HistoryOrderTable from './HistoryOrderTable';
import { observer } from '../../../utils';

@observer
class PersonalOrder extends SwitchPair {
  state = {
    activeIndex: 0,
  };

  render() {
    const { activeIndex } = this.state;
    const {
      model: { currentOrderList = [], historyOrderList = [] },
      configureStore: { TradeVersion },
    } = this.props;
    const props = {
      ...this.props,
      noDataTip: () => {
        return (
          <div style={{ position: 'relative' }}>
            <div className={styles.nodata} style={{ top: 20 }}>
              暂无当前委托
            </div>
          </div>
        );
      },
    };
    return (
      <div className={styles.personalOrder}>
        <div className={styles.title}>
          <Tab
            onClick={(item, index) => {
              this.setState({
                activeIndex: index,
              });
            }}
            activeIndex={activeIndex}
            tabs={TradeVersion ? ['当前委托', '历史委托'] : ['当前委托']}
            className={styles.tab}
          />
        </div>
        {activeIndex ? (
          <HistoryOrderTable {...props} historyOrderList={historyOrderList} />
        ) : (
          <CurrentOrderTable currentOrderList={currentOrderList} {...props} />
        )}
      </div>
    );
  }
}

export default PersonalOrder;
