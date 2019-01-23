import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './Handicap.less';
import { Table } from '../../components';
import { classNames, observer } from '../../utils';

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
          width: '38%',
          className: color,
          title: `价格(${currentPair.currency})`,
          dataIndex: 'priceShow',
        },
        {
          title: `数量(${currentPair.assets})`,
          dataIndex: 'amountShow',
        },
        {
          title: `累计(${currentPair.assets})`,
          dataIndex: 'data3',
        },
      ],
      dataSource: [],
    });

    const dataSourceSell = new Array(14 - sellList.length > 0 ? 14 - sellList.length : 0)
      .fill()
      .concat(sellList.slice(Math.max(sellList.length - 14, 0), sellList.length));
    const dataSourceBuy = buyList.concat(new Array(14 - buyList.length > 0 ? 14 - buyList.length : 0).fill());
    return (
      <div className={styles.handicap}>
        <div className={styles.title}>挂单列表</div>
        <Table {...setTableProps('red')} dataSource={dataSourceSell}>
          <div className={styles.moreApi}>API未开发</div>
        </Table>
        <div className={styles.latestprice}>{currentPair.lastPriceShow}</div>
        <Table {...setTableProps('green')} dataSource={dataSourceBuy} showHead={false}>
          <div className={classNames(styles.moreApi, styles.buyMoreApi)} style={{ bottom: 0 }}>
            API未开发
          </div>
        </Table>
      </div>
    );
  }
}

export default Handicap;
