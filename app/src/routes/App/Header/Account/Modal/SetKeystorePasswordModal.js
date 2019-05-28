import React, { Component } from 'react';
import { Modal, Input, Button, FormattedMessage } from '../../../../../components';
import { Patterns } from '../../../../../utils';
import * as styles from './SetKeystorePasswordModal.less';

class SetKeystorePassword extends Component {
  state = {
    password: '',
    passwordErrMsg: '',
  };
  checkAll = {
    checkPassword: () => {
      const { password } = this.state;
      const {
        globalStore: { modal: { data: { encoded } = {} } = {} },
      } = this.props;
      const errMsg = Patterns.check('required')(password) || Patterns.check('decode')(encoded, password);
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkPassword'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { password, passwordErrMsg } = this.state;
    const {
      model: { dispatch, closeModal },
      globalStore: { modal: { data: { tag, address, encoded } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title={
          <span>
            <FormattedMessage id={'ImportAccount'} /> (<span className={styles.step}>{2}</span>/{2})
          </span>
        }
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                dispatch({
                  type: 'addAccount',
                  payload: {
                    tag,
                    address,
                    encoded,
                    download: false,
                  },
                });
                closeModal();
              }
            }}>
            <FormattedMessage id={'Complete'} />
          </Button>
        }>
        <div className={styles.SetKeystorePasswordModal}>
          <FormattedMessage id={'InputPassword'}>
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
        </div>
      </Modal>
    );
  }
}

export default SetKeystorePassword;
