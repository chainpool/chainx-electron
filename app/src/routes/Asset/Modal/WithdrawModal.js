import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { Patterns } from '../../../utils';
import { PlaceHolder } from '../../../constants';

class WithdrawModal extends Component {
  state = {
    address: '',
    addressErrMsg: '',
    amount: '',
    amountErrMsg: '',
    remark: '',
  };
  checkAll = {
    checkAddress: () => {
      const { address } = this.state;
      const errMsg = Patterns.check('required')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: () => {
      const { amount } = this.state;
      const errMsg = Patterns.check('required')(amount);
      this.setState({ amountErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkAddress', 'checkAmount'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { address, addressErrMsg, amount, amountErrMsg, remark } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="跨链提现"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                closeModal();
              }
            }}>
            确定
          </Button>
        }>
        <div>
          <Input.Select
            prefix="Bitcoin"
            label="收款地址"
            value={address}
            errMsg={addressErrMsg}
            options={[{ label: 1, value: 1 }]}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}
          />
          <InputHorizotalList
            left={
              <Input.Text
                suffix="BTC"
                label="提现数量"
                value={amount}
                errMsg={amountErrMsg}
                onChange={value => this.setState({ amount: value })}
                onBlur={checkAll.checkAmount}
              />
            }
            right={<FreeBalance value={'78'} unit={'BTC'} />}
          />
          <Input.Text
            isTextArea
            rows={4}
            label="备注"
            placeholder={PlaceHolder.setTextAreaLength}
            value={remark}
            onChange={value => this.setState({ remark: value.slice(0, PlaceHolder.getTextAreaLength) })}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawModal;
