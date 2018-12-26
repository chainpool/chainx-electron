import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';

class EditBlockAdressModal extends Component {
  state = {
    address: '',
    addressErrMsg: '',
  };
  checkAll = {
    checkAddress: () => {
      const { address } = this.state;
      const errMsg = Patterns.check('required')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkAddress'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { address, addressErrMsg } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="修改出块地址"
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
          <Input.Text
            prefix="ChainX"
            label="出块地址"
            value={address}
            errMsg={addressErrMsg}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}
          />
        </div>
      </Modal>
    );
  }
}

export default EditBlockAdressModal;
