import React from 'react';
import * as styles from './index.less';
import { Mixin, RouterGo, Table, FormattedMessage } from '../../components';
import { observer, _, setBlankSpace } from '../../utils';
import { blockChain } from '../../constants';
import removewithdrawl from '../../resource/removewithdrawl.png';

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
      model: { lockRecords, dispatch, openModal },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'ApplicationTime'} />,
          dataIndex: 'time',
        },
        {
          title: <FormattedMessage id={'OriginalChainTradeID'} />,
          ellipse: true,
          dataIndex: 'originChainTxId',
          render: value =>
            value ? (
              <RouterGo isOutSide go={{ pathname: blockChain.tx(value) }}>
                {value}
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
          ellipse: true,
          dataIndex: 'address',
        },
        {
          title: <FormattedMessage id={'Amount'} />,
          dataIndex: 'balanceShow',
        },
        {
          title: <FormattedMessage id={'Memo'} />,
          dataIndex: 'memo',
        },
        {
          title: <FormattedMessage id={'Status'} />,
          dataIndex: 'statusValue',
          render: (value, item = {}) => {
            const statusValue = _.get(item, 'status.value') || '';
            if (statusValue.toUpperCase() === 'CONFIRMING') {
              return (
                <>
                  ({_.get(item.value, 'confirm') / _.get(item.value, 'totalConfirm')}) {<FormattedMessage id={value} />}
                </>
              );
            }
            if (statusValue.toUpperCase() === 'APPLYING') {
              return (
                <div className={styles.removewithdrawl}>
                  <FormattedMessage id={value} />
                  {item.id !== undefined ? (
                    <img
                      src={removewithdrawl}
                      alt={'removewithdrawl'}
                      onClick={() => {
                        openModal({
                          name: 'SignModal',
                          data: {
                            description: [
                              { name: 'operation', value: () => <FormattedMessage id={'CancelWithdrawal'} /> },
                              {
                                name: () => <FormattedMessage id={'WithdrawAmount'} />,
                                value: setBlankSpace(item.balanceShow, item.token),
                              },
                            ],
                            callback: () => {
                              return dispatch({
                                type: 'revokeWithdraw',
                                payload: {
                                  id: item.id,
                                },
                              });
                            },
                          },
                        });
                      }}
                    />
                  ) : null}
                </div>
              );
            }
            return <FormattedMessage id={value} />;
          },
        },
      ],
      dataSource: lockRecords,
    };
    return <Table {...tableProps} />;
  }
}

export default LockListTable;
