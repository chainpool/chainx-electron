import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Input } from '../../../components';
import * as styles from './SignResultModal.less';

class SignResultModal extends Component {
  state = {
    otherSignResult: '',
  };
  render() {
    const { otherSignResult } = this.state;
    const {
      model: { dispatch, openModal },
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
              const description = [
                { name: 'operation', value: () => <FormattedMessage id={'RespondMultiSigWithdrawal'} /> },
                {
                  name: () => <FormattedMessage id={'WhetherSignature'} />,
                  value: () => <FormattedMessage id={'TrueSign'} />,
                },
              ];
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
                          isSpecialModel,
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
                          isSpecialModel,
                        },
                      });
                    },
                  },
                });
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.SignChannelSelectModal}>
          <Input.Text
            isTextArea
            value={desc === 'other' ? otherSignResult : signResult}
            rows={10}
            onChange={value => {
              if (desc === 'other') {
                this.setState({
                  otherSignResult: value.trim(),
                });
              } else {
                this.setState({
                  signResult: value,
                });
              }
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default SignResultModal;
