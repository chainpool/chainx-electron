import React, { Component } from 'react';
import { Button, Input, FormattedMessage, Modal } from '../../../components';
import * as styles from './AnalyzeSpecialTradeModal.less';
import { Patterns } from '../../../utils';

class AnalyzeSpecialTradeModal extends Component {
  state = {
    redeemScriptSpecial: '',
    redeemScriptSpecialErrMsg: '',
    tx: '',
    txErrMsg: '',
  };
  checkAll = {
    checkRedeemScriptSpecial: () => {
      const { tx, redeemScriptSpecial } = this.state;
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      let errMsg = Patterns.check('isTransactionTxSigned')(tx, isTestBitCoinNetWork(), '请输入赎回脚本');
      if (errMsg && redeemScriptSpecial) {
        errMsg =
          Patterns.check('required')(redeemScriptSpecial) || Patterns.check('isRedeemScript')(redeemScriptSpecial);
      }
      this.setState({ redeemScriptSpecialErrMsg: errMsg });
      return errMsg;
    },
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
      return ['checkTx', 'checkRedeemScriptSpecial'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { tx, txErrMsg, redeemScriptSpecial, redeemScriptSpecialErrMsg } = this.state;
    const {
      model: { dispatch, closeModal },
    } = this.props;

    return (
      <Modal
        title={'解析比特币交易'}
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
                dispatch({
                  type: 'updateRedeemScriptSpecial',
                  payload: {
                    redeemScriptSpecial,
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
            errMsgIsOutside
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
          {redeemScriptSpecialErrMsg || redeemScriptSpecial ? (
            <Input.Text
              errMsgIsOutside
              errMsg={redeemScriptSpecialErrMsg}
              label="赎回脚本"
              isTextArea
              rows={5}
              value={redeemScriptSpecial}
              onChange={value =>
                this.setState({
                  redeemScriptSpecial: value.replace(/^0x/, ''),
                })
              }
              onBlur={this.checkAll.checkRedeemScriptSpecial}
            />
          ) : null}
        </div>
      </Modal>
    );
  }
}

export default AnalyzeSpecialTradeModal;
