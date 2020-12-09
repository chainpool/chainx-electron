import React, { Component } from 'react';
import { Modal, Input, Button, Icon, FormattedMessage, Toast } from '../../../../../components';
import { ChainXAccount, Patterns } from '../../../../../utils';
import * as styles from './ImportAccountModal.less';

class ImportAccountModal extends Component {
  constructor(props) {
    super(props);
    this.inputFileRef = React.createRef();
    this.state = {
      step: 'mnemonic',
      mnemonicWord: new Array(12).fill(''),
      MnemonicWordErrMsg: '',
      secretKey: '',
      secretKeyErrMsg: '',
    };
  }

  checkAll = {
    checkMnemonicWord: () => {
      const { mnemonicWord } = this.state;

      const errMsg = Patterns.check('isMnemonicValid')(mnemonicWord.join(' '));

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
      if (step === 'mnemonic') {
        return !this.checkAll.checkMnemonicWord();
      } else if (step === 'secretKey') {
        return !this.checkAll.checkSecretKey();
      }
      return true;
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
            <FormattedMessage id={'ImportAccount'} /> (<span className={styles.step}>1</span>/2)
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
                    step === 'mnemonic' ? ChainXAccount.from(mnemonicWord.join(' ')) : ChainXAccount.from(secretKey);
                  openModal({
                    name: 'SetPasswordModal',
                    data: {
                      step: 2,
                      account,
                    },
                  });
                }
              }}>
              <FormattedMessage id={'Import'} />
            </Button>
          </div>
        }>
        <div className={styles.importAccountModal}>
          <div className={styles.title}>
            <span>
              {step === 'mnemonic' && <FormattedMessage id={'ImportMnemonic'} />}
              {step === 'secretKey' && <FormattedMessage id={'ImportPrivateKey'} />}
            </span>
            <div className={styles.icons}>
              <Button
                type="blank"
                onClick={() => {
                  this.setState({
                    step: step === 'mnemonic' ? 'secretKey' : 'mnemonic',
                  });
                }}>
                <Icon name="icon-daoruzhanghu" className={styles.importicon} />
                {step === 'mnemonic' && <FormattedMessage id={'ImportPrivateKey'} />}
                {step === 'secretKey' && <FormattedMessage id={'ImportMnemonic'} />}
              </Button>
              <Button type="blank" onClick={() => {}}>
                <label htmlFor="upload-file">
                  <Icon name="icon-daoruzhanghu" className={styles.importicon} />
                  Keystore File
                </label>
                <input
                  ref={this.inputFileRef}
                  id="upload-file"
                  type="file"
                  style={{ position: 'absolute', display: 'none' }}
                  onChange={e => {
                    const file = e.currentTarget.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.readAsText(file, 'UTF-8');
                    reader.onload = e => {
                      const errMsg = '数据格式错误，请检查文件数据';
                      try {
                        const result = JSON.parse(e.target.result);
                        const { tag, address, encoded, net } = result;
                        const isNotValidAddress = Patterns.check('isChainXAddress')(address);
                        if (!tag || !address || !encoded || !net || isNotValidAddress) {
                          throw new Error(errMsg);
                        }
                        openModal({
                          name: 'SetKeystorePasswordModal',
                          data: {
                            tag,
                            address,
                            encoded,
                            net,
                          },
                        });
                      } catch (err) {
                        this.inputFileRef.current.value = '';
                        Toast.warn(errMsg);
                      }
                    };
                  }}
                />
              </Button>
            </div>
          </div>
          {step === 'mnemonic' && (
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
              <div className={styles.warn}>
                <FormattedMessage id={'InputMnemonicOrder'} />
              </div>
              {MnemonicWordErrMsg ? (
                <div className={styles.errMsg}>{<FormattedMessage id={MnemonicWordErrMsg} />}</div>
              ) : null}
            </>
          )}
          {step === 'secretKey' && (
            <Input.Text
              isTextArea
              rows={3}
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
