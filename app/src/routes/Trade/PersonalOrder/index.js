import React from 'react';
import SwitchPair from '../Mixin/SwitchPair';

import { Inject } from '../../../utils';
import * as styles from './index.less';
import { Tab } from '../../components';
import CurrentOrderTable from './CurrentOrderTable';
import HistoryOrderTable from './HistoryOrderTable';

@Inject(({ tradeStore: model }) => ({ model }))
class PersonalOrder extends SwitchPair {
  state = {
    activeIndex: 0,
  };

  render() {
    const { activeIndex } = this.state;
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
            tabs={['当前委托']}
            className={styles.tab}
          />
        </div>
        {activeIndex ? <HistoryOrderTable {...props} /> : <CurrentOrderTable {...props} />}
      </div>
    );
  }
}

export default PersonalOrder;
