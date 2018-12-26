import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { InputHorizotalList } from '../../components';
import { Patterns } from '../../../utils';

class AddAddressModal extends Component {
  state = {
    chain: '',
    chainErrMsg: '',
    address: '',
    addressErrMsg: '',
    label: '',
    labelErrMsg: '',
  };
  checkAll = {
    checkChain: () => {
      const { chain } = this.state;
      const errMsg = Patterns.check('required')(chain);
      this.setState({ chainErrMsg: errMsg });
      return errMsg;
    },
    checkAddress: () => {
      const { address } = this.state;
      const errMsg = Patterns.check('required')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkLabel: () => {
      const { label } = this.state;
      const errMsg =
        Patterns.check('required')(label) || Patterns.check('smaller')(label.length, 12, '不能超过12个字符');
      this.setState({ labelErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkChain', 'checkAddress', 'checkLabel'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { chain, chainErrMsg, address, addressErrMsg, label, labelErrMsg } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="添加地址"
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
          <InputHorizotalList
            left={
              <Input.Select
                label="选择链"
                value={chain}
                errMsg={chainErrMsg}
                options={[{ label: 'ChainX', value: 'ChainX' }]}
                onChange={value => this.setState({ chain: value })}
                onBlur={checkAll.checkChain}
              />
            }
            right=""
          />
          <Input.Text
            label="添加地址"
            value={address}
            errMsg={addressErrMsg}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}
          />
          <Input.Text
            label="标签"
            placeholder="12字符以内"
            value={label}
            errMsg={labelErrMsg}
            onChange={value => this.setState({ label: value })}
            onBlur={checkAll.checkLabel}
          />
        </div>
      </Modal>
    );
  }
}

export default AddAddressModal;
