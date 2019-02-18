import React, { Component } from 'react';
import { Button, Modal } from '@components';

class WithdrawSignModal extends Component {
  render() {
    const {
      accountStore: { closeModal },
    } = this.props;

    function sign() {
      closeModal();
      console.log('sign');
    }

    return (
      <Modal
        title="构造多签提现"
        button={
          <Button size="full" type="confirm" onClick={sign}>
            确定
          </Button>
        }>
        <div>hello world</div>
      </Modal>
    );
  }
}

export default WithdrawSignModal;
