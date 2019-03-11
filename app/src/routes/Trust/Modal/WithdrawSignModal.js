import React, { Component } from 'react';
import * as styles from './WithdrawSignModal.less';
import { ButtonGroup, Button, Modal, Input, Icon } from '../../../components';
import { BitcoinTestNet } from '../../../constants';
import wif from 'wif';
import { Patterns } from '../../../utils';

class WithdrawSignModal extends Component {
  state = {
    activeIndex: 0,
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
        Patterns.check('isHotPrivateKeyPassword')(decodedHotPrivateKey, password, decryptedKey => {
          this.decryptedKey = decryptedKey;
        });
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
    });
  }
  render() {
    const { checkAll } = this;
    const { activeIndex, password, passwordErrMsg } = this.state;
    const {
      model: { openModal, dispatch, tx, redeemScript },
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
                const decryptedKey = this.decryptedKey;
                const privateKey = wif.encode(
                  BitcoinTestNet ? 0xef : 0x80,
                  decryptedKey.privateKey,
                  decryptedKey.compressed
                );
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [{ name: '操作', value: `响应多签提现${!activeIndex ? '签名' : '否决'}` }],
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
              <div style={{ maxHeight: 300, overflowY: 'scroll' }}>
                {tx}
                <Icon name="icon-wancheng" className={styles.right} />
                正确
              </div>
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
            isPassword
            value={password}
            errMsg={passwordErrMsg}
            placeholder="输入热私钥密码"
            onChange={value => {
              this.setState({
                password: value,
              });
            }}
            onBlur={checkAll.checkPassword}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawSignModal;
