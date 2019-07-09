import React from 'react';
import { _, formatNumber, observer, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Button, ButtonGroup, Mixin, Table, FormattedMessage, Icon } from '../../components';
import { HoverTip } from '../components';
import miniLogo from '../../resource/miniLogo.png';
import sdotLogo from '../../resource/xdot.png';
import btcIcon from '../../resource/btc.png';
import Asset from './components/Asset';

@observer
class CrossChainAssetTable extends Mixin {
  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    this.fetchPoll(() => dispatch({ type: 'getAccountBTCAddresses' }));
  };

  render() {
    const {
      model: { openModal, crossChainAccountAssetsWithZero },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: <FormattedMessage id={'Name'} />,
            dataIndex: 'tokenName',
            render: (value, item) => (
              <div className={styles.miniLogo}>
                <img src={item.name === 'BTC' ? btcIcon : item.name === 'SDOT' ? sdotLogo : miniLogo} alt="miniLogo" />
                <span>
                  <HoverTip tip={item.desc}> {value}</HoverTip>
                </span>
                <span className={styles.shortName}>({item.name})</span>
              </div>
            ),
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
                  <Button
                    onClick={() => {
                      // openModal({
                      //   name: 'CrossChainBindModal',
                      //   data: {
                      //     token: item.name,
                      //     trusteeAddr: item.trusteeAddr,
                      //   },
                      // });
                      isBTC
                        ? openModal({
                            name: 'StopDepositModal',
                          })
                        : openModal({
                            name: 'CrossChainBindModal',
                            data: {
                              token: item.name,
                              trusteeAddr: item.trusteeAddr,
                            },
                          });
                    }}>
                    {isBTC ? (
                      <>
                        <FormattedMessage id={'SuspensionDeposit'}>
                          {msg => (
                            <HoverTip tip={msg}>
                              <Icon name="icon-jinggao" className={styles.jinggaoicon} />
                            </HoverTip>
                          )}
                        </FormattedMessage>

                        <FormattedMessage id={'Deposit'} />
                      </>
                    ) : (
                      <FormattedMessage id={'Mapping'} />
                    )}
                  </Button>
                  {isBTC && (
                    <Button
                      type={item.free > 0 ? 'primary' : 'disabled'}
                      onClick={() => {
                        openModal({
                          name: 'WithdrawWarnModal',
                          data: {
                            callback: () => {
                              openModal({
                                name: 'WithdrawModal',
                                data: {
                                  token: item.name,
                                  freeShow: formatNumber.toPrecision(item.free, item.precision),
                                  free: item.free,
                                  chain: item.chain,
                                },
                              });
                            },
                          },
                        });
                      }}>
                      <FormattedMessage id={'Withdraw'} />
                    </Button>
                  )}

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
