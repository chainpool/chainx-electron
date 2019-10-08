import React from 'react';
import * as styles from './index.less';
import { Mixin, RouterGo, Table, FormattedMessage, DotInCenterStr } from '../../components';
import { observer, _, setBlankSpace, showAssetName, hexPrefix } from '../../utils';
import { blockChain } from '../../constants';
import removewithdrawl from '../../resource/removewithdrawl.png';

@observer
class WithDrawTable extends Mixin {
  startInit() {
    this.getWithdrawalListByAccount();
  }

  getWithdrawalListByAccount = async () => {
    const {
      model: { dispatch },
    } = this.props;

    this.subscribeWithdrawalList = await dispatch({ type: 'getWithdrawalListByAccount' });
  };

  componentWillUnsubscribe = () => {
    this.subscribeWithdrawalList && this.subscribeWithdrawalList.unsubscribe();
  };

  render() {
    const {
      model: { onChainAccountWithdrawList, dispatch, openModal, isTestBitCoinNetWork },
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
          ellipse: 20,
          dataIndex: 'originChainTxId',
          render: value =>
            value ? (
              <RouterGo isOutSide go={{ pathname: blockChain.tx(value, isTestBitCoinNetWork()) }}>
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
          render: v => showAssetName(v),
        },
        {
          title: <FormattedMessage id={'Address'} />,
          ellipse: 20,
          dataIndex: 'address',
          render: value => <DotInCenterStr value={value} />,
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
                  {_.get(item.value, 'confirm')
                    ? `(${_.get(item.value, 'confirm')} / ${_.get(item.value, 'totalConfirm')}) `
                    : null}
                  {<FormattedMessage id={value} />}
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
                                value: setBlankSpace(item.balanceShow, showAssetName(item.token)),
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
      dataSource: onChainAccountWithdrawList,
    };
    return <Table {...tableProps} />;
  }
}

export default WithDrawTable;
