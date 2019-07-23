import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Scroller } from '../../../components';
import * as styles from './TrusteeSwitchModal.less';

class TrusteeSwitchModal extends Component {
  render() {
    const {
      model: { closeModal },
    } = this.props;

    return (
      <Modal
        scroll={false}
        title={<div>信托换届</div>}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              closeModal();
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.TrusteeSwitchModal}>
          <div className={styles.top}>
            模拟多签热地址:
            <div className={styles.address}>5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa9aa</div>
            模拟多签热赎回脚本:
            <div className={styles.redescript}>
              5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa9a5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa9aa5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa9aa5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa9aaa
            </div>
            模拟多签冷地址:
            <div className={styles.address}>5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa9aa</div>
            模拟多签冷赎回脚本:
            <div className={styles.redescript}>5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa9a5</div>
          </div>
          <div className={styles.down}>
            <ul>
              {new Array(3).fill().map((item, index) => (
                <li key={index}>
                  <div className={styles.name}>nuildlinks</div>
                  <div>
                    <span>地址：</span>19zdMbaZnD8ze6XUZuVTYtV8ze6XUZuVTYtVQ4
                  </div>
                  <div>
                    <span>热公钥：</span>19zdMbaZnD8ze6XUZuVTYtV8ze6XUZuVTYtVQ4
                  </div>
                  <div>
                    <span>冷公钥:</span>19zdMbaZnD8ze6XUZuVTYtV8ze6XUZuVTYtVQ4
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    );
  }
}

export default TrusteeSwitchModal;
