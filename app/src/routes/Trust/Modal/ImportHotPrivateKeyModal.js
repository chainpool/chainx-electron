import React, { Component } from 'react';
import { Button, Modal, Input } from '@components';
import * as styles from './ImportHotPrivateKeyModal.less';
import { Patterns } from '../../../utils';
import { SCRYPT_PARAMS } from '../../../constants';
import bip38 from 'bip38';
import { FormattedMessage } from '../../../components';

class ImportHotPrivateKeyModal extends Component {
  state = {
    hotPrivateKey: '',
    hotPrivateKeyErrMsg: '',
    password: '',
    passwordErrMsg: '',
    confirmedPassword: '',
    confirmedPasswordErrMsg: '',
    percent: 0,
  };

  checkAll = {
    checkEqual: () => {
      const { password, confirmedPassword } = this.state;
      const errMsg = Patterns.check('equal')(password, confirmedPassword, <FormattedMessage id={'PasswordNotEqual'} />);
      this.setState({ passwordErrMsg: errMsg, confirmedPasswordErrMsg: errMsg });
      return errMsg;
    },
    checkHotPrivateKey: () => {
      const { hotPrivateKey } = this.state;
      const {
        currentTrustNode,
        model: { isTestBitCoinNetWork },
      } = this.props;
      const errMsg =
        Patterns.check('required')(hotPrivateKey) ||
        Patterns.check('isHotPrivateKey')(
          hotPrivateKey,
          currentTrustNode.hotPubKey.replace(/^0x/, ''),
          isTestBitCoinNetWork(),
          decoded => {
            this.decoded = decoded;
          }
        );
      this.setState({ hotPrivateKeyErrMsg: errMsg });
      return errMsg;
    },
    checkPassword: () => {
      const { password } = this.state;
      const errMsg =
        Patterns.check('required')(password) ||
        Patterns.check('smallerOrEqual')(
          8,
          password.length,
          <FormattedMessage id={'MinCharacterLength'} values={{ length: 8 }} />
        ) ||
        this.checkAll.checkEqual();
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    checkConfirmedPassword: () => {
      const { confirmedPassword } = this.state;
      const errMsg =
        Patterns.check('required')(confirmedPassword) ||
        Patterns.check('smallerOrEqual')(
          8,
          confirmedPassword.length,
          <FormattedMessage id={'MinCharacterLength'} values={{ length: 8 }} />
        ) ||
        this.checkAll.checkEqual();
      this.setState({ confirmedPasswordErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkHotPrivateKey', 'checkPassword', 'checkConfirmedPassword'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const {
      hotPrivateKey,
      hotPrivateKeyErrMsg,
      password,
      passwordErrMsg,
      confirmedPassword,
      confirmedPasswordErrMsg,
    } = this.state;
    const {
      model: { closeModal, dispatch },
      globalStore: { modal: { data: { chain } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title={<FormattedMessage id={'ImportHotPrivateKey'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                // 传入 worker 脚本文件的路径即可
                const decoded = this.decoded;
                if (decoded && decoded.privateKey) {
                  const decodedHotPrivateKey = bip38.encrypt(
                    decoded.privateKey,
                    decoded.compressed,
                    password,
                    () => {},
                    SCRYPT_PARAMS
                  );
                  dispatch({
                    type: 'updateTrust',
                    payload: {
                      decodedHotPrivateKey,
                      chain,
                    },
                  });
                }
                closeModal();
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.hello}>
          <FormattedMessage id={'HotPrivateKeyStoreLocal'}>
            {msg => (
              <Input.Text
                placeholder={msg}
                label={<FormattedMessage id={'HotPrivateEntity'} />}
                value={hotPrivateKey}
                errMsg={hotPrivateKeyErrMsg}
                onChange={value => {
                  this.setState({ hotPrivateKey: value });
                }}
                onBlur={checkAll.checkHotPrivateKey}
              />
            )}
          </FormattedMessage>

          <FormattedMessage id={'MinCharacterLength'} values={{ length: 8 }}>
            {msg => (
              <Input.Text
                errMsgIsOutside
                isPassword
                placeholder={msg}
                label={<FormattedMessage id={'HotPrivateEntityPassword'} />}
                value={password}
                errMsg={passwordErrMsg}
                onChange={value => {
                  this.setState({ password: value });
                }}
                onBlur={checkAll.checkPassword}
              />
            )}
          </FormattedMessage>
          <FormattedMessage id={'RepeatPassword'}>
            {msg => (
              <Input.Text
                errMsgIsOutside
                isPassword
                placeholder={msg}
                label={<FormattedMessage id={'ConfirmPassword'} />}
                value={confirmedPassword}
                errMsg={confirmedPasswordErrMsg}
                onChange={value => {
                  this.setState({ confirmedPassword: value });
                }}
              />
            )}
          </FormattedMessage>
        </div>
      </Modal>
    );
  }
}

export default ImportHotPrivateKeyModal;
