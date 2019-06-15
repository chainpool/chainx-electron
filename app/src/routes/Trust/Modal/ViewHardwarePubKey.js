import React, { Component } from 'react';
import { Modal, Button, FormattedMessage, Clipboard } from '../../../components';
import * as styles from './ViewHardwarePubKey.less';

class ViewHardwarePubKey extends Component {
  state = {
    pubKey: '1234555',
  };
  render() {
    const { pubKey } = this.state;

    return (
      <Modal
        title={<FormattedMessage id={'ExportPrivateKey'} />}
        button={
          pubKey ? (
            ''
          ) : (
            <Button size="full" type="confirm" onClick={() => {}}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          )
        }>
        <div className={styles.ViewHardwarePubKey}>
          <ul>
            <li>
              <span>状态：</span>
              <span>未连接</span>
            </li>
            <li>
              <span>PATH：</span>
              <span>m/45'/0/0/0</span>
            </li>
          </ul>
          <div className={styles.secret}>
            <span className={styles.label}>公钥</span>：
            <span className={styles.result}>
              <Clipboard>{pubKey}</Clipboard>
            </span>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ViewHardwarePubKey;
