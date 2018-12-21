import React, { Component } from 'react';
import { setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button } from '../../components';

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
            render: () => <Button>注册</Button>,
          },
        ],
        widths
      ),
      dataSource: [
        {
          data1: 'Polkadot ChainX',
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
