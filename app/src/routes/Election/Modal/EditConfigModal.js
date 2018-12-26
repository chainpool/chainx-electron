import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';
import * as styles from './EditConfigModal.less';

class EditConfigModal extends Component {
  state = {
    website: '',
    websiteErrMsg: '',
    participating: true,
  };
  checkAll = {
    checkWebsite: () => {
      const { website } = this.state;
      const errMsg =
        Patterns.check('required')(website) || Patterns.check('smaller')(website.length, 32, '不能超过32个字符');
      this.setState({ websiteErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkWebsite'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { website, websiteErrMsg, participating } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="修改配置"
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
        <div className={styles.editConfigModal}>
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

export default EditConfigModal;
