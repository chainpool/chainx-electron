import React from 'react';
import { Table } from '../../../components';
import SwitchPair from '../Mixin/SwitchPair';
import * as styles from './index.less';
import { observer, moment_helper } from '../../../utils';

@observer
class CurrentOrderTable extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    const {
      model: { currentOrderList = [], currentPair = {} },
    } = this.props;
    const tableProps = {
      tableHeight: [36, 40],
      className: styles.tableContainer,
      columns: [
        {
          title: '时间',
          dataIndex: 'createTime',
        },
        {
          title: '交易ID/编号',
          ellipse: true,
          dataIndex: 'user',
        },
        {
          title: '交易对',
          dataIndex: 'createTime',
          render: () => `${currentPair.assets}/${currentPair.currency}`,
        },
        {
          title: '方向',
          dataIndex: 'direction',
          render: value => (value === 'Buy' ? '买入' : '卖出'),
        },
        {
          title: `委托价格(${currentPair.currency})`,
          dataIndex: 'price',
        },
        {
          title: `委托数量(${currentPair.assets})`,
          dataIndex: 'amount',
        },
        {
          title: `冻结金额`,
          dataIndex: 'reserveLast',
        },
        {
          title: `实际成交/成交率`,
          dataIndex: 'hasfillAmount',
        },
        {
          width: 50,
          title: '',
          dataIndex: '_action',
          render: () => <span className="blue">撤销</span>,
        },
      ],
      dataSource: currentOrderList,
    };
    return <Table {...tableProps} />;
  }
}

export default CurrentOrderTable;
