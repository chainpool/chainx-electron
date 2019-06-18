import React, { Component } from 'react';
import { Input, FormattedMessage, Modal, Clipboard } from '../../../components';
import { InputHorizotalList } from '../../components';
import * as styles from './ConstructSpecialTradeModal.less';

class ConstructSpecialTradeModal extends Component {
  componentDidMount() {
    // this.constructSpecialTrade();
  }
  state = {
    sender: '',
    receiver: '',
    balance: '',
    feeRate: '',
    tx: '',
    errMsg: '',
  };

  constructSpecialTrade = () => {
    const { sender, balance, receiver, feeRate } = this.state;
    if (sender && balance && receiver && feeRate) {
      const {
        model: { dispatch, openModal, closeModal },
      } = this.props;
      this.setState({
        errMsg: '',
      });
      dispatch({
        type: 'sign',
        payload: {
          withdrawList: [
            {
              amount: balance,
              addr: receiver,
              userInputbitFee: feeRate,
            },
          ],
          url: sender,
        },
      })
        .then(res => {
          this.setState({
            errMsg: '',
          });
          console.log(res, '-----------------res');
        })
        .catch(err => {
          this.setState({
            errMsg: err.message,
          });
          console.log(err, err.message, '---err');
        });
    }
  };

  render() {
    const { constructSpecialTrade } = this;
    const { sender, receiver, balance, feeRate, tx, errMsg } = this.state;
    const {
      model: { dispatch, openModal, closeModal },
    } = this.props;

    return (
      <Modal title={'构造特殊交易'} button={null}>
        <div className={styles.ConstructSpecialTradeModal}>
          <Input.Address
            showMatchOption={false}
            label={'发送方地址'}
            value={sender}
            options={[{ label: '1', value: 1 }]}
            onChange={value => {
              this.setState({
                sender: value,
              });
            }}
            onBlur={constructSpecialTrade}
          />
          <Input.Address
            showMatchOption={false}
            label={'接收方地址'}
            value={receiver}
            options={[{ label: '1', value: 1 }]}
            onChange={value => {
              this.setState({
                receiver: value,
              });
            }}
            onBlur={constructSpecialTrade}
          />
          <InputHorizotalList
            left={
              <Input.Text
                isDecimal="decimal"
                label="金额"
                value={balance}
                suffix="BTC"
                onChange={value => {
                  this.setState({
                    balance: value,
                  });
                }}
                onBlur={constructSpecialTrade}
              />
            }
            right={
              <Input.Text
                isDecimal="decimal"
                label="手续费"
                value={feeRate}
                //suffix="Satoshis/KB"
                onChange={value => {
                  this.setState({
                    feeRate: value,
                  });
                }}
                onBlur={constructSpecialTrade}
              />
            }
          />
          <Input.Text
            label={
              <span className={styles.tosign}>
                待签原文
                <Clipboard id="copy">
                  <div style={{ width: 1, height: 0, opacity: 0 }}>123444</div>
                </Clipboard>
              </span>
            }
            isTextArea
            rows={10}
            disabled
            value={tx}
          />
          {errMsg && <div className={styles.errMsg}>{<FormattedMessage id={errMsg} />}</div>}
        </div>
      </Modal>
    );
  }
}

export default ConstructSpecialTradeModal;
