import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, ButtonGroup, Button } from '../../components';

class NodeTable extends Component {
  render() {
    const {
      model: { openModal },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '排名',
          width: 50,
          dataIndex: 'data1',
        },
        {
          title: '名称',
          dataIndex: 'data2',
        },
        {
          title: '账户地址',
          ellipse: true,
          dataIndex: 'data3',
        },
        {
          title: '自投票数',
          ellipse: true,
          dataIndex: 'data4',
        },
        {
          title: '总得票数',
          dataIndex: 'data5',
        },
        {
          title: '奖池金额',
          dataIndex: 'data6',
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
          render: () => (
            <ButtonGroup>
              <Button
                onClick={() => {
                  openModal({
                    name: 'VoteModal',
                  });
                }}>
                投票
              </Button>
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
      dataSource: [
        {
          data1: '1',
          data2: 'name1name1na',
          data3: '19zdMbaZnD8ze6XUZuVTYtVQ419zdMbaZnD8ze6XUZuVTYtVQ4',
          data4: '132,783',
          data5: '12.64937460',
          data6: '30,000',
          data7: '32,783',
          data8: '32,783',
          data9: '32,783',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default NodeTable;
