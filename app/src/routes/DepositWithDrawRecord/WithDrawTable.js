import React from 'react';
import * as styles from './index.less';
import { Mixin, Table } from '../../components';
import { observer } from '@utils';

@observer
class WithDrawTable extends Mixin {
  startInit() {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getWithdrawalListByAccount' });
  }

  render() {
    const {
      model: { normalizedAccountWithdrawList },
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
          width: 100,
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
          title: '备注',
          dataIndex: 'memo',
        },
        {
          title: '状态',
          width: 100,
          dataIndex: 'state',
        },
      ],
      dataSource: normalizedAccountWithdrawList,
    };
    return <Table {...tableProps} />;
  }
}

export default WithDrawTable;
