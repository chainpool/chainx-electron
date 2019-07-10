import React, { Component } from 'react';
import { Modal, Table } from '../../../components';
import * as styles from './LockPositionListModal.less';
import { observer } from '../../../utils';

@observer
class LockPositionListModal extends Component {
  render() {
    const {
      model: { accountLock = [] },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: 'BTC 锁仓地址',
          dataIndex: 'address',
        },
        {
          title: '锁仓总额',
          dataIndex: 'amountShow',
        },
      ],
      dataSource: accountLock,
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

export default LockPositionListModal;
