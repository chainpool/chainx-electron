import React from 'react';
import * as styles from './index.less';
import { Mixin, Table } from '../../components';
import { Inject, moment, formatNumber } from '@utils';

@Inject(({ assetStore, globalStore }) => ({ assetStore, globalStore }))
class DepositTable extends Mixin {
  startInit() {
    const {
      assetStore: { dispatch },
    } = this.props;

    dispatch({ type: 'getDepositRecords' });
  }

  render() {
    const {
      assetStore: { depositRecords },
      globalStore: { assets },
    } = this.props;

    const records = depositRecords.map(record => {
      const info = assets.find(asset => asset.name === record.token);
      if (!info) {
        throw Error(`can not find record asset ${record.token} definition`);
      }

      return {
        address: record.address, //充值地址
        time: moment.formatHMS(new Date(record.time * 1000)),
        token: record.token,
        txid: record.txid,
        amount: formatNumber.toPrecision(record.balance, info.precision),
        status: record.totalConfirm > record.confirm ? `(${record.confirm}/${record.totalConfirm})确认中` : '已确认',
      };
    });

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '发起时间',
          dataIndex: 'time',
        },
        {
          title: '原链交易ID',
          dataIndex: 'txid',
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
          title: '状态',
          width: 100,
          dataIndex: 'status',
        },
      ],
      dataSource: records,
    };
    return <Table {...tableProps} />;
  }
}

export default DepositTable;
