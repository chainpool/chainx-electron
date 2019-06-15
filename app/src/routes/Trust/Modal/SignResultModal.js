import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Input } from '../../../components';
import * as styles from './SignResultModal.less';

class SignResultModal extends Component {
  async componentDidMount() {
    const {
      globalStore: { modal: { data: { callback } } = {} },
    } = this.props;

    const res = await callback();
    if (res) {
      console.log(res, 'ledger签名结果');
      this.setState({
        signResult: res,
      });
    }
  }
  state = {
    signResult: '',
  };
  render() {
    const { selectOne, signResult } = this.state;
    const {
      model: { dispatch, openModal, closeModal },
      globalStore: { modal: { data: { desc } = {} } = {} },
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
            rows={8}
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
