import React, { Component } from 'react';
import { Modal, Button, ButtonGroup } from '../../../components';
import * as styles from './DeleteAddressModal.less';

class DeleteAddressModal extends Component {
  render() {
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal title="删除地址">
        <div className={styles.deleteAddressModal}>
          <ButtonGroup className={styles.group}>
            <Button size="bigger" onClick={closeModal}>
              取消
            </Button>
            <Button
              style={{ marginLeft: 16 }}
              type="success"
              size="bigger"
              className={styles.active}
              onClick={closeModal}>
              确定
            </Button>
          </ButtonGroup>
        </div>
      </Modal>
    );
  }
}

export default DeleteAddressModal;
