import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './Handicap.less';
import { Table } from '../../components';
import { ColorProgress } from '../components';
import { classNames, observer } from '../../utils';
import { TradeVersion } from '../../constants';

@observer
class Handicap extends SwitchPair {
  static showTr = TradeVersion ? 14 : 5;
  startInit = () => {
    this.getQuotations();
  };

  getQuotations = async () => {
    const {
      model: { dispatch },
    } = this.props;
    this.subscribeQuotations = await dispatch({
      type: 'getQuotations',
    }).then(res => {
      this.fetchPoll(this.getQuotations);
      return res;
    });
  };

  componentWillUnsubscribe = () => {
    this.subscribeQuotations.unsubscribe();
  };

  render() {
    let {
      model: { buyList = [], sellList = [], currentPair = {} },
      refs,
    } = this.props;
    const dataSourceSell = new Array(Handicap.showTr - sellList.length > 0 ? Handicap.showTr - sellList.length : 0)
      .fill()
      .concat(sellList);
    const dataSourceBuy = buyList.concat(
      new Array(Handicap.showTr - buyList.length > 0 ? Handicap.showTr - buyList.length : 0).fill()
    );
    const isInSell = sellList.find((one = {}) => one.priceShow === currentPair.lastPriceShow);
    const isInBuy = buyList.find((one = {}) => one.priceShow === currentPair.lastPriceShow);
    const setTableProps = color => ({
      onClickRow: item => {
        const setPrice = action => {
          const price = { price: item.priceShow };
          refs.current.changeBS(action, price, () => refs.current.checkAll.checkPrice(action));
        };
        setPrice('buy');
        setPrice('sell');
      },
      tableHeight: [36, TradeVersion ? 22 : 23, 1, 0, 0],
      scroll: { tr: Handicap.showTr },
      className: styles.tableContainer,
      columns: [
        {
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
          render: (value, item = {}) => {
            return (
              <div className={styles.progressContainer}>
                {value}
                <ColorProgress
                  value={value}
                  dataSource={dataSourceSell.concat(dataSourceBuy)}
                  direction={item.direction}
                />
              </div>
            );
          },
        },
      ],
      dataSource: [],
    });
    return (
      <div className={styles.handicap}>
        <div className={styles.title}>
          挂单列表 <span>(盘口10档)</span>
        </div>
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
