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
        title={'确定要投票吗？'}
        button={
          <div className={styles.InactiveVoteConfirmModal}>
            <div className={styles.desc}>当前节点为退选状态，您的投票在退选期间不会获得任何收益</div>
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
