import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, ButtonGroup, Button } from '../../components';
import { Inject } from '../../utils';
import { toJS } from '@utils';

@Inject(({ accountStore }) => ({ accountStore }))
class NodeTable extends Component {
  render() {
    const {
      activeIndex,
      model: { openModal, trustIntentions = [], validatorIntentions = [], waitingIntentions = [], myIntentions = [] },
      accountStore: { currentAccount = {} },
    } = this.props;
    const dataSources = {
      0: trustIntentions,
      1: validatorIntentions,
      2: waitingIntentions,
      3: myIntentions,
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
          dataIndex: 'account',
          render: value => (value === currentAccount.address ? '本账户' : value),
        },
        {
          title: '自投票数',
          ellipse: true,
          dataIndex: 'selfVoteShow',
        },
        {
          title: '总得票数',
          dataIndex: 'totalNominationShow',
        },
        {
          title: '奖池金额',
          dataIndex: 'jackpotShow',
        },
        {
          title: '我的投票',
          dataIndex: 'nominationShow',
        },
        {
          title: '赎回冻结',
          dataIndex: 'revocationsTotalShow',
        },
        {
          title: '待领利息',
          dataIndex: 'interest',
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
                        nomination: item.nomination,
                        nominationShow: item.nominationShow,
                      },
                    });
                  }}>
                  投票
                </Button>
              )}
              {item.revocationsTotal ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'UnFreezeModal',
                      data: {
                        account: item.account,
                      },
                    });
                  }}>
                  解冻
                </Button>
              ) : null}
              <Button>提息</Button>
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
