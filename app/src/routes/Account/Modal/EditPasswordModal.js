import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';

class EditPasswordModal extends Component {
  state = {
    primaryPassword: '',
    primaryPasswordErrMsg: '',
    password: '',
    passwordErrMsg: '',
    confirmPassword: '',
    confirmPasswordErrMsg: '',
  };
  checkAll = {
    checkPrimaryPassword: () => {
      const { primaryPassword } = this.state;
      const errMsg = Patterns.check('required')(primaryPassword);
      this.setState({ primaryPasswordErrMsg: errMsg });
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
      return ['checkPrimaryPassword', 'checkPassword', 'checkConfirmPassword'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const {
      primaryPassword,
      primaryPasswordErrMsg,
      password,
      passwordErrMsg,
      confirmPassword,
      confirmPasswordErrMsg,
    } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="修改密码"
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
        <div>
          <Input.Text
            isPassword
            placeholder="输入密码"
            label="原密码"
            value={primaryPassword}
            errMsg={primaryPasswordErrMsg}
            onChange={value => {
              this.setState({ primaryPassword: value });
            }}
            onBlur={checkAll.checkPrimaryPassword}
          />
          <Input.Text
            isPassword
            placeholder="密码至少包含6个字符"
            label="新密码"
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

export default EditPasswordModal;
