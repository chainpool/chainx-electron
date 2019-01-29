import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, Clipboard, Button, ButtonGroup } from '../../components';

class AddressTable extends Component {
  render() {
    const {
      model: { openModal, dispatch, addresses = [] },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '标签',
          dataIndex: 'label',
          render: value => <span>{value}</span>,
          width: 200,
        },
        {
          title: '链',
          width: 200,
          dataIndex: 'chain',
        },
        {
          title: '地址',
          dataIndex: 'address',
          render: value => <Clipboard width={320}>{value}</Clipboard>,
        },
        {
          title: '',
          dataIndex: '_action',
          width: 200,
          render: (value, column, index) => (
            <ButtonGroup>
              <Button
                onClick={() => {
                  openModal({
                    name: 'EditLabelModal',
                    data: {
                      index,
                    },
                  });
                }}>
                修改标签
              </Button>
              <Button
                onClick={() => {
                  openModal({
                    name: 'ConfirmAndCancelModal',
                    data: {
                      title: '删除地址',
                      callback: () => {
                        dispatch({
                          type: 'removeAddress',
                          payload: index,
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
      dataSource: addresses,
    };
    return <Table {...tableProps} />;
  }
}

export default AddressTable;
