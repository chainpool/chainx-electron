import React from 'react';
import * as styles from './index.less';
import { FormattedMessage, Mixin, RouterGo, Table } from '../../components';
import { _, Inject } from '../../utils';
import { blockChain } from '../../constants';

@Inject(({ assetStore }) => ({ assetStore }))
class DepositTable extends Mixin {
  startInit() {
    this.getDepositRecords();
  }

  getDepositRecords = async () => {
    const {
      assetStore: { dispatch },
    } = this.props;

    this.subscribeDepositRecords = await dispatch({ type: 'getDepositRecords' });
  };

  componentWillUnsubscribe = () => {
    this.subscribeDepositRecords && this.subscribeDepositRecords.unsubscribe();
  };

  render() {
    const {
      assetStore: { depositRecords = [] },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'LaunchTime'} />,
          dataIndex: 'time',
        },
        {
          title: <FormattedMessage id={'OriginalChainTradeID'} />,
          dataIndex: 'txid',
          ellipse: true,
          render: value => (
            <RouterGo isOutSide go={{ pathname: blockChain.tx(value) }}>
              {value}
            </RouterGo>
          ),
        },
        {
          title: <FormattedMessage id={'Token'} />,
          width: 100,
          dataIndex: 'token',
        },
        {
          title: <FormattedMessage id={'Address'} />,
          ellipse: true,
          dataIndex: 'address',
        },
        {
          title: <FormattedMessage id={'Amount'} />,
          dataIndex: 'amount',
        },
        {
          title: <FormattedMessage id={'Memo'} />,
          ellipse: true,
          dataIndex: 'memo',
        },
        {
          title: <FormattedMessage id={'Status'} />,
          dataIndex: 'statusValue',
          render: (value, item) => {
            if (value.toUpperCase() === 'CONFIRMING') {
              return (
                <>
                  ({_.get(item.value, 'confirm') / _.get(item.value, 'totalConfirm')}) {<FormattedMessage id={value} />}
                </>
              );
            }
            return <FormattedMessage id={value} />;
          },
        },
      ],
      dataSource: depositRecords,
    };
    return <Table {...tableProps} />;
  }
}

export default DepositTable;
