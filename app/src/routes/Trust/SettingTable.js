import React, { Component } from 'react';
import { Inject } from '@utils';
import { Button, ButtonGroup, Table } from '../../components';
import * as styles from './index.less';

@Inject(({ trustStore }) => ({ trustStore }))
class SettingTable extends Component {
  render() {
    const {
      trustStore: { trusts, openModal },
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
          render: value => {
            switch (value) {
              case true:
                return '已连接';
              case false:
                return <span className="red">超时</span>;
              default:
                return <span className="red">未连接</span>;
            }
          },
        },
        {
          title: '热公钥/地址',
          ellipse: true,
          dataIndex: 'hotPubKey',
        },
        {
          title: '冷公钥/地址',
          ellipse: true,
          dataIndex: 'coldPubKey',
        },
        {
          title: '',
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {item.decodedHotPrivateKey ? (
                <Button type="disabeld">已导入</Button>
              ) : (
                <Button onClick={() => openModal({ name: 'ImportHotPrivateKeyModal', data: { chain: item.chain } })}>
                  导入热私钥
                </Button>
              )}

              <Button
                onClick={() =>
                  openModal({
                    name: 'NodeSettingModal',
                    data: {
                      chain: item.chain,
                      node: item.node,
                    },
                  })
                }>
                设置节点
              </Button>
            </ButtonGroup>
          ),
        },
      ],
      dataSource: trusts,
    };

    return <Table {...tableProps} />;
  }
}

export default SettingTable;
