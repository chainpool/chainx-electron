import React, { Component } from 'react';
import { Input, FormattedMessage, Modal, Clipboard } from '../../../components';
import { InputHorizotalList } from '../../components';
import { formatNumber, Inject, Patterns, _ } from '../../../utils';
import * as styles from './ConstructSpecialTradeModal.less';

@Inject(({ assetStore }) => ({ assetStore }))
class ConstructSpecialTradeModal extends Component {
  state = {
    sender: '2N4CX91SRPQWVb1nPe43e88rLmGrq3VHPYS',
    senderErrMsg: '',
    receiver: '2NA67fZ6ZmAioyo3dcGk3JeiFEaHNueGhtT',
    receivers: [
      { receiver: '2NA67fZ6ZmAioyo3dcGk3JeiFEaHNueGhtT', balance: '' },
      { receiver: '2NA67fZ6ZmAioyo3dcGk3JeiFEaHNueGhtT', balance: '' },
    ],
    receiverErrMsg: '',
    redeemScript:
      '5421034575d9ef1baf0d85fb2700cea894eb07cd1f5f54a35d0b5dfe9ea1432f2a67d7210227e11054e41c9bcc2d2e9953281de93711727fb75a5e1e9bdfe3a80685e1f4e02102b88736301733df21ea4513bc4ab48b543e4d57d3874845711e77dd77f110389d210284c57fddf6fd20f1a255909fdffc9e5f0eb76be4191d31433b5f1bc990d989812103f11ee283a4e9a8f5e2e68c8b24652a5603a4f50ac9e26a614d9396f7482ff6d22102ef635b7ddea5a26c76aecf4194bfef0e2b22a217d7a0e8eaadce0506d1ed7b2756ae',
    redeemScriptErrMsg: '',
    balance: '',
    balanceErrMsg: '',
    feeRate: '',
    feeRateErrMsg: '',
    tx: '',
    errMsg: '',
  };

