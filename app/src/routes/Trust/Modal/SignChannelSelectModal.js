import React, { Component } from 'react';
import { Button, FormattedMessage, Modal } from '../../../components';
import * as styles from './SignChannelSelectModal.less';

class SignChannelSelectModal extends Component {
  render() {
    const {
      model: { dispatch, openModal, closeModal },
    } = this.props;

    return (
      <Modal
        title={'签名'}
        button={
          <Button size="full" type="confirm" onClick={() => {}}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div>哈哈哈哈哈</div>
      </Modal>
    );
  }
}

export default SignChannelSelectModal;
