import React, { Component } from 'react';
import { Modal, Input, Button, ButtonGroup, FormattedMessage } from '../../../../../components';
import { _, Patterns, ChainX, classNames, isRepeat } from '../../../../../utils';
import { ErrMsg } from '../../../../../constants';
import * as styles from './CreateAccountModal.less';

class CreateAccountModal extends Component {
  constructor(props) {
    super(props);
    const generateWords = () => {
      const words = ChainX.account.newMnemonic().split(' ');
      if (isRepeat(words)) {
        return generateWords();
      } else {
        return words;
      }
    };
    const generateMnemonic = generateWords();
    this.state = {
      step: 1,
      mnemonicWord: generateMnemonic,
      shuffleMnemonicWord: _.shuffle(generateMnemonic),
      userSelectMnemonicWord: [],
      userSelectMnemonicWordErrMsg: '',
      secretKey: '',
      secretKeyErrMsg: '',
    };
  }
  checkAll = {
    checkUserSelectMnemonicWord: () => {
      const { userSelectMnemonicWord, mnemonicWord } = this.state;
      const errMsg = Patterns.check('strictEqual')(
        userSelectMnemonicWord.join(),
        mnemonicWord.join(),
        <FormattedMessage id={'AccountImportMnemonicNotEqual'} />
      );
      this.setState({ userSelectMnemonicWordErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      const { step } = this.state;
      return [['checkUserSelectMnemonicWord'][step - 2]].every(item => !this.checkAll[item]());
    },
  };

  submit = () => {
    const { checkAll } = this;
    const { mnemonicWord } = this.state;
    const {
      model: { openModal },
    } = this.props;

    if (checkAll.confirm()) {
      const account = ChainX.account.from(mnemonicWord.join(' '));
      openModal({
        name: 'SetPasswordModal',
        data: {
          step: 3,
          account,
        },
      });
    }
  };
  render() {
    const { submit } = this;
    const {
      step,
      mnemonicWord,
      userSelectMnemonicWord,
      userSelectMnemonicWordErrMsg,
      shuffleMnemonicWord,
    } = this.state;

    return (
      <Modal
        title={
          <span>
            {step === 1 ? <FormattedMessage id={'BackUpMnemonic'} /> : null}
            {step === 2 ? <FormattedMessage id={'ValidateMnemonic'} /> : null}(
            <span className={styles.step}>{step}</span>/3)
          </span>
        }>
        <div className={styles.createAccountModal}>
          {step === 1 ? (
            <>
              <div className={styles.title}>
                <div>
                  <FormattedMessage id={'WarmReminder'} />：
                </div>
                <FormattedMessage id={'NotSavePrivateKeyAnyWhere'} />
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
                  <FormattedMessage id={'IHaveBackedUp'} />
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
              <div className={styles.remember}>
                <FormattedMessage id={'ConfirmMnemonicOrder'} />
              </div>
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
                    <div
                      className={classNames(
                        styles.word,
                        _.findIndex(userSelectMnemonicWord, item => item === shuffleMnemonicWord[index]) > -1
                          ? styles.selected
                          : null
                      )}>
                      {shuffleMnemonicWord[index]}
                    </div>
                  </li>
                ))}
              </ul>
              {userSelectMnemonicWordErrMsg ? (
                <div className={styles.errMsgCompare}>{userSelectMnemonicWordErrMsg}</div>
              ) : null}

              <div className={styles.conformContainer}>
                <ButtonGroup>
                  <Button
                    size="bigger"
                    onClick={() => {
                      this.setState({
                        step: step - 1,
                      });
                    }}>
                    <FormattedMessage id={'BackUpStep'} />
                  </Button>
                  <Button
                    size="bigger"
                    type="confirm"
                    onClick={() => {
                      submit();
                    }}>
                    <FormattedMessage id={'Complete'} />
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
