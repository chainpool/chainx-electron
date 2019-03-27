import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './LatestOrder.less';
import { Table } from '../../components';
import { observer } from '../../utils';
import { BlockTime } from '../components';

@observer
class LatestOrder extends SwitchPair {
  state = {};

  startInit = () => {
    this.getLatestOrder();
  };

  getLatestOrder = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getLatestOrder',
    }).then(() => {
      this.fetchPoll(this.getLatestOrder);
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
          title: `价格(${currentPair.currency})`,
          dataIndex: 'priceShow',
        },
        {
          title: '时间',
          dataIndex: 'time',
          render: value => <BlockTime value={value} {...this.props} format={'HH:mm:ss'} />,
        },
        {
          title: `数量(${currentPair.assets})`,
          dataIndex: 'amountShow',
        },
      ],
      dataSource: latestOrderList,
    };
    return (
      <div className={styles.latestOrder}>
        <div className={styles.title}>最新成交</div>
        <Table {...tableProps} />
      </div>
    );
  }
}

export default LatestOrder;
