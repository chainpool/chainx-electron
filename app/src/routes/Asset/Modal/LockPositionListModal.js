import React, { Component } from 'react';
import { FormattedMessage, Modal, RouterGo, Table } from '../../../components';
import { blockChain } from '../../../constants';
import * as styles from './LockPositionListModal.less';
import { observer, showAssetName } from '../../../utils';

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
          title: <FormattedMessage id={'LockAddress'} />,
          dataIndex: 'address',
          render: value => (
            <RouterGo isOutSide go={{ pathname: blockChain.address(value) }}>
              {value}
            </RouterGo>
          ),
        },
        {
          title: (
            <span>
              <FormattedMessage id={'LockTotalBalance'} />
            </span>
          ),
          dataIndex: 'amountShow',
        },
      ],
      dataSource: accountLock,
    };

    return (
      <Modal
        title={
          <span>
            <FormattedMessage id={'LockList'} />({showAssetName(token)})
          </span>
        }>
        <div className={styles.LockPositionListModal}>
          <Table {...tableProps} />
        </div>
      </Modal>
    );
  }
}

export default LockPositionListModal;
