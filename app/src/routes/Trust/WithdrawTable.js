import React, { Component } from 'react';
import * as styles from './index.less';
import { Table } from '../../components';
import { observer } from '../../utils';

@observer
class WithdrawTable extends Component {
  render() {
    const {
      model: { normalizedOnChainAllWithdrawList = [] },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '申请时间',
          dataIndex: 'timeShow',
        },
        {
          title: '编号',
          dataIndex: 'id',
          width: 80,
        },
        {
          title: '账户地址',
          ellipse: true,
          dataIndex: 'address',
        },
        {
          title: '资产',
          dataIndex: 'token',
          width: 80,
        },
        {
          title: '原链地址',
          ellipse: true,
          dataIndex: 'addr',
        },
        {
          title: '金额',
          dataIndex: 'balance',
        },
        {
          title: '备注',
          dataIndex: 'memo',
          ellipse: true,
        },
        {
          title: '状态',
          width: 80,
          ellipse: 0,
          dataIndex: 'state',
        },
      ],
      dataSource: normalizedOnChainAllWithdrawList,
    };
    return <Table {...tableProps} />;
  }
}

export default WithdrawTable;
