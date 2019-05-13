import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, RouterGo, Table, FormattedMessage } from '../../components';
import { HoverTip, Balance } from '../components';
import { Inject } from '../../utils';
import trusteeImg from '../../resource/trustee2.png';
import inactive from '../../resource/inactive.png';

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
                {item.isTrustee && item.isTrustee.length ? (
                  <HoverTip tip={'负责联合托管⽤户的链外资产'}>
                    <img src={trusteeImg} alt="" />
                  </HoverTip>
                ) : null}
                {!item.isActive && (
                  <HoverTip tip={'无法参与验证节点的选举，并且没有任何收益'}>
                    <img src={inactive} alt="" />
                  </HoverTip>
                )}
              </div>
            );
          },
        },
        {
          title: <FormattedMessage id={'Name'} />,
          ellipse: 10,
          width: 100,
          dataIndex: 'name',
          render: (value, item) => (
            <HoverTip tip={item.about}>
              <div className={styles.overHidden}>
                <RouterGo isOutSide go={{ pathname: item.url }}>
                  {value}
                </RouterGo>
              </div>
            </HoverTip>
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
                  onClick={() => {
                    const vote = () =>
                      openModal({
                        name: 'VoteModal',
                        data: {
                          target: item.account,
                          myTotalVote: item.myTotalVote,
                          isCurrentAccount: item.address === currentAccount.address,
                        },
                      });
                    if (!item.isActive) {
                      openModal({
                        name: 'InactiveVoteConfirmModal',
                        data: {
                          callback: vote,
                        },
                      });
                    } else {
                      vote();
                    }
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
                  <FormattedMessage id={'Unfreeze'} />
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
