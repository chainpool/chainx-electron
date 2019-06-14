import React, { Component } from 'react';
import { Button, Input, FormattedMessage, Modal } from '../../../components';
import { InputHorizotalList } from '../../components';
import * as styles from './ConstructSpecialTradeModal.less';

class ConstructSpecialTradeModal extends Component {
  state = {
    sender: '',
    receiver: '',
    balance: '',
  };
  render() {
    const { sender, receiver, balance } = this.state;
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
        <div className={styles.ConstructSpecialTradeModal}>
          <Input.Address
            label={'发送方地址'}
            value={sender}
            options={[{ label: '1', value: 1 }]}
            onChange={value => {
              this.setState({
                sender: value,
              });
            }}
          />
          <Input.Address
            label={'接收方地址'}
            value={receiver}
            options={[{ label: '1', value: 1 }]}
            onChange={value => {
              this.setState({
                receiver: value,
              });
            }}
          />
          <InputHorizotalList
            left={
              <Input.Text
                label="金额"
                value={balance}
                suffix="BTC"
                onChange={value => {
                  this.setState({
                    balance: value,
                  });
                }}
              />
            }
            right={<Input.Text label="手续费率" value={'kkkk'} suffix="Satoshis/KB" />}
          />
          <Input.Text label="待签原文" isTextArea rows={10} disabled />
        </div>
      </Modal>
    );
  }
}

export default ConstructSpecialTradeModal;
