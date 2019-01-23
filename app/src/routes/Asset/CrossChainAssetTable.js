import React, { Component } from 'react';
import { formatNumber, observer, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';
import miniLogo from '../../resource/miniLogo.png';
import btcIcon from '../../resource/btc.png';

@observer
class CrossChainAssetTable extends Component {
  render() {
    const {
      model: { openModal, crossChainAccountAssets },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'tokenName',
            render: (value, asset) => (
              <div className={styles.miniLogo}>
                <img src={asset.name === 'BTC' ? btcIcon : miniLogo} alt="miniLogo" />
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
            dataIndex: 'chain',
          },
          {
            title: '可用余额',
            dataIndex: 'free',
            render: (value, item) => formatNumber.toPrecision(value, item.precision),
          },
          {
            title: '提现冻结',
            dataIndex: 'reservedWithdrawal',
            render: (value, item) => formatNumber.toPrecision(value, item.precision),
          },
          {
            title: '交易冻结',
            dataIndex: 'reservedDexSpot',
            render: (value, item) => formatNumber.toPrecision(value, item.precision),
          },
          {
            title: '总余额',
            dataIndex: 'total',
            render: (value, item) => formatNumber.toPrecision(value, item.precision),
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
                      data: {
                        trusteeAddr: item.trusteeAddr,
                      },
                    });
                  }}>
                  充值
                </Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'WithdrawModal',
                      data: {
                        token: item.name,
                        freeShow: formatNumber.toPrecision(item.free, item.precision),
                        free: item.free,
                      },
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
                        freeShow: formatNumber.toPrecision(item.free, item.precision),
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
      dataSource: crossChainAccountAssets,
    };
    return <Table {...tableProps} />;
  }
}

export default CrossChainAssetTable;
