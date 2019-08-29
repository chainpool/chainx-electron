import React, { Component } from 'react';
import * as styles from './index.less';
import { FormattedMessage, RouterGo, Table } from '../../components';
import { _, observer, showAssetName } from '../../utils';
import { blockChain } from '../../constants';

@observer
class WithdrawTable extends Component {
  render() {
    const {
      model: { normalizedOnChainAllWithdrawList = [], isTestBitCoinNetWork },
      trustStore: { getAllWithdrawalListLoading },
    } = this.props;

    const noDataTip = () => {
      return (
        <div style={{ position: 'relative' }}>
          <div className={styles.nodata} style={{ top: 20 }}>
            <div>
              <FormattedMessage id={'NoData'} />
            </div>
          </div>
        </div>
      );
    };

    const tableProps = {
      className: styles.tableContainer,
      noDataTip: noDataTip,
      columns: [
        {
          title: <FormattedMessage id={'ApplicationTime'} />,
          dataIndex: 'timeShow',
        },
        {
          title: <FormattedMessage id={'ID'} />,
          dataIndex: 'id',
          width: 80,
        },
        {
          title: <FormattedMessage id={'AccountAddress'} />,
          ellipse: 20,
          dataIndex: 'address',
          render: (value, item) => (
            <RouterGo isOutSide go={{ pathname: blockChain.accountId(item.accountId) }}>
              {value}
            </RouterGo>
          ),
        },
        {
          title: <FormattedMessage id={'Asset'} />,
          dataIndex: 'token',
          width: 80,
          render: v => showAssetName(v),
        },
        {
          title: <FormattedMessage id={'OriginalChainAddr'} />,
          ellipse: 20,
          dataIndex: 'addr',
          render: value => (
            <RouterGo isOutSide go={{ pathname: blockChain.address(value, isTestBitCoinNetWork()) }}>
              {value}
            </RouterGo>
          ),
        },
        {
          title: <FormattedMessage id={'BitcoinTxHash'} />,
          ellipse: 20,
          dataIndex: 'txid',
          render: value =>
            value && (
              <RouterGo isOutSide go={{ pathname: blockChain.tx(value, isTestBitCoinNetWork()) }}>
                {value}
              </RouterGo>
            ),
        },
        {
          title: <FormattedMessage id={'Balance'} />,
          dataIndex: 'balance',
        },
        {
          title: <FormattedMessage id={'Memo'} />,
          dataIndex: 'memo',
          ellipse: 20,
        },
        {
          title: <FormattedMessage id={'Status'} />,
          width: 100,
          ellipse: 0,
          dataIndex: 'state',
          render: (value, item = {}) => {
            const statusValue = _.get(item, 'status.value') || '';
            if (statusValue && statusValue.toUpperCase && statusValue.toUpperCase() === 'CONFIRMING') {
              return (
                <>
                  {_.get(item.status, 'confirm') && (
                    <span>({`${_.get(item.status, 'confirm')}/${_.get(item.status, 'totalConfirm')}`})</span>
                  )}
                  <FormattedMessage id={value} />
                </>
              );
            }
            return <FormattedMessage id={value} />;
          },
        },
      ],
      dataSource: normalizedOnChainAllWithdrawList,
      loading: getAllWithdrawalListLoading,
    };
    return <Table {...tableProps} />;
  }
}

export default WithdrawTable;
