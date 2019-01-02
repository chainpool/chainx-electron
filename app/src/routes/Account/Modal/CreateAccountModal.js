import React, { Component } from 'react';
import { Modal, Input, Button, ButtonGroup } from '../../../components';
import { Patterns } from '../../../utils';
import * as styles from './CreateAccountModal.less';

class CreateAccountModal extends Component {
  state = {
    step: 1,
    mnemonicWord: new Array(12).fill('').map((item, index) => index),
    MnemonicWordErrMsg: '',
    secretKey: '',
    secretKeyErrMsg: '',
  };
  checkAll = {
    checkMnemonicWord: () => {
      const { mnemonicWord } = this.state;
      const errMsg = mnemonicWord.some(item => {
        return !!Patterns.check('required')(item);
      })
        ? '按顺序输入您的助记词，并以空格键区分'
        : '';
      this.setState({ MnemonicWordErrMsg: errMsg });
      return errMsg;
    },
    checkSecretKey: () => {
      const { secretKey } = this.state;
      const errMsg = Patterns.check('required')(secretKey, '私钥错误，请核对后重新输入');
      this.setState({ secretKeyErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      const { step } = this.state;
      return [['checkMnemonicWord', 'checkSecretKey'][step - 1]].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { step, mnemonicWord } = this.state;
    const {
      model: { openModal },
    } = this.props;
    return (
      <Modal
        title={
          <span>
            {step === 1 ? '备份助记词' : null}
            {step === 2 ? '验证助记词' : null}(<span className={styles.step}>{step}</span>/3)
          </span>
        }>
        <div className={styles.createAccountModal}>
          {step === 1 ? (
            <>
              <div className={styles.title}>
                <div>温馨提醒：</div>
                不要将您的备份助记词存储在您的电脑上，或者网上某处。任何能够访问您备份助记词的人就能取用您的资金。
              </div>
              <ul>
                {mnemonicWord.map((item, index) => (
                  <li key={index}>
                    <Input.Text
                      className={styles.word}
                      label=""
                      value={mnemonicWord[index]}
                      errMsg={''}
                      onChange={value => {
                        mnemonicWord.splice(index, 1, value);
                        this.setState({ mnemonicWord });
                      }}
                    />
                  </li>
                ))}
              </ul>
              <div className={styles.conformContainer}>
                <Button
                  size="bigger"
                  type="confirm"
                  onClick={() => {
                    this.setState({
                      step: step + 1,
                    });
                  }}>
                  我已备份
                </Button>
              </div>
            </>
          ) : (
            <div>
              <ul>
                {mnemonicWord.map((item, index) => (
                  <li key={index}>
                    <Input.Text
                      className={styles.word}
                      label=""
                      value={mnemonicWord[index]}
                      errMsg={''}
                      onChange={value => {
                        mnemonicWord.splice(index, 1, value);
                        this.setState({ mnemonicWord });
                      }}
                    />
                  </li>
                ))}
              </ul>
              <div className={styles.remember}>按顺序确认您的助记词</div>
              <ul className={styles.inmemory}>
                {mnemonicWord.map((item, index) => (
                  <li key={index}>
                    <Input.Text
                      className={styles.word}
                      label=""
                      value={mnemonicWord[index]}
                      errMsg={''}
                      onChange={value => {
                        mnemonicWord.splice(index, 1, value);
                        this.setState({ mnemonicWord });
                      }}
                    />
                  </li>
                ))}
              </ul>
              <div className={styles.conformContainer}>
                <ButtonGroup>
                  <Button
                    size="bigger"
                    onClick={() => {
                      this.setState({
                        step: step - 1,
                      });
                    }}>
                    返回上一步
                  </Button>
                  <Button
                    size="bigger"
                    type="confirm"
                    onClick={() => {
                      openModal({
                        name: 'SetPasswordModal',
                        data: {
                          step: 3,
                        },
                      });
                    }}>
                    完成
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

export default CreateAccountModal;
