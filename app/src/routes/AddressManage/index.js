import React from 'react';
import { Button, Icon, Mixin } from '../../components';
import { BreadCrumb, TableTitle } from '../components';
import AddressTable from './AddressTable';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ assetStore: model }) => ({ model }))
class AddressManage extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = () => {};

  render() {
    const { activeIndex } = this.state;
    return (
      <div className={styles.addressManage}>
        <BreadCrumb />
        <TableTitle title="地址列表">
          <ul>
            <li>
              <Button type="blank">
                <Icon name="icon-tianjia" />
                添加地址
              </Button>
            </li>
          </ul>
        </TableTitle>
        {activeIndex === 0 ? <AddressTable {...this.props} /> : null}
      </div>
    );
  }
}

export default AddressManage;
