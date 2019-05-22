import React, { Component } from 'react';
import { observer, parseQueryString, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup, Mixin, FormattedMessage } from '../../components';

@observer
class NodeManageTable extends Mixin {
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
        target: 'Node',
      },
    });
  };
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
            title: <FormattedMessage id={'Type'} />,
            dataIndex: 'type',
            render: v => <FormattedMessage id={v} />,
          },
          {
            title: <FormattedMessage id={'Name'} />,
            dataIndex: 'name',
            render: v => (v === 'ThisMachine' ? <FormattedMessage id={v} /> : v),
          },
          {
            title: <FormattedMessage id={'NodeAddress'} />,
            dataIndex: 'address',
          },
          {
            title: <FormattedMessage id={'NetDelay'} />,
            dataIndex: 'delay',
            render: value => {
              if (value === 'timeOut')
                return (
                  <span className={'red'}>
                    <FormattedMessage id={'OverTime'} />
                  </span>
                );
              return <span className={value > 300 ? 'yellow' : 'green'}>{value ? `${value}ms` : ''}</span>;
            },
          },

          {
            title: <FormattedMessage id={'BlockHeight'} />,
            dataIndex: 'block',
            render: value => value || '--',
          },
          {
            title: <FormattedMessage id={'SyncStatus'} />,
            dataIndex: 'syncStatus',
            render: value => <span className={value !== '100.00%' && value !== '--' ? 'red' : null}>{value}</span>,
          },
          {
            title: <FormattedMessage id={'ConnectedPeers'} />,
            dataIndex: 'links',
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
                          name: 'OperationNodeModal',
                          data: {
                            action: 'update',
                            name: item.name,
                            address: item.address,
                            callback: ({ action, name, address }) => {
                              dispatch({
                                type: 'updateNodeOrApi',
                                payload: {
                                  target: 'Node',
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
                      <FormattedMessage id={'Change'} />
                    </Button>
                    <Button
                      onClick={() => {
                        openModal({
                          name: 'DeleteNodeModal',
                          data: {
                            title: <FormattedMessage id={'DeleteNode'} />,
                            callback: () => {
                              dispatch({
                                type: 'updateNodeOrApi',
                                payload: {
                                  target: 'Node',
                                  action: 'delete',
                                  index,
                                },
                              });
                            },
                          },
                        });
                      }}>
                      <FormattedMessage id={'Delete'} />
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
