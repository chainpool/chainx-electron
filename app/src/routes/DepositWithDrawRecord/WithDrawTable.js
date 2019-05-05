import React from 'react';
import * as styles from './index.less';
import { Mixin, RouterGo, Table, FormattedMessage } from '../../components';
import { observer } from '../../utils';
import { blockChain } from '../../constants';

@observer
class WithDrawTable extends Mixin {
  startInit() {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getWithdrawalListByAccount' });
  }

  render() {
    const {
      model: { onChainAccountWithdrawList },
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
          dataIndex: 'balanceShow',
        },
        {
          title: <FormattedMessage id={'Memo'} />,
          dataIndex: 'memo',
        },
        {
          title: <FormattedMessage id={'Status'} />,
          dataIndex: 'status',
        },
      ],
      dataSource: onChainAccountWithdrawList,
    };
    return <Table {...tableProps} />;
  }
}

export default WithDrawTable;
