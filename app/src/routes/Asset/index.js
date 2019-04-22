import React from 'react';
import { Button, Icon, Mixin, RouterGo } from '../../components';
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
import BtcBindModal from './Modal/BtcBindModal';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({
      type: 'getAccountAssets',
    });
  };

  render() {
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;
    const props = {
      ...this.props,
      widths: [180, 80, 130, 130, undefined, undefined, undefined, 280],
    };

    return (
      <div className={styles.asset}>
        <ul>
          <li>
            <TableTitle title={'ChainX资产'}>
              <ul>
                <li>
                  <Button type="blank" Ele="div">
                    <RouterGo go={{ pathname: PATH.addressManage }}>
                      <Icon name="icon-dizhiguanli" />
                      联系人
                    </RouterGo>
                  </Button>
                </li>
              </ul>
            </TableTitle>
            <PrimaryAssetTable {...props} />
          </li>
          <li>
            <TableTitle title={'跨链资产'}>
              {
                <ul>
                  <li>
                    <Button type="blank" Ele="div">
                      <RouterGo go={{ pathname: PATH.depositWithdrawRecord }}>
                        <Icon name="icon-chongtijilu" />
                        充提记录
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
        {name === 'BtcBindModal' ? <BtcBindModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Asset;
