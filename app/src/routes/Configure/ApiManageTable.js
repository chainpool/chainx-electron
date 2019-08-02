import React from 'react';
import { observer, parseQueryString, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Button, ButtonGroup, FormattedMessage, Mixin, Table } from '../../components';

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
            title: <FormattedMessage id={'Type'} />,
            dataIndex: 'type',
            render: v => <FormattedMessage id={v} />,
          },
          {
            title: <FormattedMessage id={'Name'} />,
            dataIndex: 'name',
          },
          {
            title: <FormattedMessage id={'ApiAddress'} />,
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
                      <FormattedMessage id={'Change'} />
                    </Button>
                    <Button
                      onClick={() => {
                        openModal({
                          name: 'DeleteApiModal',
                          data: {
                            title: <FormattedMessage id={'DeleteApi'} />,
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
      dataSource: api,
    };
    return <Table {...tableProps} />;
  }
}

export default ApiManageTable;
