import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, RouterGo, Table } from '../../components';
import { HoverTip, Balance } from '../components';
import { Inject } from '../../utils';
import trusteeImg from '../../resource/trustee.png';

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
          title: '排名',
          width: 60,
          ellipse: 20,
          dataIndex: 'name',
          render: (value, item, index) => {
            return (
              <div className={styles.trustee}>
                {index + 1}
                {item.isTrustee && item.isTrustee.length ? <img src={trusteeImg} alt="" /> : null}
              </div>
            );
          },
        },
        {
          title: '名称',
          dataIndex: 'name',
          render: (value, item) => (
            <div className={styles.name}>
              <HoverTip tip={item.about + ' '}>
                <RouterGo isOutSide go={{ pathname: item.url }}>
                  {value}
                </RouterGo>
              </HoverTip>
              <span className={styles.leaveOut}>{item.isActive ? '' : '（已退选)'}</span>
            </div>
          ),
        },
        {
          title: '账户地址',
          ellipse: true,
          dataIndex: 'address',
          render: value => (value === currentAccount.address ? '本账户' : value),
        },
        {
          title: '节点抵押',
          ellipse: true,
          dataIndex: 'selfVote',
          render: value => setDefaultPrecision(value),
        },
        {
          title: '总得票数',
          dataIndex: 'totalNomination',
          render: value => setDefaultPrecision(value),
        },
        {
          title: '奖池金额',
          dataIndex: 'jackpot',
          render: value => setDefaultPrecision(value),
        },
        {
          title: '我的投票',
          dataIndex: 'myTotalVote',
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: '赎回冻结',
          dataIndex: 'myRevocation',
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: '待领利息',
          dataIndex: 'myInterest',
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: '',
          width: 170,
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {currentAddress ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'VoteModal',
                      data: {
                        target: item.account,
                        myTotalVote: item.myTotalVote,
                        isCurrentAccount: item.address === currentAccount.address,
                      },
                    });
                  }}>
                  投票
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
                  提息
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
