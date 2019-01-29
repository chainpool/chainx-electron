import React from 'react';
import { formatNumber, Inject, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Button, ButtonGroup, Mixin, Table } from '../../components';
import miniLogo from '../../resource/miniLogo.png';
import btcIcon from '../../resource/btc.png';

@Inject(({ configureStore }) => ({ configureStore }))
class CrossChainAssetTable extends Mixin {
  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getAccountBTCAddresses' });
  };

  render() {
    const {
      model: { openModal, crossChainAccountAssetsWithZero, btcAddresses },
      configureStore: { isTestNet },
      widths,
    } = this.props;

    const hasBindAddress = btcAddresses.length > 0;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'desc',
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
                {isTestNet ? (
                  <Button
                    type="warn"
                    onClick={() => {
                      openModal({
                        name: 'GetCollarModal',
                      });
                    }}>
                    领币
                  </Button>
                ) : null}
                {hasBindAddress ? (
                  <Button
                    onClick={() => {
                      openModal({
                        name: 'DepositModal',
                        data: {
                          token: item.name,
                          trusteeAddr: item.trusteeAddr,
                        },
                      });
                    }}>
                    充值
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      openModal({
                        name: 'CrossChainBindModal',
                        data: {
                          token: item.name,
                          trusteeAddr: item.trusteeAddr,
                        },
                      });
                    }}>
                    绑定
                  </Button>
                )}
                <Button
                  type={item.free > 0 ? 'primary' : 'disabled'}
                  onClick={() => {
                    openModal({
                      name: 'WithdrawModal',
                      data: {
                        token: item.name,
                        freeShow: formatNumber.toPrecision(item.free, item.precision),
                        free: item.free,
                        chain: item.chain,
                      },
                    });
                  }}>
                  提现
                </Button>
                <Button
                  type={item.free > 0 ? 'primary' : 'disabled'}
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
      dataSource: crossChainAccountAssetsWithZero,
    };
    return <Table {...tableProps} />;
  }
}

export default CrossChainAssetTable;
