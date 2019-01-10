import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';
import * as styles from './UpdateNodeModal.less';

class UpdateNodeModal extends Component {
  state = {
    address: '',
    addressErrMsg: '',
    website: '',
    websiteErrMsg: '',
    participating: true,
  };
  checkAll = {
    checkAddress: () => {
      const { address } = this.state;
      const errMsg = Patterns.check('required')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },

    checkWebsite: () => {
      const { website } = this.state;
      const errMsg =
        Patterns.check('required')(website) || Patterns.check('smaller')(website.length, 32, '不能超过32个字符');
      this.setState({ websiteErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkAddress', 'checkWebsite'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { address, addressErrMsg, website, websiteErrMsg, participating } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="更新节点"
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
        <div className={styles.updateNodeModal}>
          <Input.Text
            prefix="ChainX"
            label="出块地址"
            value={address}
            errMsg={addressErrMsg}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}
          />
          <Input.Text
            label="网址"
            placeholder="32个字符以内"
            value={website}
            errMsg={websiteErrMsg}
            onChange={value => this.setState({ website: value })}
            onBlur={checkAll.checkWebsite}
          />
          <div className={styles.participate}>
            {[{ name: '参选', value: true }, { name: '退选', value: false }].map((item, index) => (
              <button
                key={index}
                className={participating === item.value ? styles.active : null}
                onClick={() => {
                  this.setState({
                    participating: item.value,
                  });
                }}>
                {item.name}
              </button>
            ))}
          </div>
          <div>
            {participating
              ? '请确保您的节点已经部署妥当，否则将会受到惩罚'
              : '退选后无法再接受投票，不会再有奖惩和惩罚'}
          </div>
        </div>
      </Modal>
    );
  }
}

export default UpdateNodeModal;
