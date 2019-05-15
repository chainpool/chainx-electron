import React, { Component } from 'react';
import * as styles from './index.less';
import { FormattedMessage, Table } from '../../components';
import { _, observer } from '../../utils';

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
            const statusValue = _.get(item, 'status') || '';
            if (statusValue && statusValue.toUpperCase && statusValue.toUpperCase() === 'CONFIRMING') {
              return (
                <>
                  {value}({_.get(item.status, 'confirm') / _.get(item.status, 'total_confirm')})
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
