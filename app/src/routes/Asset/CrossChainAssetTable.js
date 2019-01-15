import React, { Component } from 'react';
import { observer, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';
import miniLogo from '../../resource/miniLogo.png';

@observer
class CrossChainAssetTable extends Component {
  render() {
    const {
      model: { openModal, crossChainAsset = [] },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'name',
            render: value => (
              <div className={styles.miniLogo}>
                <img src={miniLogo} alt="miniLogo" />
                <span>{value}</span>
              </div>
            ),
          },
          {
            title: '简称',
            dataIndex: 'name',
          },
          {
            title: '原链',
            dataIndex: 'data3',
          },
          {
            title: '可用余额',
            dataIndex: 'freeShow',
          },
          {
            title: '提现冻结',
            dataIndex: 'reservedWithdrawalShow',
          },
          {
            title: '交易冻结',
            dataIndex: 'reservedDexSpotShow',
          },
          {
            title: '总余额',
            dataIndex: 'totalShow',
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item) => (
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
                      data: {
                        token: item.name,
                        freeShow: item.freeShow,
                        free: item.free,
                      },
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
      dataSource: crossChainAsset,
    };
    return <Table {...tableProps} />;
  }
}

export default CrossChainAssetTable;
