import React, { Component } from 'react';
import { setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';

class NodeManageTable extends Component {
  render() {
    const {
      model: { openModal },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '类别',
            dataIndex: 'data1',
          },
          {
            title: '名称',
            dataIndex: 'data2',
          },
          {
            title: '节点地址',
            dataIndex: 'data3',
          },
          {
            title: '网络延迟',
            dataIndex: 'data4',
          },
          {
            title: '连接节点数',
            dataIndex: 'data5',
          },
          {
            title: '同步状态',
            dataIndex: 'data6',
          },
          {
            title: '',
            dataIndex: '_action',
            width: 200,
            render: () => (
              <ButtonGroup>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'WithdrawModal',
                    });
                  }}>
                  停止同步
                </Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'DeleteNodeModal',
                    });
                  }}>
                  修改
                </Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'DeleteNodeModal',
                      data: {
                        title: '删除节点',
                      },
                    });
                  }}>
                  删除
                </Button>
              </ButtonGroup>
            ),
          },
        ],
        widths
      ),
      dataSource: [
        {
          data1: '系统默认',
          data2: '本机私有',
          data3: 'ws://localhost:6789',
          data4: '1ms',
          data5: '5个',
          data6: '88.88%',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default NodeManageTable;
