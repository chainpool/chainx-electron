import React, { Component } from 'react';
import { Modal, Input, Button, Icon } from '../../../../../components';
import { ChainX, Patterns } from '../../../../../utils';
import * as styles from './ImportAccountModal.less';

class ImportAccountModal extends Component {
  state = {
    step: 1,
    mnemonicWord: new Array(12).fill(''),
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
        ? '请填写完整'
        : '' || Patterns.check('isMnemonicValid')(mnemonicWord.join(' '));
      this.setState({ MnemonicWordErrMsg: errMsg });
      return errMsg;
    },
    checkSecretKey: () => {
      const { secretKey } = this.state;
      const errMsg = Patterns.check('required')(secretKey) || Patterns.check('isPrivateKey')(secretKey);
      this.setState({ secretKeyErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      const { step } = this.state;
      return [['checkMnemonicWord', 'checkSecretKey'][step - 1]].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { step, mnemonicWord, secretKey, MnemonicWordErrMsg, secretKeyErrMsg } = this.state;
    const {
      model: { openModal },
    } = this.props;
    return (
      <Modal
        title={
          <span>
            导入账户 (<span className={styles.step}>1</span>/2)
          </span>
        }
        button={
          <div className={styles.conformContainer}>
            <Button
              className={styles.confirm}
              size="full"
              type="confirm"
              onClick={() => {
                if (checkAll.confirm()) {
                  const account =
                    step === 1
                      ? ChainX.Account.fromMnemonic(mnemonicWord.join(' '))
                      : ChainX.Account.fromPrivateKey(secretKey);

                  openModal({
                    name: 'SetPasswordModal',
                    data: {
                      step: 2,
                      privateKey: account.privateKey,
                      address: account.address,
                    },
                  });
                }
              }}>
              导入
            </Button>
          </div>
        }>
        <div className={styles.importAccountModal}>
          <div className={styles.title}>
            <span>{step === 1 ? '导入助记词' : '导入私钥'}</span>
            <Button
              type="blank"
              onClick={() => {
                this.setState({
                  step: step === 1 ? 2 : 1,
                });
              }}>
              <Icon name="icon-daoruzhanghu" className={styles.importicon} />
              {step === 1 ? '导入私钥' : '导入助记词'}
            </Button>
          </div>
          {step === 1 ? (
            <>
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
              {MnemonicWordErrMsg ? <div className={styles.errMsg}>{MnemonicWordErrMsg}</div> : null}
              <div className={styles.warn}>按顺序输入您的助记词，并以空格键区分</div>
            </>
          ) : (
            <Input.Text
              isTextArea
              rows={2}
              label=""
              value={secretKey}
              errMsg={secretKeyErrMsg}
              onChange={value => {
                this.setState({ secretKey: value });
              }}
              onBlur={checkAll.checkSecretKey}
            />
          )}
        </div>
      </Modal>
    );
  }
}

export default ImportAccountModal;
