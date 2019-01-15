import React, { Component } from 'react';
import { setColumnsWidth, toJS, observer } from '../../utils';
import * as styles from './index.less';
import { Mixin, Table, Button } from '../../components';

@observer
class CertTable extends Mixin {
  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getCert',
    });
  };

  render() {
    const {
      model: { openModal, certs = [] },
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
            dataIndex: 'issued_at',
          },
          {
            title: '抵押锁定期',
            dataIndex: 'frozen_duration',
          },
          {
            title: '剩余节点额度',
            dataIndex: 'remaining_shares',
          },
          {
            title: '',
            dataIndex: '_action',
            render: () => (
              <Button
                onClick={() => {
                  openModal({
                    name: 'RegisterNode',
                  });
                }}>
                注册
              </Button>
            ),
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
