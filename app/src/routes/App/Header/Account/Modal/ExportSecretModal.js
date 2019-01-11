import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../../../components';
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
        title="导出私钥"
        button={
          showResult ? (
            ''
          ) : (
            <Button
              size="full"
              type="confirm"
              onClick={() => {
                if (checkAll.confirm()) {
                  this.setState({ showResult: ChainX.Account.fromKeyStore(encoded, password).privateKey() });
                }
              }}>
              确定
            </Button>
          )
        }>
        <div className={styles.exportSecret}>
          {showResult ? (
            <>
              <div className={styles.secret}>
                私钥：<span className={styles.result}>{showResult}</span>
              </div>
              <Warn>不要将您的私钥存储在您的电脑上，或者网上某处。任何能够访问您备份私钥的人就能取用您的资金。</Warn>
            </>
          ) : (
            <Input.Text
              isPassword
              label="密码"
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
