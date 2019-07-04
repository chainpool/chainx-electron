import React from 'react';
import { Button, Icon, Mixin, FormattedMessage } from '../../components';
import { BreadCrumb, TableTitle, ConfirmAndCancelModal } from '../components';
import AddressTable from './AddressTable';
import AddAddressModal from './Modal/AddAddressModal';
import EditLabelModal from './Modal/EditLabelModal';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ addressManageStore: model }) => ({ model }))
class AddressManage extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = () => {};

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
        <TableTitle title={<FormattedMessage id={'AddressList'} />}>
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
                <FormattedMessage id={'AddAddress'} />
              </Button>
            </li>
          </ul>
        </TableTitle>
        {activeIndex === 0 ? <AddressTable {...this.props} /> : null}
        {name === 'AddAddressModal' ? <AddAddressModal {...this.props} /> : null}
        {name === 'EditAddressLabelModal' ? <EditLabelModal {...this.props} /> : null}
        {name === 'ConfirmAndCancelModal' ? <ConfirmAndCancelModal {...this.props} /> : null}
      </div>
    );
  }
}

export default AddressManage;
