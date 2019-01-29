import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './OrderPair.less';
import { Table } from '../../components';
import { Tab } from '../components';
import { _, observer } from '../../utils';

@observer
class OrderPair extends SwitchPair {
  state = {
    activeIndex: 0,
    activeTrIndex: 0,
  };

  render() {
    const { activeIndex } = this.state;
    const {
      model: { orderPairs = [], currentPair = {}, dispatch },
      history,
    } = this.props;
    const groupPairs = _.groupBy(orderPairs, 'currency') || {};
    const dataSource = groupPairs[_.keys(groupPairs)[activeIndex]] || [];
    const tableProps = {
      activeTrIndex: _.findIndex(dataSource, (item = {}) => currentPair.id === item.id),
      tableHeight: [36, 40],
      className: styles.tableContainer,
      onClickRow: item => {
        history.push({ search: `?id=${item.id}` });
        dispatch({
          type: 'switchPair',
          payload: {
            id: item.id,
          },
        });
      },
      columns: [
        {
          width: '40%',
          title: '币种',
          dataIndex: 'assets',
        },
        {
          title: '价格',
          dataIndex: 'lastPriceShow',
        },
        {
          title: '涨幅',
          dataIndex: 'assets',
          render: () => '--',
        },
      ],
      dataSource,
    };

    return (
      <div className={styles.orderPair}>
        <div className={styles.title}>
          <Tab
            tabs={_.keys(groupPairs)}
            className={styles.tab}
            activeIndex={activeIndex}
            onClick={(item, index) => {
              this.setState({
                activeIndex: index,
              });
            }}
          />
        </div>
        <Table {...tableProps} />
      </div>
    );
  }
}

export default OrderPair;
