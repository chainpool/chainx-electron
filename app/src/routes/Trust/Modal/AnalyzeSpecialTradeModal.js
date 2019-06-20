import React, { Component } from 'react';
import { Button, Input, FormattedMessage, Modal } from '../../../components';
import * as styles from './AnalyzeSpecialTradeModal.less';
import { Patterns } from '../../../utils';

class AnalyzeSpecialTradeModal extends Component {
  state = {
    tx: '',
    txErrMsg: '',
  };

  checkAll = {
    checkTx: () => {
      const { tx } = this.state;
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      const errMsg = Patterns.check('required')(tx) || Patterns.check('isTransactionTx')(tx, isTestBitCoinNetWork());
      this.setState({ txErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkTx'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { tx, txErrMsg } = this.state;
    const {
      model: { dispatch, closeModal },
    } = this.props;

    return (
      <Modal
        title={'解析特殊交易'}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (this.checkAll.confirm()) {
                dispatch({
                  type: 'getInputsAndOutputsFromTx',
                  payload: {
                    tx,
                    isSpecialModel: true,
                  },
                });
                closeModal();
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.AnalyzeSpecialTradeModal}>
          <Input.Text
            errMsg={txErrMsg}
            label="待签原文"
            isTextArea
            rows={10}
            value={tx}
            onChange={value =>
              this.setState({
                tx: value,
              })
            }
            onBlur={this.checkAll.checkTx}
          />
        </div>
      </Modal>
    );
  }
}

export default AnalyzeSpecialTradeModal;
