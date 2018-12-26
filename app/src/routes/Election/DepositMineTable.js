import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, ButtonGroup, Button } from '../../components';

class DepositMineTable extends Component {
  render() {
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '排名',
          width: 50,
          dataIndex: 'data1',
        },
        {
          title: '资产种类',
          dataIndex: 'data2',
        },
        {
          title: '最新总余额',
          ellipse: true,
          dataIndex: 'data3',
        },
        {
          title: '移动平均价(PCX)',
          ellipse: true,
          dataIndex: 'data4',
        },
        {
          title: '折合投票数',
          dataIndex: 'data5',
        },
        {
          title: '奖池金额',
          dataIndex: 'data6',
        },
        {
          title: '我的总余额',
          dataIndex: 'data7',
        },
        {
          title: '待领利息',
          dataIndex: 'data8',
        },
        {
          title: '',
          dataIndex: '_action',
          render: () => (
            <ButtonGroup>
              <Button>提息</Button>
            </ButtonGroup>
          ),
        },
      ],
      dataSource: [
        {
          data1: '1',
          data2: 'BTC',
          data3: '3000,0',
          data4: '132,783',
          data5: '12.64937460',
          data6: '30,000',
          data7: '32,783',
          data8: '32,783',
          data9: '32,783',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default DepositMineTable;
