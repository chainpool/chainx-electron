import React, { Component } from 'react';
import { Modal, Input, Button, Icon, FormattedMessage } from '../../../../../components';
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
      }) ? (
        <FormattedMessage id={'CompleteTheForm'} />
      ) : (
        Patterns.check('isMnemonicValid')(
          mnemonicWord.join(' '),
          <FormattedMessage id={'AccountImportMnemonicNotFormat'} />
        )
      );

      this.setState({ MnemonicWordErrMsg: errMsg });
      return errMsg;
    },
    checkSecretKey: () => {
      const { secretKey } = this.state;
      const errMsg =
        Patterns.check('required')(secretKey) ||
        Patterns.check('isPrivateKey')(secretKey, <FormattedMessage id={'AccountImportPrivateKeyNotFormat'} />);
      this.setState({ secretKeyErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      const { step } = this.state;
      if (step === 1) {
        return !this.checkAll.checkMnemonicWord();
      } else if (step === 2) {
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
                    step === 1 ? ChainX.account.from(mnemonicWord.join(' ')) : ChainX.account.from(secretKey);

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
              {step === 1 ? <FormattedMessage id={'ImportMnemonic'} /> : <FormattedMessage id={'ImportPrivateKey'} />}
            </span>
            <Button
              type="blank"
              onClick={() => {
                this.setState({
                  step: step === 1 ? 2 : 1,
                });
              }}>
              <Icon name="icon-daoruzhanghu" className={styles.importicon} />
              {step === 1 ? <FormattedMessage id={'ImportPrivateKey'} /> : <FormattedMessage id={'ImportMnemonic'} />}
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
              <div className={styles.warn}>
                <FormattedMessage id={'InputMnemonicOrder'} />
              </div>
            </>
          ) : (
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
