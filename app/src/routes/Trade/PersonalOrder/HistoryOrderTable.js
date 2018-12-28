import React from 'react';
import SwitchPair from '../Mixin/SwitchPair';

import * as styles from './index.less';
import { Table } from '../../../components';
import { classNames } from '../../../utils';

class HistoryOrderTable extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    const tableProps = {
      tableHeight: [36, 42, 36, 36],
      className: styles.tableContainer,
      columns: [
        {
          title: '时间',
          dataIndex: 'data1',
        },
        {
          title: '本链交易ID',
          dataIndex: 'data2',
        },
        {
          title: '方向',
          width: 80,
          dataIndex: 'data3',
        },
        {
          title: '委托价格(BTC)',
          dataIndex: 'data4',
        },
        {
          title: '委托数量(PCX)',
          dataIndex: 'data5',
        },
        {
          title: '成交量(PCX)',
          dataIndex: 'data5',
        },
        {
          title: '成交均价(BTC)',
          dataIndex: 'data6',
        },
        {
          title: '成交总额(BTC)',
          dataIndex: 'data7',
        },
        {
          title: '',
          width: 80,
          dataIndex: '_action',
        },
        {
          width: 50,
          title: '',
          dataIndex: '_action',
          render: () => <span className="blue">撤销</span>,
        },
      ],
      dataSource: new Array(3).fill({}).map(() => ({
        data1: '2018-08-16 16:23:56',
        data2: '0x1234567890abcdef',
        data3: '买入',
        data4: '0.00046321',
        data5: '3,234,000',
        data6: '1,234,000',
        data7: '0.50000000',
        expand: new Array(1).fill({}),
      })),
      expandedRowRender: item => {
        const props = {
          tableHeight: [36, 36],
          className: styles.tableContainer,
          columns: [
            {
              title: '时间',
              dataIndex: 'data1',
            },
            {
              title: '本链交易ID',
              dataIndex: 'data2',
            },
            {
              title: '方向',
              width: 80,
              dataIndex: 'data3',
            },
            {
              title: '委托价格(BTC)',
              dataIndex: 'data4',
            },
            {
              title: '委托数量(PCX)',
              dataIndex: 'data5',
            },
            {
              title: '成交量(PCX)',
              dataIndex: 'data5',
            },
            {
              title: '成交均价(BTC)',
              dataIndex: 'data6',
            },
            {
              title: '成交总额(BTC)',
              dataIndex: 'data7',
            },
            {
              title: '',
              width: 80,
              dataIndex: '_action',
            },
            {
              width: 50,
              title: '',
              dataIndex: '_action',
              render: () => <span className="blue">子表格</span>,
            },
          ],
          dataSource: item.expand.map(() => ({
            data1: '2018-08-16 16:23:56',
            data2: '0x1234567890abcdef',
            data3: '买入',
            data4: '0.00046321',
            data5: '3,234,000',
            data6: '1,234,000',
            data7: '0.50000000',
          })),
        };
        return (
          <div className="expandRow">
            <Table {...props} showHead={false} />
          </div>
        );
      },
    };
    return <Table {...tableProps} />;
  }
}

export default HistoryOrderTable;
