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
      tableHeight: [36, 23, 1, 0, 0],
      scroll: { tr: 5 },
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
          dataIndex: 'totalAmountShow',
        },
      ],
      dataSource: [],
    });

    const dataSourceSell = new Array(5 - sellList.length > 0 ? 5 - sellList.length : 0)
      .fill()
      .concat(sellList.slice(Math.max(sellList.length - 5, 0), sellList.length));
    const dataSourceBuy = buyList.concat(new Array(5 - buyList.length > 0 ? 5 - buyList.length : 0).fill());

    const isInSell = sellList.find((one = {}) => one.priceShow === currentPair.lastPriceShow);
    const isInBuy = buyList.find((one = {}) => one.priceShow === currentPair.lastPriceShow);
    console.log(!!isInSell, !!isInBuy);
    return (
      <div className={styles.handicap}>
        <div className={styles.title}>挂单列表</div>
        <Table {...setTableProps('red')} dataSource={dataSourceSell} />
        <div className={styles.latestprice}>
          <span className={classNames(isInSell ? styles.red : null, isInBuy ? styles.green : null)}>
            {currentPair.lastPriceShow}
          </span>
        </div>
        <Table {...setTableProps('green')} dataSource={dataSourceBuy} showHead={false} />
      </div>
    );
  }
}

export default Handicap;
