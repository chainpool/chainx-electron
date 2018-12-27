import React, { Component } from 'react';
import { Button, ButtonGroup, Modal, Table } from '../../../components';
import * as styles from './UnFreezeModal.less';

class UnFreezeModal extends Component {
  render() {
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '赎回金额',
          dataIndex: 'data1',
        },
        {
          title: '到期时间',
          dataIndex: 'data2',
        },

        {
          title: '',
          dataIndex: '_action',
          render: () => (
            <ButtonGroup>
              <Button type="primary">解冻</Button>
            </ButtonGroup>
          ),
        },
      ],
      dataSource: [
        {
          data1: '1,000,000',
          data2: '2018-12-25 16:27:36',
          data3: '3000,0',
        },
        {
          data1: '1,000,000',
          data2: '2018-12-25 16:27:36',
          data3: '3000,0',
        },
      ],
    };

    return (
      <Modal title="赎回解冻">
        <div className={styles.unFreezeModal}>
          <Table {...tableProps} />
        </div>
      </Modal>
    );
  }
}

export default UnFreezeModal;
