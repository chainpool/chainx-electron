import React from 'react';
import SwitchPair from '../Mixin/SwitchPair';

import * as styles from './index.less';
import { Input, FormattedMessage } from '../../../components';
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
      model: { currentOrderList = [], historyOrderList = [], showCurrent, dispatch },
      configureStore: { TradeVersion },
    } = this.props;
    const props = {
      ...this.props,
      showCurrent,
      noDataTip: () => {
        return (
          <div style={{ position: 'relative' }}>
            <div className={styles.nodata} style={{ top: 20 }}>
              <div>暂无当前委托</div>
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
            tabs={
              TradeVersion
                ? [<FormattedMessage id={'CurrentOrder'} />, <FormattedMessage id={'HistoryOrder'} />]
                : [<FormattedMessage id={'CurrentOrder'} />]
            }
            className={styles.tab}
          />
          <div className={styles.currenttrade}>
            <Input.Checkbox
              value={showCurrent}
              onClick={() => {
                dispatch({
                  type: 'changeShowCurrent',
                });
              }}
            />
            只显示当前交易对
          </div>
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
