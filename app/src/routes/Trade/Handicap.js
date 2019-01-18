import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './Handicap.less';
import { Table } from '../../components';
import { observer } from '../../utils';

@observer
class Handicap extends SwitchPair {
  state = {};

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getQuotations',
    });
  };

  render() {
    const {
      model: { buyList = [], sellList = [], currentPair = {} },
    } = this.props;
    const setTableProps = color => ({
      tableHeight: [36, 22.3, 1, 0, 0],
      scroll: { tr: 14 },
      className: styles.tableContainer,
      columns: [
        {
          width: '40%',
          className: color,
          title: `(价格${currentPair.currency})`,
          dataIndex: 'price',
        },
        {
          title: `(数量${currentPair.assets})`,
          dataIndex: 'amount',
        },
        {
          title: `累计(${currentPair.currency})`,
          dataIndex: 'data3',
        },
      ],
      dataSource: [],
    });
    const dataSourceSell = sellList;
    const dataSourceBuy = buyList;
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
