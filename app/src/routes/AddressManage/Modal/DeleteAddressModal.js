import React, { Component } from 'react';
import { Modal } from '../../../components';
import * as styles from './DeleteAddressModal.less';

class DeleteAddressModal extends Component {
  render() {
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal title="删除地址">
        <div className={styles.deleteAddressModal}>
          <button onClick={closeModal}>取消</button>
          <button className={styles.active} onClick={closeModal}>
            确定
          </button>
        </div>
      </Modal>
    );
  }
}

export default DeleteAddressModal;
