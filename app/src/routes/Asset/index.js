import React from 'react';
import { Icon, Mixin, Button } from '../../components';
import { TableTitle } from '../components';
import CertTable from './CertTable';
import PrimaryAssetTable from './PrimaryAssetTable';
import CrossChainAssetTable from './CrossChainAssetTable';
import DepositModal from './Modal/DepositModal';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {};

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
            <TableTitle title={'我的证书'}>
              <ul>
                <li>
                  <Button type="blank">
                    <Icon name="icon-caozuojilu" />
                    操作记录
                  </Button>
                </li>
                <li>
                  <Button type="blank">
                    <Icon name="icon-dizhiguanli" />
                    地址管理
                  </Button>
                </li>
              </ul>
            </TableTitle>
            <CertTable {...props} />
          </li>
          <li>
            <TableTitle title={'原生资产'} />
            <PrimaryAssetTable {...props} />
          </li>
          <li>
            <TableTitle title={'跨链资产'}>
              <ul>
                <li>
                  <Button type="blank">
                    <Icon name="icon-chongtijilu" />
                    充提记录
                  </Button>
                </li>
              </ul>
            </TableTitle>
            <CrossChainAssetTable {...props} />
          </li>
        </ul>
        {name === 'DepositModal' ? <DepositModal /> : null}
      </div>
    );
  }
}

export default Asset;
