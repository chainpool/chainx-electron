import React, { Component } from 'react';
import { Modal, Input, Button, ButtonGroup } from '../../../components';
import { _, Patterns, Chainx, classNames } from '../../../utils';
import * as styles from './CreateAccountModal.less';

class CreateAccountModal extends Component {
  constructor(props) {
    super(props);
    const generateMnemonic = Chainx.Account.newMnemonic().split(' ');
    this.state = {
      step: 2,
      mnemonicWord: generateMnemonic,
      shuffleMnemonicWord: _.shuffle(generateMnemonic),
      userSelectMnemonicWord: [],
      MnemonicWordErrMsg: '',
      secretKey: '',
      secretKeyErrMsg: '',
    };
  }
  componentDidMount() {}
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

  submit = () => {
    const { mnemonicWord } = this.state;
    const {
      model: { openModal, dispatch },
    } = this.props;
    const account = Chainx.Account.fromMnemonic(mnemonicWord.join(' '));
    // const encry = Chainx.Keystore.encrypt(account.privateKey, '12345678');
    // const newAccount = Chainx.Account.fromPrivateKey(Chainx.Keystore.decrypt(encry, '12345678'));
    openModal({
      name: 'SetPasswordModal',
      data: {
        step: 3,
        callback: (label, password) => {
          const encoded = Chainx.Keystore.encrypt(account.privateKey, `${password}`);
          dispatch({
            type: 'add',
            payload: {
              tag: label,
              address: account.address,
              encoded,
            },
          });
        },
      },
    });
  };
  render() {
    const { submit } = this;
    const { step, mnemonicWord, userSelectMnemonicWord, shuffleMnemonicWord } = this.state;

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
                      disabled
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
              <ul className={styles.userInputMnemonicWord}>
                {userSelectMnemonicWord.map((item, index) => (
                  <li key={index}>
                    <Input.Text
                      disabled
                      className={styles.word}
                      label=""
                      value={userSelectMnemonicWord[index]}
                      errMsg={''}
                    />
                  </li>
                ))}
              </ul>
              <div className={styles.remember}>按顺序确认您的助记词</div>
              <ul className={styles.inmemory}>
                {shuffleMnemonicWord.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      const pos = _.findIndex(userSelectMnemonicWord, item => item === shuffleMnemonicWord[index]);
                      if (pos > -1) {
                        userSelectMnemonicWord.splice(pos, 1);
                      } else {
                        userSelectMnemonicWord.splice(userSelectMnemonicWord.length, 1, shuffleMnemonicWord[index]);
                      }

                      this.setState({
                        userSelectMnemonicWord,
                      });
                    }}>
                    <Input.Text
                      disabled
                      className={classNames(
                        styles.word,
                        _.findIndex(userSelectMnemonicWord, item => item === shuffleMnemonicWord[index]) > -1
                          ? styles.selected
                          : null
                      )}
                      label=""
                      value={shuffleMnemonicWord[index]}
                      errMsg={''}
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
                      submit();
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
