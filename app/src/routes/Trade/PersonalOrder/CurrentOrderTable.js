import React from 'react';
import { Table } from '../../../components';
import SwitchPair from '../Mixin/SwitchPair';
import * as styles from './index.less';

class CurrentOrderTable extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    const tableProps = {
      tableHeight: [36, 40],
      className: styles.tableContainer,
      columns: [
        {
          title: '时间',
          dataIndex: 'data1',
        },
        {
          title: '交易ID',
          dataIndex: 'data2',
        },
        {
          title: '方向',
          dataIndex: 'data3',
        },
        {
          title: '委托价格(BTC)',
          dataIndex: 'data4',
        },
        {
          title: '委托数量(PCX)',
          dataIndex: 'data5',
        },
        {
          title: '实际成交(PCX)',
          dataIndex: 'data5',
        },
        {
          width: 50,
          title: '',
          dataIndex: '_action',
          render: () => <span className="blue">撤销</span>,
        },
      ],
      dataSource: new Array(3).fill({}).map(() => ({
        data1: '2018-08-16 16:23:56',
        data2: '0x1234567890abcdef',
        data3: '买入',
        data4: '0.00046321',
        data5: '3,234,000',
        data6: '1,234,000',
      })),
    };
    return <Table {...tableProps} />;
  }
}

export default CurrentOrderTable;
