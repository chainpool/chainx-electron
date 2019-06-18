import React, { Component } from 'react';
import { Button, Input, FormattedMessage, Modal } from '../../../components';
import * as styles from './AnalyzeSpecialTradeModal.less';

class AnalyzeSpecialTradeModal extends Component {
  state = {
    tx: '',
  };
  render() {
    const { tx } = this.state;
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
          <Input.Text
            label="待签原文"
            isTextArea
            rows={10}
            value={tx}
            onChange={value =>
              this.setState({
                tx: value.trim(),
              })
            }
          />
        </div>
      </Modal>
    );
  }
}

export default AnalyzeSpecialTradeModal;
