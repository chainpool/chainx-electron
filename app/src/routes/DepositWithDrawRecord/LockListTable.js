import React from 'react';
import * as styles from './index.less';
import { Mixin, RouterGo, Table, FormattedMessage, DotInCenterStr } from '../../components';
import { observer, hexPrefix } from '../../utils';
import { blockChain } from '../../constants';

@observer
class LockListTable extends Mixin {
  startInit = () => {
    this.fetchPoll(this.getLockList);
  };

  getLockList = async () => {
    const {
      model: { dispatch },
    } = this.props;

    this.subscribeLockList = await dispatch({ type: 'getLockListApi' });
  };

  componentWillUnsubscribe = () => {
    this.subscribeLockList && this.subscribeLockList.unsubscribe();
  };

  render() {
    const {
      model: { lockRecords, isTestBitCoinNetWork },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'Time'} />,
          dataIndex: 'time',
        },
        {
          title: <FormattedMessage id={'OriginalChainTradeID'} />,
          ellipse: 20,
          width: 300,
          dataIndex: 'originChainTxId',
          render: value =>
            value ? (
              <RouterGo isOutSide go={{ pathname: blockChain.tx(value) }}>
                <DotInCenterStr value={hexPrefix(value)} />
              </RouterGo>
            ) : (
              '-'
            ),
        },
        {
          title: <FormattedMessage id={'Token'} />,
          width: 100,
          dataIndex: 'token',
        },
        {
          title: <FormattedMessage id={'Address'} />,
          ellipse: 20,
          dataIndex: 'address',
          render: value => {
            return (
              <RouterGo isOutSide go={{ pathname: blockChain.address(value, isTestBitCoinNetWork()) }}>
                <DotInCenterStr value={value} />
              </RouterGo>
            );
          },
        },
        {
          title: <FormattedMessage id={'Amount'} />,
          dataIndex: 'balanceShow',
          render: (v, item) => (
            <span>
              {item.type === 0 ? '+ ' : '- '}
              {v}
            </span>
          ),
        },
        {
          title: <FormattedMessage id={'Status'} />,
          width: 100,
          ellipse: 0,
          dataIndex: 'originChainTxId',
          render: (value, item = {}) => {
            return item.type === 0 ? (
              <FormattedMessage id={'LockPosition'} />
            ) : (
              <FormattedMessage id={'UnLockPosition'} />
            );
          },
        },
      ],
      dataSource: lockRecords,
    };
    return <Table {...tableProps} />;
  }
}

export default LockListTable;
