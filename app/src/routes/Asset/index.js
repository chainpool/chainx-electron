import React from 'react';
import { Icon, Mixin, Button, RouterGo, Toast } from '../../components';
import { TableTitle } from '../components';
import { PATH } from '../../constants';
import CertTable from './CertTable';
import PrimaryAssetTable from './PrimaryAssetTable';
import CrossChainAssetTable from './CrossChainAssetTable';
import DepositModal from './Modal/DepositModal';
import WithdrawModal from './Modal/WithdrawModal';
import TransferModal from './Modal/TransferModal';
import RegisterNode from './Modal/RegisterNode';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {
    setTimeout(() => {
      Toast.success('委托成功');
    }, 1000);
  };

  render() {
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;
    const props = {
      ...this.props,
      widths: [160, 130, 130, 130, , , , 280],
    };

    return (
      <div className={styles.asset}>
        <ul>
          <li>
            <TableTitle title={'我的证书'} />
            <CertTable {...props} />
          </li>
          <li>
            <TableTitle title={'原生资产'}>
              <ul>
                <li>
                  <Button type="blank">
                    <RouterGo go={{ pathname: PATH.addressManage }}>
                      <Icon name="icon-dizhiguanli" />
                      地址管理
                    </RouterGo>
                  </Button>
                </li>
              </ul>
            </TableTitle>
            <PrimaryAssetTable {...props} />
          </li>
          <li>
            <TableTitle title={'跨链资产'}>
              <ul>
                <li>
                  <Button type="blank">
                    <RouterGo go={{ pathname: PATH.depositWithdrawRecord }}>
                      <Icon name="icon-chongtijilu" />
                      充提记录
                    </RouterGo>
                  </Button>
                </li>
              </ul>
            </TableTitle>
            <CrossChainAssetTable {...props} />
          </li>
        </ul>
        {name === 'DepositModal' ? <DepositModal {...this.props} /> : null}
        {name === 'WithdrawModal' ? <WithdrawModal {...this.props} /> : null}
        {name === 'TransferModal' ? <TransferModal {...this.props} /> : null}
        {name === 'RegisterNode' ? <RegisterNode {...this.props} /> : null}
      </div>
    );
  }
}

export default Asset;
