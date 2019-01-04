import React, { Component } from 'react';
import { Modal, Button, ButtonGroup } from '../../../components';
import * as styles from './DeleteApiModal.less';

class DeleteApiModal extends Component {
  render() {
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="删除API"
        button={
          <div className={styles.deleteApiModal}>
            <ButtonGroup>
              <Button
                size="bigger"
                onClick={() => {
                  closeModal();
                }}>
                取消
              </Button>
              <Button
                size="bigger"
                type="confirm"
                onClick={() => {
                  closeModal();
                }}>
                确定
              </Button>
            </ButtonGroup>
          </div>
        }
      />
    );
  }
}

export default DeleteApiModal;
