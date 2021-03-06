import React, { Component } from 'react';
import { Input, FormattedMessage, Modal, Clipboard } from '../../../components';
import { InputHorizotalList } from '../../components';
import { formatNumber, Inject, Patterns, setBlankSpace } from '../../../utils';
import * as styles from './ConstructSpecialTradeModal.less';

@Inject(({ assetStore }) => ({ assetStore }))
class ConstructSpecialTradeModal extends Component {
  state = {
    sender: '',
    senderErrMsg: '',
    receiver: '',
    receiverErrMsg: '',
    balance: '',
    balanceErrMsg: '',
    balanceMinValue: '',
    feeRate: '',
    feeRateErrMsg: '',
    tx: '',
    errMsg: '',
  };

  componentDidMount() {
    this.startInit();
  }

  startInit = () => {
    const {
      assetStore: { dispatch: dispatchAssetStore },
    } = this.props;
    dispatchAssetStore({
      type: 'getMinimalWithdrawalValueByToken',
      payload: {
        token: 'BTC',
      },
    }).then(res => {
      if (res) {
        this.setState({
          balanceMinValue: res.minimalWithdrawal,
        });
      }
    });
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
      const { balance, balanceMinValue } = this.state;
      const errMsg =
        Patterns.check('required')(balance) ||
        Patterns.check('smallerOrEqual')(
          Number(this.props.model.setPrecision(balanceMinValue, 'BTC')),
          balance,
          <FormattedMessage id={'WithdrawAmountMustOverFee'} />
        );
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
      return ['checkSender', 'checkReceiver', 'checkBalance', 'checkFee'].every(item => !this.checkAll[item]());
    },
  };

  constructSpecialTrade = () => {
    const { sender, balance, receiver, feeRate } = this.state;
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
          withdrawList: [
            {
              amount: formatNumber.toPrecision(balance, 8, true),
              addr: receiver,
            },
          ],
          userInputbitFee: formatNumber.toPrecision(feeRate, 8, true),
          url: sender,
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

  render() {
    const { constructSpecialTrade } = this;
    const {
      sender,
      senderErrMsg,
      receiver,
      receiverErrMsg,
      balance,
      balanceMinValue,
      balanceErrMsg,
      feeRate,
      feeRateErrMsg,
      tx,
      errMsg,
    } = this.state;
    const {
      model: { setPrecision },
    } = this.props;

    const balanceMinValueShow = setPrecision(balanceMinValue, 'BTC');

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
            //onBlur={constructSpecialTrade}
          />
          <Input.Text
            isOutSide
            errMsg={receiverErrMsg}
            showMatchOption={false}
            label={'接收方地址'}
            value={receiver}
            options={[{ label: '1', value: 1 }]}
            onChange={value => {
              this.setState(
                {
                  receiver: value,
                },
                constructSpecialTrade
              );
            }}
          />
          <InputHorizotalList
            left={
              <Input.Text
                isOutSide
                errMsg={balanceErrMsg}
                isDecimal="decimal"
                label={
                  <span>
                    金额
                    {balanceMinValueShow && (
                      <span className={styles.minValue}>
                        (最小提现金额 {setBlankSpace(balanceMinValueShow, 'BTC')})
                      </span>
                    )}
                  </span>
                }
                value={balance}
                suffix="BTC"
                onChange={value => {
                  this.setState(
                    {
                      balance: value,
                    },
                    constructSpecialTrade
                  );
                }}
              />
            }
            right={
              <Input.Text
                isOutSide
                errMsg={feeRateErrMsg}
                isDecimal="decimal"
                label="手续费"
                value={feeRate}
                suffix="BTC"
                onChange={value => {
                  this.setState(
                    {
                      feeRate: value,
                    },
                    constructSpecialTrade
                  );
                }}
              />
            }
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
            rows={10}
            disabled
            value={tx}
          />
        </div>
      </Modal>
    );
  }
}

export default ConstructSpecialTradeModal;
