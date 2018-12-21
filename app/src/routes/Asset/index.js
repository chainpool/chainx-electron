import React from 'react';
import { Mixin, Icon } from '../../components';
import { TableTitle } from '../components';
import CertTable from './CertTable';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {};

  render() {
    return (
      <div className={styles.asset}>
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

        <CertTable {...this.props} />
      </div>
    );
  }
}

export default Asset;
