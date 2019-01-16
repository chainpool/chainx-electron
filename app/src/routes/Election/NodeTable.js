import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, ButtonGroup, Button } from '../../components';
import { observer } from '../../utils';
import { toJS } from '@utils';

@observer
class NodeTable extends Component {
  render() {
    const {
      activeIndex,
      model: { openModal, trustIntentions = [], validatorIntentions = [], waitingIntentions = [] },
    } = this.props;
    console.log(activeIndex, toJS(waitingIntentions), '-------------------------------');

    const dataSources = {
      0: trustIntentions,
      1: validatorIntentions,
      2: waitingIntentions,
      3: [],
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
        },
        {
          title: '自投票数',
          ellipse: true,
          dataIndex: 'selfVote',
        },
        {
          title: '总得票数',
          dataIndex: 'totalNomination',
        },
        {
          title: '奖池金额',
          dataIndex: 'jackpot',
        },
        {
          title: '我的投票',
          dataIndex: 'data7',
        },
        {
          title: '赎回冻结',
          dataIndex: 'data8',
        },
        {
          title: '待领利息',
          dataIndex: 'data9',
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
                        target: item.address,
                      },
                    });
                  }}>
                  投票
                </Button>
              )}
              <Button
                onClick={() => {
                  openModal({
                    name: 'UnFreezeModal',
                  });
                }}>
                解冻
              </Button>
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
