import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Input } from '../../../components';
import * as styles from './SignResultModal.less';

class SignResultModal extends Component {
  render() {
    const {
      model: { dispatch, openModal },
      globalStore: { modal: { data: { desc, signResult } = {} } = {} },
    } = this.props;

    return (
      <Modal
        title={<span>签名结果{desc === 'other' ? <span className={styles.other}>(其他)</span> : null}</span>}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (signResult) {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [
                      { name: 'operation', value: () => <FormattedMessage id={'RespondMultiSigWithdrawal'} /> },
                      {
                        name: () => <FormattedMessage id={'WhetherSignature'} />,
                        value: () => <FormattedMessage id={'TrueSign'} />,
                      },
                    ],
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
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.SignChannelSelectModal}>
          <Input.Text
            isTextArea
            value={signResult}
            rows={10}
            onChange={value => {
              this.setState({
                signResult: value,
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default SignResultModal;
