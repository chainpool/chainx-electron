import React from 'react';
import { observer, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Mixin, Table } from '../../components';

@observer
class CertTable extends Mixin {
  render() {
    const {
      model: { certs = [] },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'name',
          },
          {
            title: '证书发放日期',
            dataIndex: 'issuedAt',
          },
          {
            title: '抵押锁定期',
            dataIndex: 'frozenDuration',
          },
          {
            title: '剩余节点额度',
            dataIndex: 'remainingShares',
          },
        ],
        widths
      ),
      dataSource: certs,
    };
    return <Table {...tableProps} />;
  }
}

export default CertTable;
