import React, { Component } from 'react';
import { Modal, Input, Button, FormattedMessage } from '../../../../../components';
import { Patterns } from '../../../../../utils';
import * as styles from './SetPasswordModal.less';

class SetPasswordModal extends Component {
  state = {
    label: '',
    labelErrMsg: '',
    password: '',
    passwordErrMsg: '',
    confirmPassword: '',
    confirmPasswordErrMsg: '',
  };
  checkAll = {
    checkEqual: () => {
      const { password, confirmPassword } = this.state;
      if (password && confirmPassword) {
        return password === confirmPassword ? '' : <FormattedMessage id={'PasswordNotEqual'} />;
      }
    },
    checkLabel: () => {
      const { label } = this.state;
      const errMsg = Patterns.check('required')(label.trim());
      this.setState({ labelErrMsg: errMsg });
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
        Patterns.check('passwordUpperAndLower')(password);
      this.setState({ passwordErrMsg: errMsg });
      this.checkAll.checkEqual();
      return errMsg;
    },
    checkConfirmPassword: () => {
      const { confirmPassword } = this.state;
      const errMsg = Patterns.check('required')(confirmPassword) || this.checkAll.checkEqual();
      this.setState({ confirmPasswordErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkLabel', 'checkPassword', 'checkConfirmPassword'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { label, labelErrMsg, password, passwordErrMsg, confirmPassword, confirmPasswordErrMsg } = this.state;
    const {
      model: { dispatch, closeModal },
      globalStore: { modal: { data: { step, account } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title={
          <span>
            <FormattedMessage id={'SettingPassword'} /> (<span className={styles.step}>{step}</span>/{step})
          </span>
        }
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                const encoded = account.encrypt(password);
                dispatch({
                  type: 'addAccount',
                  payload: {
                    tag: label.trim(),
                    address: account.address(),
                    encoded,
                  },
                });
                closeModal();
              }
            }}>
            <FormattedMessage id={'Complete'} />
          </Button>
        }>
        <div className={styles.setPasswordModal}>
          <FormattedMessage id={'CharacterLength'} values={{ length: 12 }}>
            {msg => (
              <Input.Text
                trim={false}
                placeholder={msg}
                label={<FormattedMessage id={'Label'} />}
                value={label}
                errMsg={labelErrMsg}
                onChange={value => {
                  this.setState({ label: value.slice(0, 12) });
                }}
                onBlur={checkAll.checkLabel}
              />
            )}
          </FormattedMessage>

          <FormattedMessage id={'MinCharacterLengthAndUpperLowerCase'} values={{ length: 8 }}>
            {msg => (
              <Input.Text
                isPassword
                placeholder={msg}
                label={<FormattedMessage id={'Password'} />}
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
                isPassword
                placeholder={msg}
                label={<FormattedMessage id={'ConfirmPassword'} />}
                value={confirmPassword}
                errMsg={confirmPasswordErrMsg}
                onChange={value => {
                  this.setState({ confirmPassword: value });
                }}
                onBlur={checkAll.checkConfirmPassword}
              />
            )}
          </FormattedMessage>
        </div>
      </Modal>
    );
  }
}

export default SetPasswordModal;
