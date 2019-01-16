import React, { Component } from 'react';
import { Button, ButtonGroup, Modal, Table } from '../../../components';
import * as styles from './UnFreezeModal.less';
import { Inject, moment_helper, toJS } from '../../../utils';

@Inject(({ chainStore }) => ({ chainStore }))
class UnFreezeModal extends Component {
  render() {
    const {
      model: { intentions },
      chainStore: { blockNumber },
      globalStore: {
        modal: { data: { account = '' } = {} },
      },
    } = this.props;
    const node = intentions.filter(item => item.account === account)[0] || {};

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '冻结金额',
          dataIndex: '1',
        },
        {
          title: () => (
            <span>
              到期时间<span className={styles.desc}>(预估)</span>
            </span>
          ),
          dataIndex: '0',
          render: v => {
            return moment_helper.formatHMS(Date.now() + (Number(blockNumber) - Number(v)) * 2000);
          },
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
      dataSource: node.revocations || [],
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
