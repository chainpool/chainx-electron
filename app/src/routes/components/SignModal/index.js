import React, { Component } from 'react';
import { _, ChainX, Inject, Patterns, resOk } from '../../../utils';
import { Modal, Button, Input } from '../../../components';
import { PlaceHolder } from '../../../constants';
import * as styles from './index.less';

@Inject(({ accountStore: model }) => ({ model }))
class SignModal extends Component {
  state = {
    acceleration: { label: '0.0001', value: '1' },
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
        nativeAssetName,
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
            onClick={async () => {
              if (checkAll.confirm()) {
                if (_.isFunction(callback)) {
                  const result = await callback();
                  const extrinsic = result.extrinsic;
                  extrinsic.signAndSend(
                    ChainX.account.fromKeyStore(currentAccount.encoded, password),
                    { acceleration: acceleration.value },
                    (err, res) => {
                      if (!err) {
                        resOk(res) && _.isFunction(result.success) && result.success(res);
                      } else {
                        _.isFunction(result.fail) && result.fail(err);
                      }
                      closeModal();
                    }
                  );
                }
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
                getOptionLabel={item => `${item.label}${nativeAssetName}`}
                options={[acceleration]}
                value={acceleration}
                onChange={value => {
                  this.setState({ acceleration: value });
                }}
              />
            </div>
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
