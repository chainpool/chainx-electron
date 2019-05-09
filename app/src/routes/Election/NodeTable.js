import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, RouterGo, Table, FormattedMessage } from '../../components';
import { HoverTip, Balance } from '../components';
import { Inject } from '../../utils';
import trusteeImg from '../../resource/trustee2.png';

@Inject(({ accountStore, globalStore }) => ({ accountStore, globalStore }))
class NodeTable extends Component {
  render() {
    const {
      activeIndex,
      model: {
        dispatch,
        openModal,
        validators = [],
        backupValidators = [],
        validatorsWithMyNomination = [],
        setDefaultPrecision,
      },
      accountStore: { currentAccount = {}, currentAddress },
      globalStore: { nativeAssetName },
    } = this.props;

    const dataSources = [validators, backupValidators, validatorsWithMyNomination];

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'Rank'} />,
          width: 100,
          ellipse: 8,
          dataIndex: 'name',
          render: (value, item, index) => {
            return (
              <div className={styles.trustee}>
                {index + 1}
                {item.isTrustee && item.isTrustee.length ? <img src={trusteeImg} alt="" /> : null}
                <span className={styles.leaveOut}>{item.isActive ? '' : '（已退选)'}</span>
              </div>
            );
          },
        },
        {
          title: <FormattedMessage id={'Name'} />,
          width: 110,
          dataIndex: 'name',
          render: (value, item) => (
            <div className={styles.name}>
              <HoverTip tip={item.about + ' '}>
                <RouterGo isOutSide go={{ pathname: item.url }}>
                  {value}
                </RouterGo>
              </HoverTip>
            </div>
          ),
        },
        {
          title: <FormattedMessage id={'AccountAddress'} />,
          ellipse: 10,
          width: 100,
          dataIndex: 'address',
          render: value => (value === currentAccount.address ? '本账户' : value),
        },
        {
          title: <FormattedMessage id={'IntentionSelfNominated'} />,
          ellipse: true,
          dataIndex: 'selfVote',
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'TotalNomination'} />,
          dataIndex: 'totalNomination',
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'JackpotBalance'} />,
          dataIndex: 'jackpot',
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'MyNominations'} />,
          dataIndex: 'myTotalVote',
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: <FormattedMessage id={'UnfreezeReserved'} />,
          dataIndex: 'myRevocation',
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: <FormattedMessage id={'UnclaimedDividend'} />,
          dataIndex: 'myInterest',
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: '',
          width: 150,
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {currentAddress ? (
                <Button
                  {...(item.isActive ? {} : item.myTotalVote > 0 ? {} : { type: 'disabled' })}
                  onClick={() => {
                    openModal({
                      name: 'VoteModal',
                      data: {
                        isActive: item.isActive,
                        target: item.account,
                        myTotalVote: item.myTotalVote,
                        isCurrentAccount: item.address === currentAccount.address,
                      },
                    });
                  }}>
                  <FormattedMessage id={'Nominate'} />
                </Button>
              ) : null}
              {item.myRevocation ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'UnFreezeModal',
                      data: {
                        account: item.account,
                        myRevocations: item.myRevocations,
                      },
                    });
                  }}>
                  解冻
                </Button>
              ) : null}
              {item.myInterest ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'SignModal',
                      data: {
                        description: [{ name: '操作', value: '提息' }, { name: '资产种类', value: nativeAssetName }],
                        callback: () => {
                          return dispatch({
                            type: 'voteClaim',
                            payload: {
                              target: item.account,
                            },
                          });
                        },
                      },
                    });
                  }}>
                  <FormattedMessage id={'ClaimDividend'} />
                </Button>
              ) : null}
            </ButtonGroup>
          ),
        },
      ],
      dataSource: dataSources[activeIndex].sort((a = {}, b = {}) => b.totalNomination - a.totalNomination),
    };
    return <Table {...tableProps} />;
  }
}

export default NodeTable;
