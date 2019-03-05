import React, { Component } from 'react';
import { Button, Modal, Input } from '@components';
import * as styles from './ImportHotPrivateKeyModal.less';
import { Patterns } from '../../../utils';

class ImportHotPrivateKeyModal extends Component {
  state = {
    hotPrivateKey: '',
    hotPrivateKeyErrMsg: '',
    password: '',
    confirmedPassword: '',
    passwordErrMsg: '',
  };

  checkAll = {
    checkHotPrivateKey: () => {
      const { hotPrivateKey } = this.state;
      const errMsg = Patterns.check('required')(hotPrivateKey);
      this.setState({ hotPrivateKeyErrMsg: errMsg });
      return errMsg;
    },
    checkPassword: () => {
      const { password } = this.state;
      const errMsg =
        Patterns.check('required')(password) ||
        Patterns.check('smallerOrEqual')(8, password.length, '密码至少包含8个字符');
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkHotPrivateKey', 'checkPassword'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { hotPrivateKey, hotPrivateKeyErrMsg, password, passwordErrMsg, confirmedPassword } = this.state;
    return (
      <Modal
        title="导入热私钥"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
              }
            }}>
            确定
          </Button>
        }>
        <div className={styles.hello}>
          <Input.Text
            placeholder="热私钥将加密存储于本地，用于手动提现，请确保本机安全"
            label="热私钥"
            value={hotPrivateKey}
            errMsg={hotPrivateKeyErrMsg}
            onChange={value => {
              this.setState({ hotPrivateKey: value });
            }}
            onBlur={checkAll.checkHotPrivateKey}
          />
          <Input.Text
            isPassword
            placeholder="密码至少包含8个字符"
            label="热私钥密码"
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
            value={confirmedPassword}
            onChange={value => {
              this.setState({ confirmedPassword: value });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default ImportHotPrivateKeyModal;
