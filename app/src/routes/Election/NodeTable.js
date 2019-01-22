import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, Table } from '../../components';
import { Inject, isEmpty, formatNumber } from '../../utils';

@Inject(({ accountStore, globalStore }) => ({ accountStore, globalStore }))
class NodeTable extends Component {
  render() {
    const {
      activeIndex,
      model: {
        dispatch,
        openModal,
        trustIntentions = [],
        activeValidators = [],
        backupValidators = [],
        validatorsWithMyNomination = [],
      },
      accountStore: { currentAccount = {} },
      globalStore: { nativeAssetPrecision = 0 },
    } = this.props;

    const dataSources = {
      0: trustIntentions,
      1: activeValidators,
      2: backupValidators,
      3: validatorsWithMyNomination,
    };

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '排名',
          width: 50,
          dataIndex: 'name',
          render: (value, record, index) => index + 1,
        },
        {
          title: '名称',
          dataIndex: 'name',
        },
        {
          title: '账户地址',
          ellipse: true,
          dataIndex: 'address',
          render: value => (value === currentAccount.address ? '本账户' : value),
        },
        {
          title: '自投票数',
          ellipse: true,
          dataIndex: 'selfVote',
          render: value => formatNumber.toPrecision(value, nativeAssetPrecision),
        },
        {
          title: '总得票数',
          dataIndex: 'totalNomination',
          render: value => formatNumber.toPrecision(value, nativeAssetPrecision),
        },
        {
          title: '奖池金额',
          dataIndex: 'jackpot',
          render: value => formatNumber.toPrecision(value, nativeAssetPrecision),
        },
        {
          title: '我的投票',
          dataIndex: 'myTotalVote',
          render: value => (isEmpty(value) ? '--' : formatNumber.toPrecision(value, nativeAssetPrecision)),
        },
        {
          title: '赎回冻结',
          dataIndex: 'myRevocation',
          render: value => (isEmpty(value) ? '--' : formatNumber.toPrecision(value, nativeAssetPrecision)),
        },
        {
          title: '待领利息',
          dataIndex: 'myInterest',
          render: value => (isEmpty(value) ? '--' : formatNumber.toPrecision(value, nativeAssetPrecision)),
        },
        {
          title: '',
          width: 210,
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {item.isActive ? null : (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'VoteModal',
                      data: {
                        target: item.account,
                        myTotalVote: item.myTotalVote,
                      },
                    });
                  }}>
                  投票
                </Button>
              )}
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
              {item.interest ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'SignModal',
                      data: {
                        description: [{ name: '操作', value: '提息' }],
                        callback: ({ signer, acceleration }) => {
                          dispatch({
                            type: 'claim',
                            payload: {
                              signer,
                              acceleration,
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
      dataSource: dataSources[activeIndex],
    };
    return <Table {...tableProps} />;
  }
}

export default NodeTable;
