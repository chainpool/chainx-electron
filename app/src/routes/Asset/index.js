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
    const setColumnsWidth = (table, widths = []) => {
      return table.map((item, index) => ({
        ...item,
        width: widths[index],
      }));
    };
    const props = {
      ...this.props,
      widths: [100, 100, 100, 200],
      setColumnsWidth,
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
