import React, { Component } from 'react';
import { observer, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';
import { IncreaseTime } from '../components';

@observer
class NodeManageTable extends Component {
  render() {
    const {
      model: { openModal, nodes = [], dispatch },
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
            render: (value, item) => `${value}/ms`,
          },
          {
            title: '连接节点数',
            dataIndex: 'links',
          },
          {
            title: '同步状态',
            dataIndex: 'syncStatus',
          },
          {
            title: '',
            dataIndex: '_action',
            width: 200,
            render: (value, item, index) => (
              <ButtonGroup>
                <Button onClick={() => {}}>停止同步</Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'OperationNodeModal',
                      data: {
                        action: 'update',
                        name: item.name,
                        address: item.address,
                        callback: ({ action, name, address }) => {
                          dispatch({
                            type: 'updateNode',
                            payload: {
                              action,
                              index,
                              name,
                              address,
                            },
                          });
                        },
                      },
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
                        callback: () => {
                          dispatch({
                            type: 'updateNode',
                            payload: {
                              action: 'delete',
                              index,
                            },
                          });
                        },
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
