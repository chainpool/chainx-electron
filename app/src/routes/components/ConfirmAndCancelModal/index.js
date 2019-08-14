import React from 'react';
import { _ } from '../../../utils';
import { Button, ButtonGroup, FormattedMessage, Modal } from '../../../components';
import * as styles from './index.less';

function ConfirmAndCancelModal(props) {
  const {
    globalStore: { closeModal, modal: { data: { title, callback } = {} } = {} },
    children,
  } = props;

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

export default ConfirmAndCancelModal;
