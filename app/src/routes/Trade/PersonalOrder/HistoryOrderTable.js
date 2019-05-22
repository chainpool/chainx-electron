import React from 'react';
import SwitchPair from '../Mixin/SwitchPair';
import { _, observer, setBlankSpace, setColumnsWidth } from '../../../utils';

import * as styles from './index.less';
import { FormattedMessage, Icon, Table } from '../../../components';
import { OrderStatus } from '../../../constants';

@observer
class HistoryOrderTable extends SwitchPair {
  constructor(props) {
    super(props);
    const { historyOrderList = [] } = props;
    this.state = {
      historyOrderList,
    };
  }

  getHistoryAccountOrder = async () => {
    const {
      model: { dispatch },
    } = this.props;
    this.subscribeHistoryAccountOrder = await dispatch({
      type: 'getHistoryAccountOrder',
    });
  };

  componentWillUnsubscribe = () => {
    this.subscribeHistoryAccountOrder && this.subscribeHistoryAccountOrder.unsubscribe();
  };

  componentUpdate = prevProps => {
    const { historyOrderList: prevHistoryOrderList } = prevProps;
    const { historyOrderList } = this.props;
    const { historyOrderList: stateHistoryOrderList } = this.state;
    if (!_.isEqual(prevHistoryOrderList, historyOrderList)) {
      this.changeState({
        historyOrderList: historyOrderList.map((item = {}) => {
          const findOne =
            stateHistoryOrderList.filter(
              (one = {}) => one.index === item.index && one.accountid === item.accountid
            )[0] || {};
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
    const widths = [130, 80, 100, 70, undefined, undefined, 220, undefined, undefined, 100];
    const { changeExpandIsOpen, getHistoryAccountOrder } = this;
    const { historyOrderList } = this.state;
    const {
      model: { historyAccountPageTotal, dispatch, showCurrent },
    } = this.props;
    const tableProps = {
      tableHeight: [36, 42, 36, 36],
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: <FormattedMessage id={'Time'} />,
            dataIndex: 'timeShow',
            ellipse: 10,
          },
          {
            title: <FormattedMessage id={'OrderNumber'} />,
            ellipse: true,
            dataIndex: 'index',
          },
          {
            title: <FormattedMessage id={'TradingPair'} />,
            dataIndex: 'index',
            render: (value, item) => `${item.filterPair.assets}/${item.filterPair.currency}`,
          },
          {
            title: <FormattedMessage id={'Direction'} />,
            dataIndex: 'direction',
            render: value =>
              value === 'Buy' ? (
                <span className={'green'}>
                  <FormattedMessage id={'Buy'} />
                </span>
              ) : (
                <span className={'red'}>
                  <FormattedMessage id={'Sell'} />
                </span>
              ),
          },
          {
            title: <FormattedMessage id={'OrderPrice'} />,
            dataIndex: 'priceShow',
            render: (value, item) => setBlankSpace(value, item.filterPair.currency),
          },
          {
            title: <FormattedMessage id={'OrderAmount'} />,
            dataIndex: 'amountShow',
            render: (value, item) => setBlankSpace(value, item.filterPair.assets),
          },
          {
            title: (
              <>
                <FormattedMessage id={'FactFilled'} />/<FormattedMessage id={'FilledPercent'} />%
              </>
            ),
            dataIndex: 'hasfillAmountShow',
            render: (value, item) =>
              setBlankSpace(setBlankSpace(value, item.filterPair.assets), `(${item.hasfillAmountPercent})`),
          },
          {
            title: <FormattedMessage id={'FilledAverage'} />,
            dataIndex: 'averagePriceShow',
            render: (value, item) => (item.hasfillAmount === 0 ? '--' : setBlankSpace(value, item.filterPair.currency)),
          },
          {
            title: <FormattedMessage id={'FilledTotal'} />,
            dataIndex: 'sumShow',
            render: (value, item) => (item.hasfillAmount === 0 ? '--' : setBlankSpace(value, item.filterPair.currency)),
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item) => {
              let statusShow = '未知';
              switch (item.status) {
                case OrderStatus.Filled:
                  statusShow = <FormattedMessage id={'FullFilled'} />;
                  break;
                case OrderStatus.ParitialFillAndCanceled:
                  statusShow = <FormattedMessage id={'PartialFillAndCanceled'} />;
                  break;
                case OrderStatus.Canceled:
                  statusShow = <FormattedMessage id={'Cancelled'} />;
                  break;
              }
              return (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    changeExpandIsOpen(item.index);
                  }}>
                  {statusShow}
                  {item.expand && item.expand.length ? (
                    <Icon name={item.expandIsOpen ? 'triangle-top' : 'triangle-bottom'} className={styles.pull} />
                  ) : null}
                </span>
              );
            },
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
                ellipse: 10,
              },
              {
                title: '本链交易ID',
                dataIndex: 'id',
              },
              {
                title: '对手方',
                dataIndex: 'other_userShow',
                render: value => {
                  return (
                    <div className={styles.otherFace}>
                      <FormattedMessage id={'CounterParty'} />：{value}
                    </div>
                  );
                },
              },
              {
                title: 'none',
              },
              {
                title: 'none',
              },
              {
                title: 'none',
              },
              {
                title: '成交量',
                dataIndex: 'amountShow',
                render: (value, item) =>
                  setBlankSpace(setBlankSpace(value, item.filterPair.assets), `(${item.hasfillAmountPercent})`),
              },
              {
                title: '成交均价',
                dataIndex: 'priceShow',
                render: (value, item) => setBlankSpace(value, item.filterPair.currency),
              },
              {
                title: '成交总额',
                dataIndex: 'totalShow',
                render: (value, item) => setBlankSpace(value, item.filterPair.currency),
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

    const pagination = {
      total: historyAccountPageTotal,
      onPageChange: async page => {
        await dispatch({
          type: 'changeModel',
          payload: {
            historyAccountCurrentPage: page,
          },
        });
        this.fetchPoll(getHistoryAccountOrder);
      },
    };
    return <Table {...tableProps} pagination={pagination} location={this.props.location} searchFilter={showCurrent} />;
  }
}

export default HistoryOrderTable;
