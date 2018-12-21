import React, { Component } from 'react';
import { setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button } from '../../components';

class CertTable extends Component {
  render() {
    const { widths } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'data1',
          },
          {
            title: '证书发放日期',
            dataIndex: 'data2',
          },
          {
            title: '抵押锁定期',
            dataIndex: 'data3',
          },
          {
            title: '剩余节点额度',
            dataIndex: 'data4',
          },
          {
            title: '',
            dataIndex: 'data1',
            render: () => <Button>注册</Button>,
          },
        ],
        widths
      ),
      dataSource: [
        {
          data1: 'zhengshud注册注册注册注册注册注册注册',
          data2: '2018-10-31',
          data3: '30天',
          data4: '45',
        },
        {
          data1: 'zhengshud注册注册注册注册注册注册注册',
          data2: '2018-10-31',
          data3: '30天',
          data4: '45',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default CertTable;
