import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './OrderPair.less';
import { Table } from '../../components';
import { Tab } from '../components';

class OrderPair extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    const tableProps = {
      tableHeight: [36, 40],
      className: styles.tableContainer,
      columns: [
        {
          width: '40%',
          title: '币种',
          dataIndex: 'data1',
        },
        {
          title: '价格',
          dataIndex: 'data2',
        },
        {
          title: '涨幅',
          dataIndex: 'data3',
        },
      ],
      dataSource: new Array(3).fill({}).map(() => ({
        data1: 'PCX',
        data2: '7,836,000',
        data3: '12.00%',
      })),
    };

    return (
      <div className={styles.orderPair}>
        <div className={styles.title}>
          <Tab tabs={['BTC']} className={styles.tab} />
        </div>
        <Table {...tableProps} />
      </div>
    );
  }
}

export default OrderPair;
