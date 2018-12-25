import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { Patterns } from '../../../utils';

class WithdrawModal extends Component {
  state = {
    address: '',
    addressErrMsg: '',
    amount: '',
    amountErrMsg: '',
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
    const { address, addressErrMsg, amount, amountErrMsg } = this.state;
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
            确认
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
        </div>
      </Modal>
    );
  }
}

export default WithdrawModal;
