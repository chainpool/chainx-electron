import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './LatestOrder.less';
import { Table, FormattedMessage } from '../../components';
import { observer, showAssetName } from '../../utils';

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
              <FormattedMessage id={'Price'} />({showAssetName(currentPair.currency)})
            </>
          ),
          dataIndex: 'priceShow',
          render: (value, item) => <span className={item.direction === 'Sell' ? 'red' : 'green'}>{value}</span>,
        },
        {
          title: <FormattedMessage id={'Time'} />,
          dataIndex: 'timeShow',
        },
        {
          title: (
            <>
              <FormattedMessage id={'Amount'} />({showAssetName(currentPair.assets)})
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
