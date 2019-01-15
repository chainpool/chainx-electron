import React, { Component } from 'react';
import { setColumnsWidth, toJS, observer, moment_helper } from '../../utils';
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
    console.log(toJS(certs));

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
          {
            title: '',
            dataIndex: '_action',
            render: (value, item = {}) => (
              <Button
                onClick={() => {
                  openModal({
                    name: 'RegisterNode',
                    data: {
                      certName: item.name,
                    },
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
