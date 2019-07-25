import React, { Component } from 'react';
import { Input, FormattedMessage, Modal, Clipboard, Icon } from '../../../components';
import { InputHorizotalList } from '../../components';
import { formatNumber, Inject, Patterns, _, classNames, isEmpty } from '../../../utils';
import * as styles from './ConstructSpecialTradeModal.less';

@Inject(({ assetStore }) => ({ assetStore }))
class ConstructSpecialTradeModal extends Component {
  state = {
    sender: '',
    senderErrMsg: '',
    receiver: '',
    receiverErrMsg: '',
    receivers: [{ receiver: '', receiverErrMsg: '', balance: '', balanceErrMsg: '' }],
    redeemScript: '',
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
      const { receivers } = this.state;
      let errMsg = '';
      for (let index = 0; index < receivers.length; index++) {
        const item = receivers[index];
        const err =
          Patterns.check('required')(item.receiver) ||
          Patterns.check('isBTCAddress')(item.receiver, isTestBitCoinNetWork());
        if ((!isEmpty(item.receiver) || !isEmpty(item.balance)) && err) {
          this.changeReceivers({ receiverErrMsg: err, index });
          errMsg = err;
          break;
        } else {
          this.changeReceivers({ receiverErrMsg: '', index });
        }
      }
      return errMsg;
    },
    checkBalance: () => {
      let errMsg = '';
      for (let index = 0; index < this.state.receivers.length; index++) {
        const { receivers } = this.state;
        const item = receivers[index];
        const err = Patterns.check('smaller')(0, item.balance, '必须大于0');
        if ((!isEmpty(item.receiver) || !isEmpty(item.balance)) && err) {
          this.changeReceivers({ balanceErrMsg: err, index });
          errMsg = err;
          break;
        } else {
          this.changeReceivers({ balanceErrMsg: '', index });
        }
      }
      return errMsg;
    },
    checkFee: () => {
      const { feeRate } = this.state;
      const errMsg = Patterns.check('required')(feeRate) || Patterns.check('smaller')(0, feeRate, '必须大于0');
      this.setState({ feeRateErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkSender', 'checkRedeemScript', 'checkReceiver', 'checkBalance', 'checkFee'].every(
        item => !this.checkAll[item]()
      );
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
          withdrawList: receivers
            .filter(item => item.receiver && item.balance)
            .map(item => ({
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

  changeReceivers = ({ receiver, balance, receiverErrMsg, balanceErrMsg, index }, callback) => {
    const { receivers } = this.state;
    const newReceivers = _.cloneDeep(receivers).map((item, ins) => {
      if (ins === index) {
        return {
          ...item,
          ...(!_.isUndefined(receiver) ? { receiver } : {}),
          ...(!_.isUndefined(balance) ? { balance } : {}),
          ...(receiverErrMsg ? { receiverErrMsg } : { receiverErrMsg: '' }),
          ...(balanceErrMsg ? { balanceErrMsg } : { balanceErrMsg: '' }),
        };
      }
      return item;
    });
    this.setState(
      {
        receivers: newReceivers,
      },
      () => {
        _.isFunction(callback) && callback();
      }
    );
  };

  render() {
    const { constructSpecialTrade, changeReceivers } = this;
    const {
      sender,
      senderErrMsg,
      receivers,
      redeemScript,
      redeemScriptErrMsg,
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
            <div key={index} className={styles.receiverrow}>
              <InputHorizotalList
                left={
                  <Input.Text
                    errMsgIsOutside
                    errMsg={item.receiverErrMsg}
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
                    errMsgIsOutside
                    errMsg={item.balanceErrMsg}
                    isDecimal="decimal"
                    label={`金额`}
                    value={item.balance}
                    suffix="BTC"
                    onChange={value => {
                      this.changeReceivers(
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
              <Icon
                onClick={() => {
                  const copy = _.cloneDeep(receivers);
                  console.log(index);
                  if (index === 0) {
                    copy.splice(receivers.length, 0, {
                      receiver: '',
                      receiverErrMsg: '',
                      balance: '',
                      balanceErrMsg: '',
                    });
                  } else {
                    copy.splice(index, 1);
                  }
                  this.setState(
                    {
                      receivers: copy,
                    },
                    constructSpecialTrade
                  );
                }}
                className={classNames(styles.receiverrowIcon, index === 0 ? styles.add : styles.remove)}
                name={index === 0 ? 'tianjiahang' : 'shanchuhang'}
              />
            </div>
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