  checkAll = {
    checkSender: () => {
      const { sender } = this.state;
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      const errMsg =
        Patterns.check('required')(sender) || Patterns.check('isBTCAddress')(sender, isTestBitCoinNetWork());
      this.setState({ senderErrMsg: errMsg });
      return errMsg;
    },
    checkRedeemScript: () => {
      const { redeemScript } = this.state;
      const errMsg = Patterns.check('required')(redeemScript) || Patterns.check('isRedeemScript')(redeemScript);
      this.setState({ redeemScriptErrMsg: errMsg });
      return errMsg;
    },
    checkReceiver: () => {
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      const { receiver } = this.state;
      const errMsg =
        Patterns.check('required')(receiver) || Patterns.check('isBTCAddress')(receiver, isTestBitCoinNetWork());
      this.setState({ receiverErrMsg: errMsg });
      return errMsg;
    },
    checkBalance: () => {
      const { balance } = this.state;
      const errMsg = Patterns.check('required')(balance) || Patterns.check('smaller')(0, balance, '必须大于0');
      this.setState({ balanceErrMsg: errMsg });
      return errMsg;
    },
    checkFee: () => {
      const { feeRate } = this.state;
      const errMsg = Patterns.check('required')(feeRate) || Patterns.check('smaller')(0, feeRate, '必须大于0');
      this.setState({ feeRateErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkSender', 'checkRedeemScript', 'checkFee'].every(item => !this.checkAll[item]());
    },
  };

  constructSpecialTrade = () => {
    const { sender, balance, receivers, redeemScript, feeRate } = this.state;
    if (this.checkAll.confirm()) {
      const {
        model: { dispatch },
      } = this.props;
      this.setState({
        errMsg: '',
        tx: '',
      });
      dispatch({
        type: 'sign',
        payload: {
          withdrawList: receivers.map(item => ({
            amount: formatNumber.toPrecision(item.balance, 8, true),
            addr: item.receiver,
          })),
          userInputbitFee: feeRate,
          url: sender,
          redeemScript,
        },
      })
        .then(res => {
          this.setState({
            errMsg: '',
            tx: `0x${res}`,
          });
        })
        .catch(err => {
          this.setState({
            errMsg: err.message,
            tx: '',
          });
        });
    } else {
      this.setState({
        tx: '',
        errMsg: '',
      });
    }
  };

  changeReceivers = ({ receiver, balance, index }, callback) => {
    const { receivers } = this.state;
    const newReceivers = receivers.map((item, ins) => {
      if (ins === index) {
        return {
          ...item,
          ...(receiver ? { receiver } : {}),
          ...(balance ? { balance } : {}),
        };
      }
      return item;
    });
    this.setState(
      {
        receivers: newReceivers,
      },
      _.isFunction(callback) && callback()
    );
  };

  render() {
    const { constructSpecialTrade, changeReceivers } = this;
    const {
      sender,
      senderErrMsg,
      receivers,
      receiver,
      receiverErrMsg,
      redeemScript,
      redeemScriptErrMsg,
      balance,
      balanceErrMsg,
      feeRate,
      feeRateErrMsg,
      tx,
      errMsg,
    } = this.state;

    return (
      <Modal title={'构造特殊交易'} button={null}>
        <div className={styles.ConstructSpecialTradeModal}>
          <Input.Text
            isOutSide
            errMsg={senderErrMsg}
            showMatchOption={false}
            label={'发送方地址'}
            value={sender}
            options={[{ label: '1', value: 1 }]}
            onChange={value => {
              this.setState(
                {
                  sender: value,
                },
                constructSpecialTrade
              );
            }}
            onBlur={constructSpecialTrade}
          />
          <Input.Text
            isTextArea
            rows={5}
            isOutSide
            errMsg={redeemScriptErrMsg}
            label={'赎回脚本'}
            value={redeemScript}
            onChange={value => {
              this.setState(
                {
                  redeemScript: value.replace(/^0x/, ''),
                },
                constructSpecialTrade
              );
            }}
          />
          {receivers.map((item, index) => (
            <InputHorizotalList
              key={index}
              left={
                <Input.Text
                  isOutSide
                  errMsg={receiverErrMsg}
                  showMatchOption={false}
                  label={'接收方地址'}
                  value={item.receiver}
                  options={[{ label: '1', value: 1 }]}
                  onChange={value => {
                    changeReceivers(
                      {
                        receiver: value,
                        index,
                      },
                      constructSpecialTrade
                    );
                  }}
                />
              }
              right={
                <Input.Text
                  isOutSide
                  errMsg={balanceErrMsg}
                  isDecimal="decimal"
                  label="金额"
                  value={item.balance}
                  suffix="BTC"
                  onChange={value => {
                    changeReceivers(
                      {
                        balance: value,
                        index,
                      },
                      constructSpecialTrade
                    );
                  }}
                />
              }
            />
          ))}

          <Input.Text
            isOutSide
            errMsg={feeRateErrMsg}
            isDecimal="decimal"
            label="手续费率"
            value={feeRate}
            suffix="Satoshis/byte"
            onChange={value => {
              this.setState(
                {
                  feeRate: value,
                },
                constructSpecialTrade
              );
            }}
          />
          <Input.Text
            label={
              <span className={styles.tosign}>
                待签原文
                <Clipboard id="copy" className={tx ? styles.active : styles.disabeld}>
                  <div style={{ width: 1, height: 0, opacity: 0 }}>{tx}</div>
                </Clipboard>
                {errMsg && (
                  <span className={styles.errMsg}>
                    <FormattedMessage id={errMsg} />
                  </span>
                )}
              </span>
            }
            isTextArea
            rows={5}
            disabled
            value={tx}
          />
        </div>
      </Modal>
    );
  }
}

export default ConstructSpecialTradeModal;
