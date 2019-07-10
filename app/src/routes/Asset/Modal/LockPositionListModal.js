import React, { Component } from 'react';
import { Modal, RouterGo, Table } from '../../../components';
import { blockChain } from '../../../constants';
import * as styles from './LockPositionListModal.less';
import { observer } from '../../../utils';

@observer
class LockPositionListModal extends Component {
  render() {
    const {
      globalStore: {
        modal: {
          data: { token },
        },
      },
      model: { accountLock = [] },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '锁仓地址',
          dataIndex: 'address',
          render: value => (
            <RouterGo isOutSide go={{ pathname: blockChain.address(value) }}>
              {value}
            </RouterGo>
          ),
        },
        {
          title: '锁仓总额 (BTC)',
          dataIndex: 'amountShow',
        },
      ],
      dataSource: accountLock,
    };

    return (
      <Modal title={`锁仓列表 (${token})`}>
        <div className={styles.LockPositionListModal}>
          <Table {...tableProps} />
        </div>
      </Modal>
    );
  }
}

export default LockPositionListModal;
