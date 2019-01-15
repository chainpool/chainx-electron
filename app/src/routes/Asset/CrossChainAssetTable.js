import React, { Component } from 'react';
import { observer, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';
import miniLogo from '../../resource/miniLogo.png';

@observer
class CrossChainAssetTable extends Component {
  render() {
    const {
      model: { openModal },
      widths,
    } = this.props;

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
            title: '原链',
            dataIndex: 'data3',
          },
          {
            title: '可用余额',
            dataIndex: 'data4',
          },
          {
            title: '提现冻结',
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
            dataIndex: '_action',
            render: () => (
              <ButtonGroup>
                <Button
                  type="warn"
                  onClick={() => {
                    openModal({
                      name: 'GetCollarModal',
                    });
                  }}>
                  领币
                </Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'DepositModal',
                    });
                  }}>
                  充值
                </Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'WithdrawModal',
                    });
                  }}>
                  提现
                </Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'TransferModal',
                    });
                  }}>
                  转账
                </Button>
              </ButtonGroup>
            ),
          },
        ],
        widths
      ),
      dataSource: [
        {
          data1: 'Bitcoin',
          data2: 'BTC',
          data3: '24,000',
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

export default CrossChainAssetTable;
