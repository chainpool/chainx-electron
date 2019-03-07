import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';

class WithdrawConstructModal extends Component {
  state = {
    withDrawIndexSignList: [],
    password: '',
    signInfo: '',
  };
  render() {
    const { withDrawIndexSignList, password, signInfo } = this.state;
    const {
      accountStore: { closeModal },
      model: { normalizedOnChainAllWithdrawList, dispatch },
    } = this.props;

    const options = normalizedOnChainAllWithdrawList.map((item, index) => ({ label: index + 1, value: index }));

    return (
      <Modal
        title="构造多签提现"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              dispatch({
                type: 'buildMultiSign',
                payload: {
                  // unspents:
                },
              });
              closeModal();
            }}>
            确定
          </Button>
        }>
        <div>
          <Input.Select
            multi={true}
            label="选择链"
            options={options}
            onChange={value => {
              this.setState({
                withDrawIndexSignList: value,
              });
            }}
          />
          <Input.Text value={signInfo} isTextArea label="待签原文" rows={2} />
          <Input.Text
            value={password}
            isPassword
            placeholder="输入热私钥密码"
            onChange={value => {
              this.setState({
                password: value,
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawConstructModal;
