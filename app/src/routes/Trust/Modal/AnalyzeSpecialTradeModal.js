import React, { Component } from 'react';
import { Button, Input, FormattedMessage, Modal } from '../../../components';
import * as styles from './AnalyzeSpecialTradeModal.less';

class AnalyzeSpecialTradeModal extends Component {
  render() {
    const {
      model: { dispatch, openModal, closeModal },
    } = this.props;

    return (
      <Modal
        title={'构造特殊交易'}
        button={
          <Button size="full" type="confirm" onClick={() => {}}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.AnalyzeSpecialTradeModal}>
          <Input.Text label="待签原文" isTextArea rows={10} disabled />
        </div>
      </Modal>
    );
  }
}

export default AnalyzeSpecialTradeModal;
