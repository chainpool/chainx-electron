import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Input, Clipboard } from '../../../components';
import * as styles from './SignResultModal.less';
import { Patterns } from '../../../utils';

class SignResultModal extends Component {
  state = {
    otherSignResult: '',
    otherSignResultErrMsg: '',
  };
  checkAll = {
    checkOtherSignResult: () => {
      const {
        globalStore: { modal: { data: { desc } = {} } = {} },
        model: { isTestBitCoinNetWork },
      } = this.props;
      const { otherSignResult } = this.state;
      const errMsg =
        desc === 'other'
          ? Patterns.check('required')(otherSignResult) ||
            Patterns.check('isTransactionTx')(otherSignResult, isTestBitCoinNetWork())
          : '';
      this.setState({ otherSignResultErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkOtherSignResult'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { otherSignResult, otherSignResultErrMsg } = this.state;
    const {
      model: { dispatch, openModal, closeModal },
      globalStore: { modal: { data: { desc, signResult, isSpecialModel } = {} } = {} },
    } = this.props;

    return (
      <Modal
        title={<span>签名结果{desc === 'other' ? <span className={styles.other}>(其他)</span> : null}</span>}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (!this.checkAll.confirm()) return;
              const description = [
                { name: 'operation', value: () => <FormattedMessage id={'RespondMultiSigWithdrawal'} /> },
                {
                  name: () => <FormattedMessage id={'WhetherSignature'} />,
                  value: () => <FormattedMessage id={'TrueSign'} />,
                },
              ];
              if (isSpecialModel) {
                if (desc !== 'other' && signResult) {
                  dispatch({
                    type: 'updateTxSpecial',
                    payload: {
                      txSpecial: signResult,
                    },
                  });
                } else {
                  dispatch({
                    type: 'updateTxSpecial',
                    payload: {
                      txSpecial: otherSignResult,
                    },
                  });
                }
                closeModal();
              } else {
                if (desc !== 'other' && signResult) {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description,
                      callback: () => {
                        return dispatch({
                          type: 'signWithdrawTx',
                          payload: {
                            tx: signResult,
                          },
                        });
                      },
                    },
                  });
                } else if (desc === 'other') {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description,
                      callback: () => {
                        return dispatch({
                          type: 'signWithdrawTx',
                          payload: {
                            tx: otherSignResult,
                          },
                        });
                      },
                    },
                  });
                }
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.SignChannelSelectModal}>
          <Input.Text
            label={
              <span className={styles.tosign}>
                复制原文
                <Clipboard id="copy">
                  <div style={{ width: 1, height: 0, opacity: 0 }}>
                    {desc === 'other' ? otherSignResult : signResult}
                  </div>
                </Clipboard>
              </span>
            }
            errMsg={otherSignResultErrMsg}
            isTextArea
            value={desc === 'other' ? otherSignResult : signResult}
            rows={10}
            onChange={value => {
              if (desc === 'other') {
                this.setState({
                  otherSignResult: value,
                });
              } else {
                this.setState({
                  signResult: value,
                });
              }
            }}
            onBlur={this.checkAll.checkOtherSignResult}
          />
        </div>
      </Modal>
    );
  }
}

export default SignResultModal;
