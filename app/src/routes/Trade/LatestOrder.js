import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './LatestOrder.less';
import { Table } from '../../components';
import { _ } from '../../utils';

class LatestOrder extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    const tableProps = {
      tableHeight: [36, 22.3],
      scroll: { tr: 20 },
      className: styles.tableContainer,
      columns: [
        {
          width: '40%',
          title: '价格(BTC)',
          dataIndex: 'data1',
          render: value => <span className={['red', 'green'][_.random(0, 1)]}>{value}</span>,
        },
        {
          title: '数量(PCX)',
          dataIndex: 'data2',
        },
        {
          title: '累计(PCX)',
          dataIndex: 'data3',
        },
      ],
      dataSource: [],
    };
    return (
      <div className={styles.latestOrder}>
        <div className={styles.title}>最新成交</div>
        <Table {...tableProps}>
          <div className={styles.moreApi}>API未开发</div>
        </Table>
      </div>
    );
  }
}

export default LatestOrder;
