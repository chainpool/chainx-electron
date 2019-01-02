import React, { Component } from 'react';
import { Modal, Input, Button, ButtonGroup } from '../../../components';
import { Warn } from '../../components';
import { Patterns } from '../../../utils';
import * as styles from './ForgetAccountModal.less';

class ForgetAccountModal extends Component {
  state = {
    password: '',
    passwordErrMsg: '',
  };
  checkAll = {
    checkPassword: () => {
      const { password } = this.state;
      const errMsg = Patterns.check('required')(password);
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkPassword'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { password, passwordErrMsg } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="忘记账户"
        button={
          <ButtonGroup className={styles.group}>
            <Button
              size="bigger"
              // type="success"
              onClick={() => {
                if (checkAll.confirm()) {
                  closeModal();
                }
              }}>
              取消
            </Button>
            <Button
              style={{ marginLeft: 16 }}
              size="bigger"
              type="success"
              onClick={() => {
                if (checkAll.confirm()) {
                  closeModal();
                }
              }}>
              确定
            </Button>
          </ButtonGroup>
        }>
        <div className={styles.forgetAccountModal}>
          <Input.Text
            isPassword
            placeholder="输入密码"
            label="密码"
            value={password}
            errMsg={passwordErrMsg}
            onChange={value => {
              this.setState({ password: value });
            }}
            onBlur={checkAll.checkPassword}
          />
          <Warn className={styles.warn}>确保您已备份账户，否则您的账户将无法找回</Warn>
        </div>
      </Modal>
    );
  }
}

export default ForgetAccountModal;
