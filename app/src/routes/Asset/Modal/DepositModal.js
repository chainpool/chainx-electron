import React, { Component } from 'react';
import { Modal, Icon, Clipboard } from '../../../components';
import * as styles from './DepositModal.less';

class DepositModal extends Component {
  render() {
    return (
      <Modal title="跨链充值">
        <div className={styles.bindAddress}>
          <div>
            已绑定地址：
            <button>绑定新地址</button>
          </div>
          <ul>
            <li>
              <span>Bitcoin:</span>
              <div>19zdMbaZnD8ze6XUZuVTYtVQ4URTYDFWbRw</div>
            </li>
          </ul>
        </div>
        <div className={styles.publicAddress}>
          <div>
            <div className={styles.title}>公共多签托管地址</div>
            <div className={styles.address}>
              <span className={styles.token}>Bitcoin:</span>
              <Clipboard>3E3ZjvzDuMebxjZyYNyzkM9zZrDNeEVA29u6b</Clipboard>
            </div>
            <div className={styles.warn}>
              <Icon name="icon-jinggao" className={styles.icon} />
              <span>请使用已绑定地址之一向公共多签托管地址转账，使用其他未绑定地址无法到账</span>
            </div>
          </div>
          <div className={styles.back} />
        </div>
      </Modal>
    );
  }
}

export default DepositModal;
