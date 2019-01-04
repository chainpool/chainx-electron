import React, { Component } from 'react';
import { Modal, Button, ButtonGroup } from '../../../components';
import * as styles from './DeleteNodeModal.less';

class DeleteNodeModal extends Component {
  render() {
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="删除节点"
        button={
          <div className={styles.deleteNodeModal}>
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

export default DeleteNodeModal;
