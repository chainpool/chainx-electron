import React, { Component } from 'react';
import { _ } from '../../../utils';
import { Modal, Button, ButtonGroup } from '../../../components';
import * as styles from './index.less';

class ConfirmAndCancelModal extends Component {
  render() {
    const {
      model: { closeModal },
      globalStore: { modal: { data: { title, callback } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title={title}
        button={
          <div className={styles.confirmAndCancelModal}>
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
                  _.isFunction(callback) && callback();
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

export default ConfirmAndCancelModal;
