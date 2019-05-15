import React, { Component } from 'react';
import * as styles from './index.less';
import { FormattedMessage, RouterGo, Table } from '../../components';
import { _, observer, toJS } from '../../utils';
import { blockChain } from '../../constants';

@observer
class WithdrawTable extends Component {
  render() {
    const {
      model: { normalizedOnChainAllWithdrawList = [] },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
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
          ellipse: true,
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
        },
        {
          title: <FormattedMessage id={'OriginalChainAddr'} />,
          ellipse: true,
          dataIndex: 'addr',
          render: value => (
            <RouterGo isOutSide go={{ pathname: blockChain.address(value) }}>
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
          ellipse: true,
        },
        {
          title: <FormattedMessage id={'Status'} />,
          width: 80,
          ellipse: 0,
          dataIndex: 'state',
          render: (value, item = {}) => {
            const statusValue = _.get(item, 'status.value') || '';
            if (statusValue && statusValue.toUpperCase && statusValue.toUpperCase() === 'CONFIRMING') {
              return (
                <>
                  {value}
                  {_.get(item.status, 'confirm') && (
                    <span>({`${_.get(item.status, 'confirm')}/${_.get(item.status, 'total_confirm')}`})</span>
                  )}
                </>
              );
            }
            return value;
          },
        },
      ],
      dataSource: normalizedOnChainAllWithdrawList,
    };
    return <Table {...tableProps} />;
  }
}

export default WithdrawTable;
