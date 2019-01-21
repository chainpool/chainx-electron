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

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getAccountOrder',
    });
  };

  render() {
    const { activeIndex } = this.state;
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
            tabs={['当前委托', '历史委托']}
            className={styles.tab}
          />
        </div>
        {activeIndex ? <HistoryOrderTable {...this.props} /> : <CurrentOrderTable {...this.props} />}
      </div>
    );
  }
}

export default PersonalOrder;
