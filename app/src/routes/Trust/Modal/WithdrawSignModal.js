import React, { Component } from 'react';
import * as styles from './WithdrawSignModal.less';
import { ButtonGroup, Button, Modal, Input, Icon } from '../../../components';
import wif from 'wif';
import bip38 from 'bip38';
import { Patterns } from '../../../utils';

class WithdrawSignModal extends Component {
  state = {
    activeIndex: 0,
    tx: '',
    signStatus: true,
    redeemScript: '',
    password: '',
    passwordErrMsg: '',
  };

  checkAll = {
    checkPassword: () => {
      const { password } = this.state;
      const { currentTrustNode } = this.props;
      const decodedHotPrivateKey = currentTrustNode.decodedHotPrivateKey;
      const errMsg =
        Patterns.check('required')(password) ||
        Patterns.check('smallerOrEqual')(8, password.length, '密码至少包含8个字符') ||
        Patterns.check('isHotPrivateKeyPassword')(decodedHotPrivateKey, password);
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      const result3 = this.checkAll['checkPassword']();
      return !result3;
    },
  };

  componentDidMount() {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getWithdrawTx',
    }).then(res => {
      if (res) {
        const { tx, signStatus, redeemScript } = res;
        this.setState({
          tx,
          signStatus,
          redeemScript,
        });
      }
    });
  }
  render() {
    const { checkAll } = this;
    const { activeIndex, tx, redeemScript, password, passwordErrMsg } = this.state;
    const {
      model: { openModal, dispatch },
      currentTrustNode,
    } = this.props;

    return (
      <Modal
        title="响应多签提现"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                const decodedHotPrivateKey = currentTrustNode.decodedHotPrivateKey;
                const decryptedKey = bip38.decrypt(decodedHotPrivateKey, password);
                const privateKey = wif.encode(0xef, decryptedKey.privateKey, decryptedKey.compressed);
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [{ name: '操作', value: '响应多签提现' }],
                    callback: () => {
                      return dispatch({
                        type: 'signWithdrawTx',
                        payload: {
                          tx: !activeIndex ? tx : null,
                          redeemScript,
                          privateKey,
                        },
                      });
                    },
                  },
                });
              }
            }}>
            确定
          </Button>
        }>
        <div className={styles.withdrawSign}>
          <div className={styles.sign}>
            <div className={styles.desc}>待签原文：</div>
            <div className={styles.tx}>
              <span>
                {tx}
                <Icon name="icon-wancheng" className={styles.right} />
                正确
              </span>
            </div>
          </div>
          <ButtonGroup className={styles.buttonselect}>
            {['签名', '否决'].map((item, index) => (
              <Button
                type="confirm"
                key={index}
                className={activeIndex === index ? styles.active : null}
                onClick={() => {
                  this.setState({
                    activeIndex: index,
                  });
                }}>
                {item}
              </Button>
            ))}
          </ButtonGroup>
          <Input.Text
            errMsgIsOutside
            isPassword
            value={password}
            errMsg={passwordErrMsg}
            placeholder="输入热私钥密码"
            onChange={value => {
              this.setState({
                password: value,
              });
            }}
            onFocus={() => {
              this.setState({
                passwordErrMsg: '',
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawSignModal;
