import React, { Component } from 'react';
import { _ } from '../../../utils';
import { Modal, Button, ButtonGroup, FormattedMessage } from '../../../components';
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
        }
      />
    );
  }
}

export default ConfirmAndCancelModal;
