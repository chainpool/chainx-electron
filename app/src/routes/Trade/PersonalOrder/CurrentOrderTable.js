import React from 'react';
import { Button, FormattedMessage, Table } from '../../../components';
import SwitchPair from '../Mixin/SwitchPair';
import * as styles from './index.less';
import { observer, setBlankSpace, showAssetName } from '../../../utils';

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
          render: (value, item) =>
            `${showAssetName(item.filterPair.assets)}/${showAssetName(item.filterPair.currency)}`,
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
          render: (value, item) => setBlankSpace(value, showAssetName(item.filterPair.currency)),
        },
        {
          title: <FormattedMessage id={'OrderAmount'} />,
          dataIndex: 'amountShow',
          render: (value, item) => setBlankSpace(value, showAssetName(item.filterPair.assets)),
        },
        {
          title: <FormattedMessage id={'FreezeBalance'} />,
          dataIndex: 'reserveLastShow',
          render: (value, item) =>
            `${value}${' '}${
              item.direction === 'Buy' ? showAssetName(item.filterPair.currency) : showAssetName(item.filterPair.assets)
            }`,
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
                      { name: 'operation', value: () => <FormattedMessage id={'CancelOrder'} /> },
                      { name: () => <FormattedMessage id={'OrderNumber'} />, value: item.index },
                      {
                        name: () => <FormattedMessage id={'TradingPair'} />,
                        value: `${showAssetName(item.filterPair.assets)}/${showAssetName(item.filterPair.currency)}`,
                      },
                      {
                        name: () => <FormattedMessage id={'Direction'} />,
                        value: () => <FormattedMessage id={item.direction === 'Buy' ? 'Buy' : 'Sell'} />,
                      },
                      {
                        name: () => <FormattedMessage id={'OrderPrice'} />,
                        value: setBlankSpace(item.priceShow, showAssetName(item.filterPair.currency)),
                      },
                      {
                        name: () => <FormattedMessage id={'OrderAmount'} />,
                        value: setBlankSpace(item.amountShow, showAssetName(item.filterPair.assets)),
                      },
                    ],
                    ...(item.direction === 'Sell'
                      ? {
                          checkNativeAsset: (accountNativeAssetFreeBalance, fee, minValue) => {
                            if (minValue === 0) {
                              return accountNativeAssetFreeBalance - fee >= minValue;
                            } else {
                              return Number(accountNativeAssetFreeBalance - fee) + Number(item.amountShow) > minValue;
                            }
                          },
                        }
                      : {}),
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
