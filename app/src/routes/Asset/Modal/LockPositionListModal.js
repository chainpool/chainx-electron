import React, { Component } from 'react';
import { Modal, Table } from '../../../components';
import * as styles from './LockPositionListModal.less';
import { Inject } from '../../../utils';

@Inject(({ chainStore }) => ({ chainStore }))
class LockPoditionListModal extends Component {
  render() {
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          //width: 150,
          title: 'BTC 锁仓地址',
          dataIndex: 'address',
        },
        {
          title: '锁仓总额',
          dataIndex: 'amount',
        },
      ],
      dataSource: [
        {
          address: '19zdMbaZnD8ze6XUZuVTYt8ze6XUZuVTYt',
          amount: '1,000,000',
        },
      ],
    };

    return (
      <Modal title={'锁仓列表'}>
        <div className={styles.LockPositionListModal}>
          <Table {...tableProps} />
        </div>
      </Modal>
    );
  }
}

export default LockPoditionListModal;
