import React, { Component } from 'react';
import { Button, Modal, Input } from '@components';
import * as styles from './index.less';

class ImportHotPrivateKeyModal extends Component {
  state = {
    privateKey: '',
    password: '',
    confirmedPassword: '',
    passwordErrMsg: '',
  };

  render() {
    /**
     * TODO: 1. 检查各输入项
     * TODO: 2. 真实导入私钥，想一下怎么保存，用什么加密方式
     */
    const { privateKey, password, confirmedPassword } = this.state;

    function importKey() {
      console.log('import key');
    }

    const modalButton = (
      <Button size="full" type="confirm" onClick={importKey}>
        确定
      </Button>
    );

    return (
      <Modal title="导入热公钥" button={modalButton}>
        <div className={styles.hello}>
          <Input.Text
            placeholder="热私钥将加密存储于本地，用于手动提现，请确保本机安全"
            label="热私钥"
            value={privateKey}
            onChange={value => {
              this.setState({ privateKey: value });
            }}
          />
          <Input.Text
            isPassword
            placeholder="密码至少包含8个字符"
            label="热私钥密码"
            value={password}
            onChange={value => {
              this.setState({ password: value });
            }}
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
