import React, { Component } from 'react';
import { _ } from '../../../utils';
import { Modal, Button, ButtonGroup, FormattedMessage } from '../../../components';
import * as styles from './index.less';

class ConfirmAndCancelModal extends Component {
  render() {
    const {
      globalStore: { closeModal, modal: { data: { title, callback } = {} } = {} },
      children,
    } = this.props;
    return (
      <Modal
        title={title}
        className={styles.group}
        button={
          <div className={styles.confirmAndCancelModal}>
            <ButtonGroup>
              <Button
                size="bigger"
                onClick={() => {
                  closeModal();
                }}>
                <FormattedMessage id={'Cancel'} />
              </Button>
              <Button
                size="bigger"
                type="confirm"
                onClick={() => {
                  _.isFunction(callback) && callback();
                  closeModal();
                }}>
                <FormattedMessage id={'Confirm'} />
              </Button>
            </ButtonGroup>
          </div>
        }>
        {children}
      </Modal>
    );
  }
}

export default ConfirmAndCancelModal;
