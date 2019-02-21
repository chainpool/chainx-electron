import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, Table } from '../../components';
import { HoverTip } from '../components';
import { Inject, isEmpty, formatNumber } from '../../utils';

const zeroPlaceHolder = '-';

@Inject(({ accountStore, globalStore }) => ({ accountStore, globalStore }))
class NodeTable extends Component {
  render() {
    const {
      activeIndex,
      model: {
        dispatch,
        openModal,
        trustIntentions = [],
        validators = [],
        backupValidators = [],
        validatorsWithMyNomination = [],
      },
      accountStore: { currentAccount = {}, currentAddress },
      globalStore: { nativeAssetPrecision = 0 },
    } = this.props;

    const dataSources = {
      0: trustIntentions,
      1: validators,
      2: backupValidators,
      3: validatorsWithMyNomination,
    };

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '排名',
          width: 85,
          dataIndex: 'name',
          render: (value, record, index) => {
            return `${index + 1}${record.isActive ? '' : '（退选）'}`;
          },
        },
        {
          title: '名称',
          dataIndex: 'name',
          render: (value, item) => <HoverTip tip={item.about + ' '}>{value}</HoverTip>,
        },
        {
          title: '账户地址',
          ellipse: true,
          dataIndex: 'address',
          render: value => (value === currentAccount.address ? '本账户' : value),
        },
        {
          title: '自抵押数',
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
          render: value =>
            isEmpty(value) || parseFloat(value) <= 0
              ? zeroPlaceHolder
              : formatNumber.toPrecision(value, nativeAssetPrecision),
        },
        {
          title: '赎回冻结',
          dataIndex: 'myRevocation',
          render: value =>
            isEmpty(value) || parseFloat(value) <= 0
              ? zeroPlaceHolder
              : formatNumber.toPrecision(value, nativeAssetPrecision),
        },
        {
          title: '待领利息',
          dataIndex: 'myInterest',
          render: value =>
            isEmpty(value) || parseFloat(value) <= 0
              ? zeroPlaceHolder
              : formatNumber.toPrecision(value, nativeAssetPrecision),
        },
        {
          title: '',
          width: 170,
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {currentAddress && item.isActive ? (
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
                        description: [{ name: '操作', value: '提息' }],
                        callback: () => {
                          return dispatch({
                            type: 'claim',
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
      dataSource: dataSources[activeIndex],
    };
    return <Table {...tableProps} />;
  }
}

export default NodeTable;
