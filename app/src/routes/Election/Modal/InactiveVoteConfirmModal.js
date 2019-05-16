import React, { Component } from 'react';
import { _ } from '../../../utils';
import { Modal, Button, ButtonGroup, FormattedMessage } from '../../../components';
import * as styles from './InactiveVoteConfirmModal.less';

class InactiveVoteConfirmModal extends Component {
  render() {
    const {
      model: { closeModal },
      globalStore: { modal: { data: { callback } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title={<FormattedMessage id={'SureWantToVote'} />}
        button={
          <div className={styles.InactiveVoteConfirmModal}>
            <div className={styles.desc}>
              <FormattedMessage id={'NoRevenueIfDelected'} />
            </div>
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

export default InactiveVoteConfirmModal;
