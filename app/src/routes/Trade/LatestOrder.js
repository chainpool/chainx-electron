import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './LatestOrder.less';
import { Table, FormattedMessage } from '../../components';
import { observer } from '../../utils';

@observer
class LatestOrder extends SwitchPair {
  state = {};

  startInit = () => {
    this.fetchPoll(this.getLatestOrder);
  };

  getLatestOrder = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getLatestOrder',
    });
  };

  render() {
    const {
      model: { latestOrderList = [], currentPair = {} },
    } = this.props;
    const tableProps = {
      tableHeight: [36, 22.3],
      scroll: { tr: 20 },
      className: styles.tableContainer,
      columns: [
        {
          width: '40%',
          title: (
            <>
              <FormattedMessage id={'Price'} />({currentPair.currency})
            </>
          ),
          dataIndex: 'priceShow',
        },
        {
          title: <FormattedMessage id={'Time'} />,
          dataIndex: 'timeShow',
        },
        {
          title: (
            <>
              <FormattedMessage id={'Amount'} />({currentPair.assets})
            </>
          ),
          dataIndex: 'amountShow',
        },
      ],
      dataSource: latestOrderList,
    };
    return (
      <div className={styles.latestOrder}>
        <div className={styles.title}>
          <FormattedMessage id={'LatestTrade'} />
        </div>
        <Table {...tableProps} />
      </div>
    );
  }
}

export default LatestOrder;
