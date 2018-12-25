import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { Patterns } from '../../../utils';

class TransferModal extends Component {
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
        title="链内转账"
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
            prefix="ChainX"
            label="接收人地址"
            value={address}
            errMsg={addressErrMsg}
            options={[{ label: 1, value: 1 }]}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}
          />
          <InputHorizotalList
            left={
              <Input.Text
                suffix="PCX"
                label="转账数量"
                value={amount}
                errMsg={amountErrMsg}
                onChange={value => this.setState({ amount: value })}
                onBlur={checkAll.checkAmount}
              />
            }
            right={<FreeBalance value={'200.000'} unit={'PCX'} />}
          />
        </div>
      </Modal>
    );
  }
}

export default TransferModal;
