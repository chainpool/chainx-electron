import React, { Component } from 'react';
import { setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';
import miniLogo from '../../resource/miniLogo.png';

class PrimaryAssetTable extends Component {
  render() {
    const { widths } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'data1',
            render: value => (
              <div className={styles.miniLogo}>
                <img src={miniLogo} alt="miniLogo" />
                <span>{value}</span>
              </div>
            ),
          },
          {
            title: '简称',
            dataIndex: 'data2',
          },
          {
            title: '可用余额',
            dataIndex: 'data3',
          },
          {
            title: '投票冻结',
            dataIndex: 'data4',
          },
          {
            title: '赎回冻结',
            dataIndex: 'data5',
          },
          {
            title: '交易冻结',
            dataIndex: 'data6',
          },
          {
            title: '总余额',
            dataIndex: 'data7',
          },
          {
            title: '',
            dataIndex: 'data1',
            render: () => (
              <ButtonGroup>
                <Button type="primary">领币</Button>
                <Button>转账</Button>
              </ButtonGroup>
            ),
          },
        ],
        widths
      ),
      dataSource: [
        {
          data1: 'Polkadot ChainX Polkadot ChainXPolkadot ChainXPolkadot ChainX',
          data2: 'PCX',
          data3: '24,000.240',
          data4: '10,000.000',
          data5: '0.000',
          data6: '0.000',
          data7: '14,000.240',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default PrimaryAssetTable;
