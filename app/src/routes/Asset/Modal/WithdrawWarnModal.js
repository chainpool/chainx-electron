import React, { Component } from 'react';
import { Modal, Button, FormattedMessage, LanguageContent } from '../../../components/index';
import * as styles from './WithdrawWarnModal.less';
import { _ } from '../../../utils';

class WithdrawWarnModal extends Component {
  render() {
    const {
      globalStore: { modal: { data: { callback } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title={<LanguageContent zh={'提现提醒'} en={'Withdrawal reminder'} />}
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
          <p>
            <LanguageContent
              zh={
                '推荐用户提现至充值来源地址（已绑定地址），而非各类交易所地址，这可加快信托人的审核速度, 加速提现处理。'
              }
              en={
                'It is recommended that users withdraw BTC to the original deposit address (binded address) instead of the various exchange addresses, which can speed up the review of the trustee and the withdrawal process.'
              }
            />
          </p>
          <p>
            <LanguageContent
              zh={
                '超过5BTC的大额提现需要由原BTC充值地址（已绑定地址）返回。建议BTC大额充值用户提走一部分，仅剩少量参与体验。'
              }
              en={
                'BTC withdrawal in large amounts (larger than 5BTC) is recommended to withdraw to the address of deposit, rather than the address of various exchanges to speed up both the audit and withdrawal processes. It is recommended that users with large amount of BTC withdraw most of the assets, leaving only a small amount to participate.'
              }
            />
          </p>
        </div>
      </Modal>
    );
  }
}

export default WithdrawWarnModal;
