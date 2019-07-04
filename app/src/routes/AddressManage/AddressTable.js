import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, Clipboard, Button, ButtonGroup, FormattedMessage } from '../../components';

class AddressTable extends Component {
  render() {
    const {
      model: { openModal, dispatch, addresses = [] },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'Label'} />,
          dataIndex: 'label',
          render: value => <span>{value}</span>,
          width: 200,
        },
        {
          title: <FormattedMessage id={'Chain'} />,
          width: 200,
          dataIndex: 'chain',
        },
        {
          title: <FormattedMessage id={'Address'} />,
          dataIndex: 'address',
          render: value => <Clipboard>{value}</Clipboard>,
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
                    name: 'EditAddressLabelModal',
                    data: {
                      index,
                    },
                  });
                }}>
                <FormattedMessage id={'ModifyLabel'} />
              </Button>
              <Button
                onClick={() => {
                  openModal({
                    name: 'ConfirmAndCancelModal',
                    data: {
                      title: <FormattedMessage id={'DeleteAddress'} />,
                      callback: () => {
                        dispatch({
                          type: 'removeAddress',
                          payload: index,
                        });
                      },
                    },
                  });
                }}>
                <FormattedMessage id={'Delete'} />
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
