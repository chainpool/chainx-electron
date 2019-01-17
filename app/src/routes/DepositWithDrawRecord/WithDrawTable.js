import React, { Component } from 'react';
import * as styles from './index.less';
import { Table } from '../../components';

class WithDrawTable extends Component {
  render() {
    const {
      model: { normalizedWithdrawList },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '申请时间',
          dataIndex: 'date',
        },
        {
          title: '原链交易ID',
          ellipse: true,
          dataIndex: 'originChainTxId',
        },
        {
          title: '币种',
          dataIndex: 'token',
        },
        {
          title: '地址',
          ellipse: true,
          dataIndex: 'addr',
        },
        {
          title: '数量',
          dataIndex: 'balance',
        },
        {
          title: '手续费',
          dataIndex: 'fee',
        },
        {
          title: '状态',
          width: 100,
          dataIndex: 'state',
        },
      ],
      dataSource: normalizedWithdrawList,
    };
    return <Table {...tableProps} />;
  }
}

export default WithDrawTable;
