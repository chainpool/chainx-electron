import React, { Component } from 'react';
import * as styles from './index.less';
import { Table } from '../../components';

class WithDrawTable extends Component {
  render() {
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '申请时间',
          dataIndex: 'data1',
        },
        {
          title: '原链交易ID',
          ellipse: true,
          dataIndex: 'data2',
        },
        {
          title: '币种',
          dataIndex: 'data3',
        },
        {
          title: '地址',
          ellipse: true,
          dataIndex: 'data4',
        },
        {
          title: '数量',
          dataIndex: 'data5',
        },
        {
          title: '手续费',
          dataIndex: 'data6',
        },
        {
          title: '状态',
          dataIndex: '_action',
          render: () => '已确认',
        },
      ],
      dataSource: [
        {
          data1: '2018-04-13 16:56:34',
          data2: '19zdMbaZnD8ze6XUZuVTYtVQ419zdMbaZnD8ze6XUZuVTYtVQ4',
          data3: 'BTC',
          data4: '19zdMbaZnD8ze6XUZuVTYtVQ419zdMbaZnD8ze6XUZuVTYtVQ4',
          data5: '12.64937460',
          data6: '0.001',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default WithDrawTable;
