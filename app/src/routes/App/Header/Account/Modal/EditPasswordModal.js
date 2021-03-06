import React, { Component } from 'react';
import { Modal, Input, Button, FormattedMessage } from '../../../../../components';
import { ChainX, Patterns } from '../../../../../utils';

class EditPasswordModal extends Component {
  state = {
    primaryPassword: '',
    primaryPasswordErrMsg: '',
    password: '',
    passwordErrMsg: '',
    confirmPassword: '',
    confirmPasswordErrMsg: '',
  };
  checkAll = {
    checkPrimaryPassword: () => {
      const { primaryPassword } = this.state;
      const {
        globalStore: { modal: { data: { encoded } = {} } = {} },
      } = this.props;
      const errMsg = Patterns.check('required')(primaryPassword) || Patterns.check('decode')(encoded, primaryPassword);

      this.setState({ primaryPasswordErrMsg: errMsg });
      return errMsg;
    },
    checkPassword: () => {
      const { password } = this.state;
      let errMsg =
        Patterns.check('required')(password) ||
        Patterns.check('smallerOrEqual')(
          8,
          password.length,
          <FormattedMessage id={'MinCharacterLength'} values={{ length: 8 }} />
        ) ||
        Patterns.check('passwordUpperAndLower')(password);
      if (!errMsg) {
        errMsg = this.checkAll.checkEqual();
      }
      this.setState({
        passwordErrMsg: errMsg,
      });
      return errMsg;
    },
    checkConfirmPassword: () => {
      const { confirmPassword } = this.state;
      let errMsg = Patterns.check('required')(confirmPassword);
      if (!errMsg) {
        errMsg = this.checkAll.checkEqual();
      }
      this.setState({
        confirmPasswordErrMsg: errMsg,
      });
      return errMsg;
    },

    checkEqual: () => {
      const { password, confirmPassword } = this.state;
      if (password && confirmPassword) {
        const errMsg = Patterns.check('equal')(password, confirmPassword, <FormattedMessage id={'PasswordNotEqual'} />);
        this.setState({
          passwordErrMsg: errMsg,
          confirmPasswordErrMsg: errMsg,
        });
        return errMsg;
      }
    },

    confirm: () => {
      return ['checkPrimaryPassword', 'checkPassword', 'checkConfirmPassword'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const {
      primaryPassword,
      primaryPasswordErrMsg,
      password,
      passwordErrMsg,
      confirmPassword,
      confirmPasswordErrMsg,
    } = this.state;
    const {
      model: { dispatch, closeModal },
      globalStore: { modal: { data: { address, encoded } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title={<FormattedMessage id={'ChangePassword'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                dispatch({
                  type: 'updateEncoded',
                  payload: {
                    address,
                    encoded: ChainX.account.fromKeyStore(encoded, primaryPassword).encrypt(password),
                  },
                });
                closeModal();
              }
            }}>
            <FormattedMessage id={'Complete'} />
          </Button>
        }>
        <div>
          <FormattedMessage id={'InputPassword'}>
            {msg => (
              <Input.Text
                errMsgIsOutside
                isPassword
                placeholder={msg}
                label={<FormattedMessage id={'PrimaryPassword'} />}
                value={primaryPassword}
                errMsg={primaryPasswordErrMsg}
                onChange={value => {
                  this.setState({ primaryPassword: value });
                }}
                onBlur={() => {
                  checkAll.checkPrimaryPassword();
                }}
              />
            )}
          </FormattedMessage>
          <FormattedMessage id={'MinCharacterLengthAndUpperLowerCase'} values={{ length: 8 }}>
            {msg => (
              <Input.Text
                errMsgIsOutside
                isPassword
                placeholder={msg}
                label={<FormattedMessage id={'NewPassword'} />}
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

export default EditPasswordModal;
