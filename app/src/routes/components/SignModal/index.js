import React, { Component } from 'react';
import { _, ChainX, Inject, Patterns } from '../../../utils';
import { Modal, Button, Input } from '../../../components';
import { PlaceHolder } from '../../../constants';
import * as styles from './index.less';

@Inject(({ accountStore: model }) => ({ model }))
class SignModal extends Component {
  state = {
    acceleration: { label: 1, value: 1 },
    password: '',
    passwordErrMsg: '',
  };

  checkAll = {
    checkPassword: () => {
      const { password } = this.state;
      const {
        model: { currentAccount: { encoded } = {} },
      } = this.props;
      const errMsg = Patterns.check('required')(password) || Patterns.check('decode')(encoded, password);
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkPassword'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { acceleration, password, passwordErrMsg } = this.state;
    const {
      globalStore: {
        closeModal,
        modal: {
          data: {
            token: targetToken,
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
      model: { currentAccount },
    } = this.props;
    const token = targetToken || 'PCX';
    return (
      <Modal
        title="交易签名"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                _.isFunction(callback) &&
                  callback({
                    signer: ChainX.account.fromKeyStore(currentAccount.encoded, password),
                    acceleration: acceleration.value,
                    token,
                  });
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
            <div className={styles.speed}>
              <Input.Select
                getOptionLabel={item => `${item.label}${token}`}
                options={[{ label: 1, value: 1 }]}
                value={acceleration}
                onChange={value => {
                  this.setState({ acceleration: value });
                }}>
                ddd
              </Input.Select>
            </div>
            <span className={styles.feevalue}>
              <span>90%销毁，10%支付给打包节点，费用越高打包速度越快</span>
            </span>
          </div>
          <Input.Text
            isPassword
            placeholder={PlaceHolder.password}
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
