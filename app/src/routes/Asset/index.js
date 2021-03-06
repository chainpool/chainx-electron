import React from 'react';
import { Button, FormattedMessage, Icon, Mixin, RouterGo } from '../../components';
import { TableTitle } from '../components';
import { PATH } from '../../constants';
import PrimaryAssetTable from './PrimaryAssetTable';
import CrossChainAssetTable from './CrossChainAssetTable';
import DepositModal from './Modal/DepositModal';
import WithdrawModal from './Modal/WithdrawModal';
import TransferModal from './Modal/TransferModal';
import CrossChainBindModal from './Modal/CrossChainBindModal';
import GetCollarModal from './Modal/GetCollarModal';
import GetCollarModalSDOT from './Modal/GetCollarModalSDOT';
import StopDepositModal from './Modal/StopDepositModal';
import WithdrawWarnModal from './Modal/WithdrawWarnModal';
import LockPositionListModal from './Modal/LockPositionListModal';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    this.fetchPoll(() =>
      dispatch({
        type: 'getAccountAssets',
      })
    );
  };

  render() {
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;
    const props = {
      ...this.props,
      widths: [220, 152, 152, 152, 152, 152, undefined],
    };

    return (
      <div className={styles.asset}>
        <ul>
          <li>
            <TableTitle title={<FormattedMessage id="ChainXAsset" />}>
              <ul>
                <li>
                  <Button type="blank" Ele="div">
                    <RouterGo go={{ pathname: PATH.addressManage }}>
                      <Icon name="icon-dizhiguanli" />
                      <FormattedMessage id="Contact" />
                    </RouterGo>
                  </Button>
                </li>
              </ul>
            </TableTitle>
            <PrimaryAssetTable {...props} />
          </li>
          <li>
            <TableTitle title={<FormattedMessage id="CrossChainAssets" />}>
              {
                <ul>
                  <li>
                    <Button type="blank" Ele="div">
                      <RouterGo go={{ pathname: PATH.depositWithdrawRecord }}>
                        <Icon name="icon-chongtijilu" />
                        <FormattedMessage id="DepositWithdrawalRecords" />
                      </RouterGo>
                    </Button>
                  </li>
                </ul>
              }
            </TableTitle>
            <CrossChainAssetTable {...props} />
          </li>
        </ul>
        {name === 'DepositModal' ? <DepositModal {...this.props} /> : null}
        {name === 'WithdrawModal' ? <WithdrawModal {...this.props} /> : null}
        {name === 'TransferModal' ? <TransferModal {...this.props} /> : null}
        {name === 'CrossChainBindModal' ? <CrossChainBindModal {...this.props} /> : null}
        {name === 'GetCollarModal' ? <GetCollarModal {...this.props} /> : null}
        {name === 'GetCollarModalSDOT' ? <GetCollarModalSDOT {...this.props} /> : null}
        {name === 'StopDepositModal' ? <StopDepositModal {...this.props} /> : null}
        {name === 'WithdrawWarnModal' ? <WithdrawWarnModal {...this.props} /> : null}
        {name === 'LockPositionListModal' ? <LockPositionListModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Asset;
