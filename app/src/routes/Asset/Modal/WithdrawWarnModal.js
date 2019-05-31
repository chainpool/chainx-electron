import React, { Component } from 'react';
import { Modal, Button, FormattedMessage } from '../../../components/index';
import * as styles from './WithdrawWarnModal.less';
import { _ } from '../../../utils';

class WithdrawWarnModal extends Component {
  render() {
    const {
      globalStore: { modal: { data: { callback } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title="提现提醒"
        button={
          <div>
            <Button
              type="confirm"
              size="full"
              onClick={() => {
                _.isFunction(callback) && callback();
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          </div>
        }>
        <div className={styles.desc}>
          推荐用户提现至充值来源地址（已绑定地址），而非各类交易所地址，这可加快信托人的审核速度, 加速提现处理。
          超过5BTC的大额提现需要由原BTC充值地址（已绑定地址）返回。建议BTC大额充值用户提走一部分，仅剩少量参与体验。
        </div>
      </Modal>
    );
  }
}

export default WithdrawWarnModal;
