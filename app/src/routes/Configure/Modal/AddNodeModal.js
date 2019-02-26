import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';
import * as styles from './AddNodeModal.less';

class AddNodeModal extends Component {
  state = {
    name: '',
    nameErrMsg: '',
    address: '',
    addressErrMsg: '',
  };
  checkAll = {
    checkName: () => {
      const { name } = this.state;
      const errMsg =
        Patterns.check('required')(name) || Patterns.check('smallerOrEqual')(name.length, 12, '12字符以内');
      this.setState({ nameErrMsg: errMsg });
      return errMsg;
    },
    checkAddress: () => {
      const { address } = this.state;
      const errMsg = Patterns.check('required')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkName', 'checkAddress'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { name, nameErrMsg, address, addressErrMsg } = this.state;
    const {
      model: { closeModal, dispatch },
    } = this.props;
    return (
      <Modal
        title="添加节点"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                dispatch({
                  type: 'updateNode',
                  payload: {
                    action: 'add',
                    name,
                    address,
                  },
                });
                closeModal();
              }
            }}>
            确定
          </Button>
        }>
        <div className={styles.addNodeModal}>
          <Input.Text
            placeholder="12个字符以内"
            label="名称"
            value={name}
            errMsg={nameErrMsg}
            onChange={value => {
              this.setState({ name: value.slice(0, 12) });
            }}
            onBlur={checkAll.checkName}
          />
          <Input.Text
            placeholder="wss://abcd.com:6789"
            label={
              <div>
                节点地址<span className={styles.assetData}>(提供核心资产数据)</span>
              </div>
            }
            value={address}
            errMsg={addressErrMsg}
            onChange={value => {
              this.setState({ address: value });
            }}
            onBlur={checkAll.checkAddress}
          />
        </div>
      </Modal>
    );
  }
}

export default AddNodeModal;
