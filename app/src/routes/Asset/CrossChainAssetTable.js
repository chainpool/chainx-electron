import React from 'react';
import { _, formatNumber, observer, setColumnsWidth, showAssetName } from '../../utils';
import * as styles from './index.less';
import { Button, ButtonGroup, FormattedMessage, Mixin, Table, Amount } from '../../components';
import { Balance, HoverTip } from '../components';
import miniLogo from '../../resource/miniLogo.png';
import sdotLogo from '../../resource/xdot.png';
import btcIcon from '../../resource/btc.png';
import LBTCIcon from '../../resource/LBTC.png';

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
      model: { openModal, crossChainAccountAssetsWithZero, accountLock, setPrecision },
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
                <img
                  src={
                    item.name === 'BTC'
                      ? btcIcon
                      : item.name === 'SDOT'
                      ? sdotLogo
                      : item.name === 'L-BTC'
                      ? LBTCIcon
                      : miniLogo
                  }
                  alt="miniLogo"
                />
                <span>
                  <HoverTip tip={item.desc}> {value}</HoverTip>
                </span>
                <span className={styles.shortName}>({showAssetName(item.name)})</span>
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
            render: (value, item) => <Amount value={value} precision={item.precision} />,
          },
          {
            title: <FormattedMessage id={'WithdrawalReserved'} />,
            dataIndex: 'reservedWithdrawal',
            render: (value, item) =>
              item.name === 'L-BTC' || item.name === 'SDOT' ? (
                <Balance value={setPrecision(value, item.name)} />
              ) : (
                <Amount value={value} precision={item.precision} />
              ),
          },
          {
            title: <FormattedMessage id={'DexReserved'} />,
            dataIndex: 'reservedDexSpot',
            render: (value, item) =>
              item.name === 'L-BTC' ? (
                <Balance value={setPrecision(value, item.name)} />
              ) : (
                <Amount value={value} precision={item.precision} />
              ),
          },
          {
            title: <FormattedMessage id={'TotalBalance'} />,
            dataIndex: 'total',
            render: (value, item) => <Amount value={value} precision={item.precision} />,
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item) => {
              const isSDOT = item.name === 'SDOT';
              const isBTC = item.name === 'BTC';
              const isLBTC = item.name === 'L-BTC';
              return (
                <ButtonGroup>
                  {/*BTC充值*/}
                  {isBTC && _.get(item, 'limitProps.CanDeposit') && (
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
                      <FormattedMessage id={'Deposit'} />
                    </Button>
                  )}

                  {/*SDOT映射 */}
                  {isSDOT && (
                    <Button
                      type="disabled"
                      onClick={() => {
                        openModal({
                          name: 'CrossChainBindModal',
                          data: {
                            token: item.name,
                            trusteeAddr: item.trusteeAddr,
                          },
                        });
                      }}>
                      <FormattedMessage id={'Mapping'} />
                    </Button>
                  )}

                  {/*LBTC锁仓 */}
                  {isLBTC && (
                    <Button
                      type="disabled"
                      onClick={() => {
                        openModal({
                          name: 'CrossChainBindModal',
                          data: {
                            token: item.name,
                            trusteeAddr: item.trusteeAddr,
                          },
                        });
                      }}>
                      <FormattedMessage id={'LockPosition'} />
                    </Button>
                  )}

                  {/*LBTC锁仓列表 */}
                  {isLBTC && accountLock && accountLock.length > 0 ? (
                    <Button
                      onClick={() => {
                        openModal({
                          name: 'LockPositionListModal',
                          data: {
                            token: item.name,
                          },
                        });
                      }}>
                      <FormattedMessage id={'LookUp'} />
                    </Button>
                  ) : null}

                  {/*BTC提现*/}
                  {isBTC && _.get(item, 'limitProps.CanWithdraw') && (
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
                  )}
                  {/*BTC和SDOT转账*/}
                  {(isSDOT || isBTC) && _.get(item, 'limitProps.CanTransfer') && (
                    <Button
                      type="disabled"
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
                  )}
                </ButtonGroup>
              );
            },
          },
        ],
        widths
      ),
      dataSource: _.orderBy(crossChainAccountAssetsWithZero, 'tokenName'),
    };
    return <Table {...tableProps} />;
  }
}

export default CrossChainAssetTable;
