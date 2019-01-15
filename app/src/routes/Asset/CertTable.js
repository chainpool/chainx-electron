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
      model: { openModal, certs },
      widths,
    } = this.props;
    console.log(toJS(certs), '====');

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'data1',
          },
          {
            title: '证书发放日期',
            dataIndex: 'data2',
          },
          {
            title: '抵押锁定期',
            dataIndex: 'data3',
          },
          {
            title: '剩余节点额度',
            dataIndex: 'data4',
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
      dataSource: new Array(1).fill({}).map(() => ({
        data1: 'zhengshu',
        data2: '2018-10-31',
        data3: '30天',
        data4: '45',
      })),
    };
    return <Table {...tableProps} />;
  }
}

export default CertTable;
