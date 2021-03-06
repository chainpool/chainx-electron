import React from 'react';
import * as styles from './index.less';
import { FormattedMessage, Mixin, RouterGo, Table, DotInCenterStr } from '../../components';
import { observer } from '../../utils';

@observer
class TradeTable extends Mixin {
  componentWillUnsubscribe = () => {
    this.getTradeRecordApi$.unsubscribe();
  };

  render() {
    const {
      model: { tradeRecords = [], tradeRecordsPageTotal, dispatch, loading },
    } = this.props;
    const tableProps = {
      loading: loading.getTradeRecordApi,
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'Time'} />,
          width: 200,
          dataIndex: 'timeShow',
        },
        {
          title: <FormattedMessage id={'CurrentChainID'} />,
          width: 200,
          ellipse: 20,
          dataIndex: 'id',
          render: value => (
            <RouterGo isOutSide go={{ pathname: `https://scan.chainx.org/txs/${value}` }}>
              <DotInCenterStr value={value} />
            </RouterGo>
          ),
        },
        {
          title: <FormattedMessage id={'Operation'} />,
          width: 150,
          dataIndex: 'operation',
          render: value => <FormattedMessage id={value} />,
        },
        {
          title: <FormattedMessage id={'ParamsInfo'} />,
          ellipse: 0,
          dataIndex: 'info',
          render: (v = []) => {
            return (
              <ul className={styles.info}>
                {(v || []).map((item, index) => (
                  <li key={index}>
                    {<FormattedMessage id={item.label} />}:
                    {item.value === 'NoThing' ? (
                      <FormattedMessage id={'NoThing'} />
                    ) : (
                      <div className={styles.value}>{item.value}</div>
                    )}
                    {index === v.length - 1 ? '' : ','}
                  </li>
                ))}
              </ul>
            );
          },
        },
      ],
      dataSource: tradeRecords,
    };

    const pagination = {
      total: tradeRecordsPageTotal,
      onPageChange: async page => {
        this.getTradeRecordApi$ = await dispatch({
          type: 'getTradeRecordApi',
          payload: {
            page,
          },
        });
      },
    };
    return (
      <>
        <Table {...tableProps} location={this.props.location} pagination={pagination} />
      </>
    );
  }
}

export default TradeTable;
