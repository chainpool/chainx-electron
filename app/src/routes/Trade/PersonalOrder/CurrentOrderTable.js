import React from 'react';
import { Button, Table } from '../../../components';
import SwitchPair from '../Mixin/SwitchPair';
import * as styles from './index.less';
import { observer } from '../../../utils';

@observer
class CurrentOrderTable extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    const {
      model: { openModal, dispatch, currentOrderList = [] },
      noDataTip,
    } = this.props;

    const tableProps = {
      tableHeight: [36, 40],
      className: styles.tableContainer,
      noDataTip,
      columns: [
        {
          title: '时间',
          dataIndex: 'createTimeShow',
        },
        {
          title: '委托编号',
          ellipse: true,
          dataIndex: 'index',
        },
        {
          title: '交易对',
          width: 100,
          dataIndex: 'createTimeShow',
          render: (value, item) => `${item.filterPair.assets}/${item.filterPair.currency}`,
        },
        {
          title: '方向',
          width: 100,
          dataIndex: 'direction',
          render: value =>
            value === 'Buy' ? <span className={'green'}>买入</span> : <span className={'red'}>卖出</span>,
        },
        {
          title: `委托价格`,
          dataIndex: 'priceShow',
          render: (value, item) => `${value}${' '}${item.filterPair.currency}`,
        },
        {
          title: `委托数量`,
          dataIndex: 'amountShow',
          render: (value, item) => `${value}${' '}${item.filterPair.assets}`,
        },
        {
          title: `冻结金额`,
          dataIndex: 'reserveLastShow',
          render: (value, item) =>
            `${value}${' '}${item.direction === 'Buy' ? item.filterPair.currency : item.filterPair.assets}`,
        },
        {
          title: `实际成交/成交率`,
          dataIndex: 'hasfillAmountShow',
          render: (value, item) => `${value}${' '}(${item.hasfillAmountPercent})`,
        },
        {
          width: 50,
          title: '',
          dataIndex: '_action',
          render: (value, item) => (
            <Button
              onClick={() => {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [
                      { name: '操作', value: '撤单' },
                      { name: '委托编号', value: item.index },
                      { name: '交易对', value: `${item.filterPair.assets}/${item.filterPair.currency}` },
                      {
                        name: '方向',
                        value: item.direction === 'Buy' ? '买入' : '卖出',
                      },
                      { name: '委托价格', value: item.priceShow },
                      { name: '委托数量', value: item.amountShow },
                    ],
                    callback: ({ signer, acceleration }) => {
                      dispatch({
                        type: 'cancelOrder',
                        payload: {
                          signer,
                          acceleration,
                          pairId: item.filterPair.id,
                          index: item.index,
                        },
                      });
                    },
                  },
                });
              }}>
              撤销
            </Button>
          ),
        },
      ],
      dataSource: currentOrderList,
    };
    return <Table {...tableProps} />;
  }
}

export default CurrentOrderTable;
