import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './Handicap.less';
import { Table } from '../../components';

class Handicap extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    const setTableProps = color => ({
      tableHeight: [36, 22.3, 1, 0, 0],
      scroll: { tr: 14 },
      className: styles.tableContainer,
      columns: [
        {
          width: '40%',
          className: color,
          title: '价格(BTC)',
          dataIndex: 'data1',
        },
        {
          title: '数量(PCX)',
          dataIndex: 'data2',
        },
        {
          title: '累计(PCX)',
          dataIndex: 'data3',
        },
      ],
      dataSource: [],
    });
    const dataSourceSell = new Array(28).fill({}).map(() => ({
      data1: '0.00046372',
      data2: '7,836,000',
      data3: '7,836,000',
    }));
    const dataSourceBuy = new Array(28).fill({}).map(() => ({
      data1: '0.00046372',
      data2: '7,836,000',
      data3: '7,836,000',
    }));
    return (
      <div className={styles.handicap}>
        <div className={styles.title}>挂单列表</div>
        <Table {...setTableProps('red')} dataSource={dataSourceSell} />
        <div className={styles.latestprice}>0.00046372</div>
        <Table {...setTableProps('green')} dataSource={dataSourceSell} showHead={false} />
      </div>
    );
  }
}

export default Handicap;
