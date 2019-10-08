import React from 'react';
import * as styles from './index.less';
import { FormattedMessage, Mixin, RouterGo, Table, DotInCenterStr } from '../../components';
import { _, Inject, showAssetName, hexPrefix } from '../../utils';
import { blockChain } from '../../constants';

@Inject(({ assetStore }) => ({ assetStore }))
class DepositTable extends Mixin {
  startInit() {
    this.getDepositRecords();
  }

  getDepositRecords = async () => {
    const {
      assetStore: { dispatch },
    } = this.props;

    this.subscribeDepositRecords = await dispatch({ type: 'getDepositRecords' });
  };

  componentWillUnsubscribe = () => {
    this.subscribeDepositRecords && this.subscribeDepositRecords.unsubscribe();
  };

  render() {
    const {
      assetStore: { depositRecords = [], isTestBitCoinNetWork },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'LaunchTime'} />,
          dataIndex: 'time',
        },
        {
          title: <FormattedMessage id={'OriginalChainTradeID'} />,
          dataIndex: 'txid',
          ellipse: 20,
          width: 300,
          render: value => (
            <RouterGo isOutSide go={{ pathname: blockChain.tx(value, isTestBitCoinNetWork()) }}>
              <DotInCenterStr value={hexPrefix(value)} />
            </RouterGo>
          ),
        },
        {
          title: <FormattedMessage id={'Token'} />,
          width: 100,
          dataIndex: 'token',
          render: v => showAssetName(v),
        },
        {
          title: <FormattedMessage id={'Address'} />,
          ellipse: 20,
          width: 300,
          dataIndex: 'address',
          render: value => <DotInCenterStr value={value} />,
        },
        {
          title: <FormattedMessage id={'Amount'} />,
          dataIndex: 'amount',
        },
        // {
        //   title: <FormattedMessage id={'Memo'} />,
        //   ellipse: true,
        //   dataIndex: 'memo',
        // },
        {
          title: <FormattedMessage id={'Status'} />,
          dataIndex: 'statusValue',
          render: (value, item) => {
            if (value.toUpperCase() === 'CONFIRMING') {
              return (
                <>
                  {_.get(item.value, 'confirm')
                    ? `(${_.get(item.value, 'confirm')}/${_.get(item.value, 'totalConfirm')}) `
                    : null}
                  {<FormattedMessage id={value} />}
                </>
              );
            }
            return <FormattedMessage id={value} />;
          },
        },
      ],
      dataSource: depositRecords,
    };
    return (
      <>
        <Table {...tableProps} />
        <div className={styles.notgetdeposit}>
          <strong>
            <FormattedMessage id={'DepositNotReceived'}>
              {msg => {
                const msgs = msg.split('deposit_replace');
                return (
                  <>
                    {msgs[0]}
                    <RouterGo isOutSide go={{ pathname: 'https://scan.chainx.org/crossblocks/bitcoin/claim' }}>
                      {msgs[1]}
                    </RouterGo>
                  </>
                );
              }}
            </FormattedMessage>
          </strong>
        </div>
      </>
    );
  }
}

export default DepositTable;
