import React from 'react';
import { _, formatNumber, Inject, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Button, ButtonGroup, Mixin, Table, FormattedMessage } from '../../components';
import { HoverTip } from '../components';
import miniLogo from '../../resource/miniLogo.png';
import sdotLogo from '../../resource/xdot.png';
import btcIcon from '../../resource/btc.png';
import Asset from './components/Asset';

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
            title: <FormattedMessage id={'Name'} />,
            dataIndex: 'tokenName',
            render: (value, asset) => (
              <div className={styles.miniLogo}>
                <img
                  src={asset.name === 'BTC' ? btcIcon : asset.name === 'SDOT' ? sdotLogo : miniLogo}
                  alt="miniLogo"
                />
                <span>
                  <HoverTip tip={asset.desc}> {value}</HoverTip>
                </span>
              </div>
            ),
          },
          {
            title: <FormattedMessage id={'ShortName'} />,
            dataIndex: 'name',
          },
          {
            title: <FormattedMessage id={'OriginalChain'} />,
            dataIndex: 'chain',
          },
          {
            title: <FormattedMessage id={'FreeBalance'} />,
            dataIndex: 'free',
            render: (value, item) => <Asset value={value} precision={item.precision} />,
          },
          {
            title: <FormattedMessage id={'WithdrawalReserved'} />,
            dataIndex: 'reservedWithdrawal',
            render: (value, item) => <Asset value={value} precision={item.precision} />,
          },
          {
            title: <FormattedMessage id={'DexReserved'} />,
            dataIndex: 'reservedDexSpot',
            render: (value, item) => <Asset value={value} precision={item.precision} />,
          },
          {
            title: <FormattedMessage id={'TotalBalance'} />,
            dataIndex: 'total',
            render: (value, item) => <Asset value={value} precision={item.precision} />,
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item) => {
              const isSDOT = item.name === 'SDOT';
              const isBTC = item.name === 'BTC';
              return (
                <ButtonGroup>
                  {isTestNet && isBTC ? (
                    <Button
                      type="warn"
                      onClick={() => {
                        openModal({
                          name: 'GetCollarModal',
                          // name: isSDOT ? 'GetCollarModalSDOT' : 'GetCollarModal',
                        });
                      }}>
                      <FormattedMessage id={'GetFreeCoin'} />
                    </Button>
                  ) : null}
                  {hasBindAddress && isBTC ? (
                    <Button
                      onClick={() => {
                        openModal({
                          name: 'DepositModal',
                          data: {
                            token: item.name,
                            trusteeAddr: item.trusteeAddr,
                            chain: item.chain,
                          },
                        });
                      }}>
                      <FormattedMessage id={'Deposit'} />
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
                      {isBTC ? <FormattedMessage id={'Deposit'} /> : <FormattedMessage id={'Mapping'} />}
                    </Button>
                  )}
                  {!isSDOT ? (
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
                      <FormattedMessage id={'Withdraw'} />
                    </Button>
                  ) : null}

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
                    <FormattedMessage id={'Transfer'} />
                  </Button>
                </ButtonGroup>
              );
            },
          },
        ],
        widths
      ),
      dataSource: _.orderBy(crossChainAccountAssetsWithZero, 'chain'),
    };
    return <Table {...tableProps} />;
  }
}

export default CrossChainAssetTable;
