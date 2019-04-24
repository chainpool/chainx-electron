import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './Handicap.less';
import { Table } from '../../components';
import { ColorProgress } from '../components';
import { classNames, observer } from '../../utils';

@observer
class Handicap extends SwitchPair {
  startInit = () => {
    this.fetchPoll(this.getQuotations, true, () => {
      setTimeout(() => {
        this.scrollerSell && this.scrollerSell.scrollTo(0, this.scrollerSell.maxScrollY);
        this.scrollerBuy && this.scrollerBuy.scrollTo(0, 0);
      });
    });
  };

  getQuotations = async (hasStarWith, callback) => {
    const {
      model: { dispatch },
    } = this.props;
    this.subscribeQuotations = await dispatch({
      type: 'getQuotations',
      payload: {
        hasStarWith,
        callback,
      },
    });
  };

  componentWillUnsubscribe = () => {
    this.subscribeQuotations.unsubscribe();
  };

  render() {
    let {
      model: { buyList = [], sellList = [], currentPair = {} },
      configureStore: { TradeVersion },
      refs,
    } = this.props;
    const showTr = TradeVersion ? 14 : 5;
    const dataSourceSell = new Array(showTr - sellList.length > 0 ? showTr - sellList.length : 0)
      .fill()
      .concat(sellList);
    const dataSourceBuy = buyList.concat(new Array(showTr - buyList.length > 0 ? showTr - buyList.length : 0).fill());
    const isInSell = sellList.find((one = {}) => one.priceShow === currentPair.lastPriceShow);
    const isInBuy = buyList.find((one = {}) => one.priceShow === currentPair.lastPriceShow);

    const colorMax = [...dataSourceSell.concat(dataSourceBuy)].sort(
      (a = {}, b = {}) => b.totalAmountShow - a.totalAmountShow
    )[0];
    const setTableProps = color => ({
      onClickRow: item => {
        const setPrice = action => {
          const price = { price: item.priceShow };
          if (price.price) {
            refs.current.changeBS(action, price, () => refs.current.checkAll.checkPrice(action));
          }
        };
        setPrice('buy');
        setPrice('sell');
      },
      tableHeight: [36, TradeVersion ? 22 : 23, 1, 0, 0],
      scroll: { tr: showTr },
      className: styles.tableContainer,
      columns: [
        {
          className: color,
          title: `价格(${currentPair.currency})`,
          dataIndex: 'priceShow',
          render: v => v.slice(0, 10),
        },
        {
          title: `数量(${currentPair.assets})`,
          dataIndex: 'amountShow',
          render: v => <span className={styles.amountShow}>{v.slice(0, 10)}</span>,
        },
        {
          title: `累计(${currentPair.assets})`,
          dataIndex: 'totalAmountShow',
          render: (value, item = {}) => {
            return (
              <div className={styles.progressContainer}>
                {value.slice(0, 10)}
                <ColorProgress value={value} max={colorMax} direction={item.direction} />
              </div>
            );
          },
        },
      ],
      dataSource: [],
    });

    return (
      <div className={styles.handicap}>
        <div className={styles.title}>挂单列表</div>
        <Table
          {...setTableProps('red')}
          dataSource={dataSourceSell}
          scrollerInit={scroller => (this.scrollerSell = scroller)}
        />
        <div className={styles.latestprice}>
          <span className={classNames(isInSell ? styles.red : null, isInBuy ? styles.green : null)}>
            {currentPair.lastPriceShow}
          </span>
        </div>
        <Table
          {...setTableProps('green')}
          dataSource={dataSourceBuy}
          showHead={false}
          scrollerInit={scroller => (this.scrollerBuy = scroller)}
        />
      </div>
    );
  }
}

export default Handicap;
