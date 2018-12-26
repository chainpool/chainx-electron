import React from 'react';
import { Button, Icon, Mixin } from '../../components';
import { BreadCrumb, TableTitle } from '../components';
import AddressTable from './AddressTable';
import AddAddressModal from './Modal/AddAddressModal';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ assetStore: model }) => ({ model }))
class AddressManage extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = () => {
    const {
      model: { openModal },
    } = this.props;
    openModal({
      name: 'AddAddressModal',
    });
  };

  render() {
    const { activeIndex } = this.state;
    const {
      globalStore: {
        modal: { name },
      },
      model: { openModal },
    } = this.props;
    return (
      <div className={styles.addressManage}>
        <BreadCrumb />
        <TableTitle title="地址列表">
          <ul>
            <li>
              <Button
                type="blank"
                onClick={() => {
                  openModal({
                    name: 'AddAddressModal',
                  });
                }}>
                <Icon name="icon-tianjia" />
                添加地址
              </Button>
            </li>
          </ul>
        </TableTitle>
        {activeIndex === 0 ? <AddressTable {...this.props} /> : null}
        {name === 'AddAddressModal' ? <AddAddressModal {...this.props} /> : null}
      </div>
    );
  }
}

export default AddressManage;
