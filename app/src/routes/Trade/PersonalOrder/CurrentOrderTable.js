import React from 'react';
import { Button, FormattedMessage, Table } from '../../../components';
import SwitchPair from '../Mixin/SwitchPair';
import * as styles from './index.less';
import { observer, setBlankSpace } from '../../../utils';

@observer
class CurrentOrderTable extends SwitchPair {
  startInit = () => {
    this.fetchPoll(this.getCurrentAccountOrder);
  };

  getCurrentAccountOrder = async () => {
    const {
      model: { dispatch },
    } = this.props;
    this.subscribeCurrentAccountOrder$ = await dispatch({
      type: 'getCurrentAccountOrder',
    });
  };

  componentWillUnsubscribe = () => {
    this.subscribeCurrentAccountOrder$.unsubscribe();
  };

  render() {
    const {
      model: {
        openModal,
        dispatch,
        loading: { cancelOrder },
      },
      noDataTip,
      currentOrderList = [],
    } = this.props;
    const tableProps = {
      noDataTip,
      tableHeight: [36, 40],
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'Time'} />,
          dataIndex: 'timeShow',
        },
        {
          title: <FormattedMessage id={'OrderNumber'} />,
          width: 90,
          dataIndex: 'index',
        },
        {
          title: <FormattedMessage id={'TradingPair'} />,
          width: 100,
          dataIndex: 'createTimeShow',
          render: (value, item) => `${item.filterPair.assets}/${item.filterPair.currency}`,
        },
        {
          title: <FormattedMessage id={'Direction'} />,
          width: 100,
          dataIndex: 'direction',
          render: value =>
            value === 'Buy' ? (
              <span className={'green'}>
                <FormattedMessage id={'Buy'} />
              </span>
            ) : (
              <span className={'red'}>
                <FormattedMessage id={'Sell'} />
              </span>
            ),
        },
        {
          title: <FormattedMessage id={'OrderPrice'} />,
          dataIndex: 'priceShow',
          render: (value, item) => setBlankSpace(value, item.filterPair.currency),
        },
        {
          title: <FormattedMessage id={'OrderAmount'} />,
          dataIndex: 'amountShow',
          render: (value, item) => setBlankSpace(value, item.filterPair.assets),
        },
        {
          title: <FormattedMessage id={'FreezeBalance'} />,
          dataIndex: 'reserveLastShow',
          render: (value, item) =>
            `${value}${' '}${item.direction === 'Buy' ? item.filterPair.currency : item.filterPair.assets}`,
        },
        {
          title: (
            <>
              <FormattedMessage id={'FactFilled'} />/<FormattedMessage id={'FilledPercent'} />%
            </>
          ),
          dataIndex: 'hasfillAmountShow',
          render: (value, item) => setBlankSpace(value, `(${item.hasfillAmountPercent})`),
        },
        {
          width: 50,
          title: '',
          dataIndex: '_action',
          render: (value, item) => (
            <Button
              loading={cancelOrder && item.loading}
              onClick={() => {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [
                      { name: '操作', value: '撤单' },
                      { name: '委托编号', value: item.index },
                      { name: '交易对', value: `${item.filterPair.assets}/${item.filterPair.currency}` },
                      {
                        name: '方向',
                        value: item.direction === 'Buy' ? '买入' : '卖出',
                      },
                      { name: '委托价格', value: setBlankSpace(item.priceShow, item.filterPair.currency) },
                      { name: '委托数量', value: setBlankSpace(item.amountShow, item.filterPair.assets) },
                    ],
                    callback: () => {
                      return dispatch({
                        type: 'cancelOrder',
                        payload: {
                          pairId: item.filterPair.id,
                          index: item.index,
                        },
                      });
                    },
                  },
                });
              }}>
              <FormattedMessage id={'Revoke'} />
            </Button>
          ),
        },
      ],
      dataSource: currentOrderList,
    };
    return <Table {...tableProps} />;
  }
}

export default CurrentOrderTable;
