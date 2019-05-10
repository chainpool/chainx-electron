import React, { Component } from 'react';
import * as styles from './index.less';
import { FormattedMessage, Table } from '../../components';
import { observer } from '../../utils';

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
        },
      ],
      dataSource: normalizedOnChainAllWithdrawList,
    };
    return <Table {...tableProps} />;
  }
}

export default WithdrawTable;
