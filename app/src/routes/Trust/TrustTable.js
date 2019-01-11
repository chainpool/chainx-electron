import React, { Component } from 'react';
import * as styles from './index.less';
import { Table } from '../../components';

class TrustTable extends Component {
  render() {
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '申请时间',
          dataIndex: 'data1',
        },
        {
          title: '编号',
          dataIndex: 'data2',
        },
        {
          title: '账户地址',
          ellipse: true,
          dataIndex: 'data3',
        },
        {
          title: '资产',
          dataIndex: 'data4',
        },
        {
          title: '原链地址',
          dataIndex: 'data5',
        },
        {
          title: '金额',
          dataIndex: 'data6',
        },
        {
          title: '备注',
          dataIndex: 'data7',
        },
        {
          title: '状态',
          dataIndex: 'data7',
        },
      ],
      dataSource: [
        {
          data1: '2018-04-13 16:56:34',
          data2: '1',
          data3: '5345773718cb9c8d09a5345773718cb9c8d09a534',
          data4: '10,000.000',
          data5: '0.000',
          data6: '0.000',
          data7: '14,000.240',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default TrustTable;
