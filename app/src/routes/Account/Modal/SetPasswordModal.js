import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';
import * as styles from './SetPasswordModal.less';

class SetPasswordModal extends Component {
  state = {
    label: '',
    labelErrMsg: '',
    password: '',
    passwordErrMsg: '',
    confirmPassword: '',
    confirmPasswordErrMsg: '',
  };
  checkAll = {
    checkLabel: () => {
      const { label } = this.state;
      const errMsg = Patterns.check('required')(label) || Patterns.check('smaller')(label.length, 12, '12字符以内');
      this.setState({ labelErrMsg: errMsg });
      return errMsg;
    },
    checkPassword: () => {
      const { password } = this.state;
      const errMsg =
        Patterns.check('required')(password) || Patterns.check('smaller')(6, password.length, '密码至少包含6个字符');
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    checkConfirmPassword: () => {
      const { confirmPassword } = this.state;
      const errMsg = Patterns.check('required')(confirmPassword);
      this.setState({ confirmPasswordErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkLabel', 'checkPassword', 'checkConfirmPassword'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { label, labelErrMsg, password, passwordErrMsg, confirmPassword, confirmPasswordErrMsg } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title={
          <span>
            设置密码 (<span className={styles.step}>2</span>/2)
          </span>
        }
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                closeModal();
              }
            }}>
            完成
          </Button>
        }>
        <div className={styles.setPasswordModal}>
          <Input.Text
            placeholder="12字符以内"
            label="标签"
            value={label}
            errMsg={labelErrMsg}
            onChange={value => {
              this.setState({ label: value });
            }}
            onBlur={checkAll.checkLabel}
          />
          <Input.Text
            isPassword
            placeholder="密码至少包含6个字符"
            label="密码"
            value={password}
            errMsg={passwordErrMsg}
            onChange={value => {
              this.setState({ password: value });
            }}
            onBlur={checkAll.checkPassword}
          />
          <Input.Text
            isPassword
            placeholder="重复输入密码"
            label="确认密码"
            value={confirmPassword}
            errMsg={confirmPasswordErrMsg}
            onChange={value => {
              this.setState({ confirmPassword: value });
            }}
            onBlur={checkAll.checkConfirmPassword}
          />
        </div>
      </Modal>
    );
  }
}

export default SetPasswordModal;
