import React, { Component } from 'react';
import { Modal, Input, Button, ButtonGroup, FormattedMessage } from '../../../../../components';
import { Patterns } from '../../../../../utils';
import * as styles from './ExportKeystoreModal.less';

class ForgetAccountModal extends Component {
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
      model: { closeModal, dispatch },
      globalStore: { modal: { data } = {} },
    } = this.props;
    return (
      <Modal
        title={<FormattedMessage id={'ExportKeystore'} />}
        button={
          <ButtonGroup className={styles.group}>
            <Button
              size="bigger"
              onClick={() => {
                closeModal();
              }}>
              <FormattedMessage id={'Cancel'} />
            </Button>
            <Button
              size="bigger"
              type="success"
              onClick={() => {
                if (checkAll.confirm()) {
                  dispatch({
                    type: 'exportKeystore',
                    payload: data,
                  });
                  closeModal();
                }
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          </ButtonGroup>
        }>
        <div className={styles.ExportKeystoreModal}>
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

export default ForgetAccountModal;
