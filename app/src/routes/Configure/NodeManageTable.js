import React, { Component } from 'react';
import { observer, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';

@observer
class NodeManageTable extends Component {
  render() {
    const {
      model: { openModal, nodes = [] },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '类别',
            dataIndex: 'type',
          },
          {
            title: '名称',
            dataIndex: 'name',
          },
          {
            title: '节点地址',
            dataIndex: 'address',
          },
          {
            title: '网络延迟',
            dataIndex: 'delay',
          },
          {
            title: '连接节点数',
            dataIndex: 'link',
          },
          {
            title: '同步状态',
            dataIndex: 'syncStatus',
          },
          {
            title: '',
            dataIndex: '_action',
            width: 200,
            render: () => (
              <ButtonGroup>
                <Button onClick={() => {}}>停止同步</Button>
                <Button onClick={() => {}}>修改</Button>
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
      dataSource: nodes,
    };
    return <Table {...tableProps} />;
  }
}

export default NodeManageTable;
