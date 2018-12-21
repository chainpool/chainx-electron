import React from 'react';
import { Icon, Mixin } from '../../components';
import { TableTitle } from '../components';
import CertTable from './CertTable';
import PrimaryAssetTable from './PrimaryAssetTable';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {};

  render() {
    const props = {
      ...this.props,
      widths: [200, 200, 200, 200],
    };
    return (
      <div className={styles.asset}>
        <ul>
          <li>
            <TableTitle title={'资产'}>
              <ul>
                <li>
                  <Icon name="icon-caozuojilu" />
                  操作记录
                </li>
                <li>
                  <Icon name="icon-dizhiguanli" />
                  地址管理
                </li>
              </ul>
            </TableTitle>
            <CertTable {...props} />
          </li>
          <li>
            <TableTitle title={'资产'} />
            <PrimaryAssetTable {...props} />
          </li>
        </ul>
      </div>
    );
  }
}

export default Asset;
