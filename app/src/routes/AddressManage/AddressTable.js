import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, Clipboard, Button, ButtonGroup } from '../../components';

class AddressTable extends Component {
  render() {
    const {
      model: { openModal },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '标签',
          dataIndex: 'data1',
          render: value => <span className="blue">{value}</span>,
        },
        {
          title: '链',
          dataIndex: 'data2',
        },
        {
          title: '地址',
          dataIndex: 'data3',
          render: value => <Clipboard width={200}>{value}</Clipboard>,
        },
        {
          title: '',
          dataIndex: '_action',
          render: () => (
            <ButtonGroup>
              <Button
                onClick={() => {
                  openModal({
                    name: 'EditLabelModal',
                  });
                }}>
                修改标签
              </Button>
              <Button
                onClick={() => {
                  openModal({
                    name: 'DeleteAddressModal',
                  });
                }}>
                删除
              </Button>
            </ButtonGroup>
          ),
        },
      ],
      dataSource: [
        {
          data1: 'name1',
          data2: 'ChainX',
          data3: '5E3ZjvzDuMebxjZyYNyzkM9zZrDNeEVA29u5E3ZkEB6b5zHxKSAVkEB',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default AddressTable;
