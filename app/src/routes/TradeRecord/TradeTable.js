import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, Mixin } from '../../components';
import { observer } from '../../utils';

@observer
class TradeTable extends Mixin {
  componentWillUnsubscribe = () => {
    this.getTradeRecordApi$.unsubscribe();
  };

  render() {
    const {
      model: { tradeRecords = [], tradeRecordsPageTotal, dispatch },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '时间',
          width: 200,
          dataIndex: 'timeShow',
        },
        {
          title: '本链交易ID',
          ellipse: true,
          dataIndex: 'id',
        },
        {
          title: '操作',
          width: 100,
          dataIndex: 'operation',
        },
        {
          title: '参数信息',
          ellipse: 0,
          dataIndex: 'info',
        },
      ],
      dataSource: tradeRecords,
    };

    const pagination = {
      total: tradeRecordsPageTotal,
      onPageChange: async page => {
        this.getTradeRecordApi$ = await dispatch({
          type: 'getTradeRecordApi',
          payload: {
            page,
          },
        });
      },
    };
    return (
      <>
        <Table {...tableProps} location={this.props.location} pagination={pagination} />
      </>
    );
  }
}

export default TradeTable;
