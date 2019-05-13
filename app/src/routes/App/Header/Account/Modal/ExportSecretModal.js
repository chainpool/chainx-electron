import React, { Component } from 'react';
import { Modal, Input, Button, FormattedMessage } from '../../../../../components';
import { Warn } from '../../../../components';
import { ChainX, Patterns } from '../../../../../utils';
import * as styles from './ExportSecretModal.less';

class ExportSecretModal extends Component {
  state = {
    showResult: '',
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
    const { showResult, password, passwordErrMsg } = this.state;
    const {
      globalStore: { modal: { data: { encoded } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title={<FormattedMessage id={'ExportPrivateKey'} />}
        button={
          showResult ? (
            ''
          ) : (
            <Button
              size="full"
              type="confirm"
              onClick={() => {
                if (checkAll.confirm()) {
                  this.setState({ showResult: ChainX.account.fromKeyStore(encoded, password).privateKey() });
                }
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          )
        }>
        <div className={styles.exportSecret}>
          {showResult ? (
            <>
              <div className={styles.secret}>
                <span className={styles.label}>
                  <FormattedMessage id={'PrivateKey'} />
                </span>
                ：<span className={styles.result}>{showResult}</span>
              </div>
              <Warn>
                <FormattedMessage id={'NotSavePrivateKeyAnyWhere'} />
              </Warn>
            </>
          ) : (
            <Input.Text
              isPassword
              label={<FormattedMessage id={'Password'} />}
              value={password}
              errMsg={passwordErrMsg}
              onChange={value => {
                this.setState({ password: value });
              }}
              onBlur={checkAll.checkPassword}
            />
          )}
        </div>
      </Modal>
    );
  }
}

export default ExportSecretModal;
