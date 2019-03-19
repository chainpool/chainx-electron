import React, { Component } from 'react';
import { observer, parseQueryString, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup, Mixin } from '../../components';

@observer
class ApiManageTable extends Mixin {
  startInit = () => {
    this.subscribe();
  };

  subscribe = () => {
    const {
      model: { dispatch },
      history: {
        location: { search },
      },
    } = this.props;
    const bestNode = parseQueryString(search).bestNode;
    dispatch({
      type: 'subscribeNodeOrApi',
      payload: {
        refresh: !bestNode,
        target: 'Api',
      },
    });
  };
  render() {
    const {
      model: { api = [], openModal, dispatch },
      widths = [],
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
            title: 'API地址',
            dataIndex: 'address',
          },
          {
            title: '网络延迟',
            dataIndex: 'delay',
            render: value => <span className={value > 300 ? 'yellow' : 'green'}>{value ? `${value}/ms` : ''}</span>,
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
                {!item.isSystem ? (
                  <>
                    <Button
                      onClick={() => {
                        openModal({
                          name: 'OperationApiModal',
                          data: {
                            action: 'update',
                            name: item.name,
                            address: item.address,
                            callback: ({ action, name, address }) => {
                              dispatch({
                                type: 'updateNodeOrApi',
                                payload: {
                                  target: 'Api',
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
                          name: 'DeleteApiModal',
                          data: {
                            title: '删除节点',
                            callback: () => {
                              dispatch({
                                type: 'updateNodeOrApi',
                                payload: {
                                  target: 'Api',
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
      dataSource: api,
    };
    return <Table {...tableProps} />;
  }
}

export default ApiManageTable;
