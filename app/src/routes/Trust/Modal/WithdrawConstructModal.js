import React, { Component } from 'react';
import { Modal, Input, Button } from '@components';

class WithdrawConstructModal extends Component {
  render() {
    const {
      accountStore: { closeModal },
    } = this.props;

    function construct() {
      closeModal();
      console.log('construct');
    }

    return (
      <Modal
        title="构造多签提现"
        button={
          <Button size="full" type="confirm" onClick={construct}>
            确定
          </Button>
        }>
        <div>
          <Input.Text label="提现列表" />
          <Input.Text isTextArea label="待签原文" rows={2} />
          <Input.Text isPassword placeholder="输入热私钥密码" />
        </div>
      </Modal>
    );
  }
}

export default WithdrawConstructModal;
