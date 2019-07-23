import React, { Component } from 'react';
import * as styles from './index.less';
import { Mixin, Table } from '../../components';

class ProposalSwitchTrustee extends Mixin {
  render() {
    const {
      model: { name },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '节点名',
          dataIndex: 'name',
        },
        {
          title: '节点地址',
          dataIndex: 'address',
        },
        {
          title: '热公钥',
          dataIndex: 'hotEntity',
        },
        {
          title: '冷公钥',
          dataIndex: 'coldEntity',
        },
      ],
      dataSource: [
        {
          name: 'buildlinks',
          address: 'wweeeeeeee',
          hotEntity: '123333',
          coldEntity: '12244fggyyy',
        },
      ],
    };
    return (
      <div className={styles.ProposalSwitchTrustee}>
        <div className={styles.signList} />
        <Table {...tableProps} />
      </div>
    );
  }
}

export default ProposalSwitchTrustee;
