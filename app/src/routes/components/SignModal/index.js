import React, { Component } from 'react';
import { _, Patterns } from '../../../utils';
import { Modal, Button, Input } from '../../../components';
import * as styles from './index.less';

class SignModal extends Component {
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
      globalStore: {
        closeModal,
        modal: {
          data: {
            callback,
            description = [
              { name: '操作', value: '挂单' },
              { name: '交易对', value: 'PCX /BTC' },
              { name: '方向', value: '买入' },
              { name: '报价', value: '0.00032424' },
              { name: '账户', value: '5DeCxFFfGv5eR7JNDasJa6K2fiPuCVP8W2fiPuCVP8W' },
            ],
          } = {},
        } = {},
      },
    } = this.props;
    return (
      <Modal
        title="交易签名"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                _.isFunction(callback) && callback();
                closeModal();
              }
            }}>
            签名
          </Button>
        }>
        <div className={styles.signModal}>
          <ul>
            {description.map((item = {}, index) => (
              <li key={index}>
                <span>{item.name}</span>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
          <div className={styles.fee}>
            <span>交易费用</span>
            <span className={styles.feevalue}>
              0.001PCX <span>(90%销毁，10%支付给打包节点)</span>
            </span>
            <div className={styles.speed}>
              <Input.Select>ddd</Input.Select>
            </div>
          </div>
          <Input.Text
            isPassword
            placeholder="输入密码"
            label=""
            value={password}
            errMsg={passwordErrMsg}
            onChange={value => {
              this.setState({ password: value });
            }}
            onBlur={checkAll.checkPassword}
          />
        </div>
      </Modal>
    );
  }
}

export default SignModal;
