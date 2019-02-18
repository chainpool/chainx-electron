import React, { Component } from 'react';
import { Inject } from '@utils';
import { Button, ButtonGroup, Table } from '../../components';
import * as styles from './index.less';

@Inject(({ trustStore }) => ({ trustStore }))
class SettingTable extends Component {
  render() {
    const {
      trustStore: { info, openModal },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '链',
          dataIndex: 'chain',
        },
        {
          title: '节点状态',
          dataIndex: 'connected',
          render: connected => {
            return connected ? '已连接' : '未连接';
          },
        },
        {
          title: '热公钥/地址',
          ellipse: true,
          dataIndex: 'hotPubKey',
        },
        {
          title: '冷公钥/地址',
          dataIndex: 'coldPubKey',
        },
        {
          title: '',
          dataIndex: '_action',
          render: () => (
            <ButtonGroup>
              <Button onClick={() => openModal({ name: 'ImportHotPrivateKeyModal' })}>导入热公钥</Button>
              <Button>设置节点</Button>
            </ButtonGroup>
          ),
        },
      ],
      dataSource: [info],
    };

    return <Table {...tableProps} />;
  }
}

export default SettingTable;
