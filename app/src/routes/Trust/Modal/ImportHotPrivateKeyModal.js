import React, { Component } from 'react';
import { Button, Modal, Input } from '@components';
import * as styles from './ImportHotPrivateKeyModal.less';
import { Patterns } from '../../../utils';
import bip38 from 'bip38';
import wif from 'wif';

class ImportHotPrivateKeyModal extends Component {
  state = {
    hotPrivateKey: '5KN7MzqK5wt2TP1fQCYyHBtDrXdJuXbUzm4A9rKAteGu3Qi5CVR',
    hotPrivateKeyErrMsg: '',
    password: '12345678',
    passwordErrMsg: '',
    confirmedPassword: '12345678',
    confirmedPasswordErrMsg: '',
  };

  checkAll = {
    checkHotPrivateKey: () => {
      const { hotPrivateKey } = this.state;
      const errMsg = Patterns.check('required')(hotPrivateKey) || Patterns.check('isHotPrivateKey')(hotPrivateKey);
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
    checkConfirmedPassword: () => {
      const { confirmedPassword } = this.state;
      const errMsg =
        Patterns.check('required')(confirmedPassword) ||
        Patterns.check('smallerOrEqual')(8, confirmedPassword.length, '密码至少包含8个字符');
      this.setState({ confirmedPasswordErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkHotPrivateKey', 'checkPassword', 'checkConfirmedPassword'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const {
      hotPrivateKey,
      hotPrivateKeyErrMsg,
      password,
      passwordErrMsg,
      confirmedPassword,
      confirmedPasswordErrMsg,
    } = this.state;
    const {
      model: { closeModal, dispatch },
      globalStore: { modal: { data: { chain } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title="导入热私钥"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                const decoded = wif.decode(hotPrivateKey);
                if (decoded && decoded.privateKey) {
                  const decodedHotKey = bip38.encrypt(decoded.privateKey, decoded.compressed, 'chainx');
                  dispatch({
                    type: 'updateTrust',
                    payload: {
                      decodedHotKey,
                      chain,
                    },
                  });
                }
                closeModal();
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
            errMsg={confirmedPasswordErrMsg}
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
