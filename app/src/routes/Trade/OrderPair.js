import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './OrderPair.less';
import { FormattedMessage, Table } from '../../components';
import { Tab } from '../components';
import { _, observer, parseQueryString } from '../../utils';

@observer
class OrderPair extends SwitchPair {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const id = parseQueryString(search).id;
    this.state = {
      activeIndex: id || 0,
      activeTrIndex: 0,
    };
  }

  switchPair = id => {
    const { history } = this.props;
    history.push({ search: `?id=${id}` });
  };

  render() {
    const { switchPair } = this;
    const { activeIndex } = this.state;
    const {
      model: { currentPair = {} },
    } = this.props;
    let {
      model: { orderPairs = [] },
    } = this.props;
    orderPairs = orderPairs.filter((item = {}) => item.online);
    const groupPairs = _.groupBy(orderPairs, 'currency') || {};
    const activeOne = orderPairs.filter((item = {}) => item.id === +activeIndex)[0] || {};
    const dataSource = groupPairs[activeOne.currency] || [];
    const tableProps = {
      activeTrIndex: Math.max(_.findIndex(dataSource, (item = {}) => currentPair.id === item.id), 0),
      tableHeight: [36, 40],
      className: styles.tableContainer,
      onClickRow: item => {
        switchPair(item.id);
      },
      columns: [
        {
          width: '40%',
          title: <FormattedMessage id={'Token'} />,
          dataIndex: 'assets',
        },
        {
          title: <FormattedMessage id={'Price'} />,
          dataIndex: 'lastPriceShow',
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
            activeIndex={Math.max(_.keys(groupPairs).findIndex(value => value === currentPair.currency), 0)}
            onClick={(item, index) => {
              this.setState(
                {
                  activeIndex: index,
                },
                () => {
                  const id = groupPairs[item][0].id;
                  switchPair(id);
                }
              );
            }}
          />
        </div>
        <Table {...tableProps} />
      </div>
    );
  }
}

export default OrderPair;
