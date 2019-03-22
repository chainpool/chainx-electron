import React from 'react';
import * as styles from './index.less';
import { Mixin, Table } from '../../components';
import { Inject } from '../../utils';
import { BlockTime } from '../components';

@Inject(({ assetStore }) => ({ assetStore }))
class DepositTable extends Mixin {
  startInit() {
    const {
      assetStore: { dispatch },
    } = this.props;

    dispatch({ type: 'getDepositRecords' });
  }

  render() {
    const {
      assetStore: { depositRecords = [] },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '发起时间',
          dataIndex: 'time',
          render: (value, item) => (item.height ? <BlockTime value={item.height} {...this.props} /> : value),
        },
        {
          title: '原链交易ID',
          dataIndex: 'txid',
          ellipse: true,
        },
        {
          title: '币种',
          width: 100,
          dataIndex: 'token',
        },
        {
          title: '地址',
          ellipse: true,
          dataIndex: 'address',
        },
        {
          title: '数量',
          dataIndex: 'amount',
        },
        {
          title: '备注',
          ellipse: true,
          dataIndex: 'memo',
        },
        {
          title: '状态',
          width: 100,
          dataIndex: 'status',
        },
      ],
      dataSource: depositRecords,
    };
    return <Table {...tableProps} />;
  }
}

export default DepositTable;
