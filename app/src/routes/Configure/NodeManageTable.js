import React, { Component } from 'react';
import { observer, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';

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
            render: value => <span className={value > 300 ? 'yellow' : 'green'}>{value ? `${value}/ms` : ''}</span>,
          },
          {
            title: '连接节点数',
            dataIndex: 'links',
          },
          {
            title: '同步状态',
            dataIndex: 'syncStatus',
            render: value => <span className={value !== '100.00%' ? 'red' : null}>{value}</span>,
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item, index) => (
              <ButtonGroup>
                {item.isLocalhost ? <Button onClick={() => {}}>停止同步</Button> : null}
                {!item.isSystem ? (
                  <>
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
                  </>
                ) : null}
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
