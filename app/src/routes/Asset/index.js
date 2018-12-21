import React from 'react';
import { Mixin, Table, Icon } from '../../components';
import { TableTitle } from '../components';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {};

  render() {
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: 'name',
          dataIndex: 'name',
        },
        {
          title: 'age',
          dataIndex: 'age',
        },
      ],
      dataSource: [
        {
          name: 'weixiaoyi1',
          age: 18,
        },
        {
          name: 'weixiaoyi2',
          age: 80,
        },
        {
          name: 'weixiaoyi3',
          age: 120,
        },
        {
          name: 'weixiaoyi4',
          age: 120,
        },
        {
          name: 'weixiaoyi5',
          age: 120,
        },
      ],
    };
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

        <Table {...tableProps} />
      </div>
    );
  }
}

export default Asset;
