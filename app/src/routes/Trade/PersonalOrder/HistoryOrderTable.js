import React from 'react';
import SwitchPair from '../Mixin/SwitchPair';
import { _, observer, setBlankSpace } from '../../../utils';

import * as styles from './index.less';
import { Icon, Table } from '../../../components';

@observer
class HistoryOrderTable extends SwitchPair {
  constructor(props) {
    super(props);
    const { historyOrderList = [] } = props;
    this.state = {
      historyOrderList,
    };
  }

  startInit = () => {};

  componentUpdate = prevProps => {
    const { historyOrderList: prevHistoryOrderList } = prevProps;
    const { historyOrderList } = this.props;
    if (!_.isEqual(prevHistoryOrderList, historyOrderList)) {
      this.changeState({
        historyOrderList,
      });
    }
  };

  changeExpandIsOpen = index => {
    const { historyOrderList = [] } = this.state;
    const list = historyOrderList.map((item = {}) => {
      if (item.index === index) {
        return {
          ...item,
          expandIsOpen: !item.expandIsOpen,
        };
      }
      return item;
    });
    this.changeState({
      historyOrderList: list,
    });
  };

  render() {
    const { changeExpandIsOpen } = this;
    const { historyOrderList } = this.state;
    const tableProps = {
      tableHeight: [36, 42, 36, 36],
      className: styles.tableContainer,
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
          render: (value, item) => setBlankSpace(value, item.filterPair.currency),
        },
        {
          title: `委托数量`,
          dataIndex: 'amountShow',
          render: (value, item) => setBlankSpace(value, item.filterPair.assets),
        },
        {
          title: `实际成交/成交率`,
          dataIndex: 'hasfillAmountShow',
          render: (value, item) => setBlankSpace(value, item.hasfillAmountPercent),
        },
        {
          title: `成交均价`,
          dataIndex: '',
        },
        {
          title: `成交总额`,
          dataIndex: '',
        },
        {
          width: 50,
          title: '',
          dataIndex: '_action',
          render: (value, item) => (
            <span
              onClick={() => {
                changeExpandIsOpen(item.index);
              }}>
              <Icon name={item.expandIsOpen ? 'triangle-bottom' : 'triangle-top'} className={styles.pull} />
            </span>
          ),
        },
      ],

      dataSource: historyOrderList.map(item => ({
        ...item,
        expand: [{}, {}, {}],
      })),
      noDataTip: this.props.noDataTip,
      expandedRowRender: item => {
        const props = {
          tableHeight: [36, 36],
          className: styles.tableContainer,
          columns: [
            {
              title: '时间',
              dataIndex: 'data1',
            },
            {
              title: '本链交易ID',
              dataIndex: 'data2',
            },
            {
              title: '方向',
              width: 80,
              dataIndex: 'data3',
            },
            {
              title: '委托价格(BTC)',
              dataIndex: 'data4',
            },
            {
              title: '委托数量(PCX)',
              dataIndex: 'data5',
            },
            {
              title: '成交量(PCX)',
              dataIndex: 'data5',
            },
            {
              title: '成交均价(BTC)',
              dataIndex: 'data6',
            },
            {
              title: '成交总额(BTC)',
              dataIndex: 'data7',
            },
            {
              title: '',
              width: 80,
              dataIndex: '_action',
            },
            {
              width: 50,
              title: '',
              dataIndex: '_action',
            },
          ],
          dataSource: item.expand.map(() => ({
            data1: '2018-08-16 16:23:56',
            data2: '0x1234567890abcdef',
            data3: '买入',
            data4: '0.00046321',
            data5: '3,234,000',
            data6: '1,234,000',
            data7: '0.50000000',
          })),
        };
        return (
          <div className="expandRow">
            <Table {...props} showHead={false} />
          </div>
        );
      },
    };
    return <Table {...tableProps} />;
  }
}

export default HistoryOrderTable;
