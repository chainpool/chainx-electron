import React, { Component } from 'react';
import * as styles from './index.less';
import { Table } from '../../components';

class TradeTable extends Component {
  render() {
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '时间',
          dataIndex: 'data1',
        },
        {
          title: '原链交易ID',
          ellipse: true,
          dataIndex: 'data2',
        },
        {
          title: '操作',
          dataIndex: 'data3',
        },
        {
          title: '参数信息',
          ellipse: true,
          dataIndex: 'data4',
        },

        {
          title: '手续费',
          dataIndex: 'data5',
        },
      ],
      dataSource: [
        {
          data1: '2018-04-13 16:56:34',
          data2: '19zdMbaZnD8ze6XUZuVTYtVQ419zdMbaZnD8ze6XUZuVTYtVQ4',
          data3: '转账',
          data4: '交易对:PCX/BTC; 方向:买入；报价:0.00043527; 数量:3.74638923',
          data5: '0.001 PCX',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default TradeTable;
