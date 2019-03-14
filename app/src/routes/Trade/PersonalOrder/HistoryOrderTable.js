import React from 'react';
import SwitchPair from '../Mixin/SwitchPair';
import { _, observer, setBlankSpace, setColumnsWidth } from '../../../utils';

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
    const { historyOrderList: stateHistoryOrderList } = this.state;
    if (!_.isEqual(prevHistoryOrderList, historyOrderList)) {
      this.changeState({
        historyOrderList: historyOrderList.map((item = {}) => {
          const findOne = stateHistoryOrderList.filter((one = {}) => one.index === item.index)[0] || {};
          return {
            ...findOne,
            ...item,
          };
        }),
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
    const widths = [undefined, undefined, 100, 100, undefined, undefined, undefined, undefined, undefined, 50];
    const { changeExpandIsOpen } = this;
    const { historyOrderList } = this.state;
    const {
      model: { dispatch },
    } = this.props;
    const tableProps = {
      tableHeight: [36, 42, 36, 36],
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
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
            dataIndex: 'createTimeShow',
            render: (value, item) => `${item.filterPair.assets}/${item.filterPair.currency}`,
          },
          {
            title: '方向',
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
            dataIndex: 'status',
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item) => (
              <span
                onClick={() => {
                  dispatch({
                    type: 'getFillAccountOrder',
                    payload: {
                      accountId: item.accountid,
                      index: item.index,
                    },
                  }).then(() => {
                    changeExpandIsOpen(item.index);
                  });
                }}>
                <Icon
                  name={item.expandIsOpen && item.expand && item.expand.length ? 'triangle-bottom' : 'triangle-top'}
                  className={styles.pull}
                />
              </span>
            ),
          },
        ],
        widths
      ),

      dataSource: historyOrderList,
      noDataTip: this.props.noDataTip,
      expandedRowRender: (item = {}) => {
        const props = {
          tableHeight: [36, 36],
          className: styles.tableContainer,
          columns: setColumnsWidth(
            [
              {
                title: '时间',
                dataIndex: 'time',
              },
              {
                title: '本链交易ID',
                dataIndex: 'id',
              },
              {
                title: '对手方',
                width: 200,
                dataIndex: 'taker_user',
                render: value => {
                  return <div className={styles.otherFace}>对手方：{value}</div>;
                },
              },
              {
                title: 'wu',
                dataIndex: '_action',
              },
              {
                title: 'wu',
                dataIndex: '_action',
              },
              {
                title: 'wu',
                dataIndex: '_action',
              },
              {
                title: '成交量',
                dataIndex: 'amount',
              },
              {
                title: '成交均价',
                dataIndex: 'price',
              },
              {
                title: '成交总额(BTC)',
                dataIndex: 'amount',
              },
              {
                title: '',
                dataIndex: '_action',
              },
            ],
            widths
          ),
          dataSource: item.expand || [],
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
