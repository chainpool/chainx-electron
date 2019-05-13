import React, { Component } from 'react';
import { Modal, Input, Button, FormattedMessage } from '../../../components';
import { Patterns } from '../../../utils';
import * as styles from './WithdrawConstructModal.less';

class WithdrawConstructModal extends Component {
  state = {
    withDrawIndexSignList: [],
    withDrawIndexSignListErrMsg: '',
    password: '',
    passwordErrMsg: '',
    tx: '',
    txErrMsg: '',
    fee: '',
    feeErrMsg: '',
  };

  checkAll = {
    checkWithDrawIndexSignList: async () => {
      const { withDrawIndexSignList, fee } = this.state;
      const {
        model: { dispatch, setPrecision },
      } = this.props;
      let error = '';
      try {
        await dispatch({
          type: 'sign',
          payload: {
            withdrawList: this.getWithdrawList(withDrawIndexSignList),
            ...(fee ? { bitFee: setPrecision(fee, 8, true) } : {}),
          },
        });
      } catch (err) {
        if (err.message === 'UTXONotEnoughFee') {
          error = <FormattedMessage id={'UTXONotEnoughFee'} />;
        } else {
          error = err.message;
        }
      }

      const errMsg = Patterns.check('required')(withDrawIndexSignList) || error;
      this.setState({ withDrawIndexSignListErrMsg: errMsg });
      return errMsg;
    },
    checkTx: () => {
      const { tx } = this.state;
      const errMsg = Patterns.check('required')(tx);
      this.setState({ txErrMsg: errMsg });
      return errMsg;
    },
    checkFee: () => {
      const { fee } = this.state;
      const errMsg = Patterns.check('required')(fee);
      this.setState({ feeErrMsg: errMsg });
      return errMsg;
    },
    confirm: async () => {
      const result1 = await this.checkAll['checkWithDrawIndexSignList']();
      const result2 = await this.checkAll['checkTx']();
      const result3 = await this.checkAll['checkFee']();
      return !result1 && !result2 && !result3;
    },
  };

  getWithdrawList = withDrawIndexSignList => {
    const {
      model: { normalizedOnChainAllWithdrawList },
    } = this.props;
    return withDrawIndexSignList.map((item = {}) => {
      const findOne = normalizedOnChainAllWithdrawList.filter((one = {}) => item.value === one.id)[0] || {};
      return {
        ...findOne,
        amount: findOne.balance_primary,
      };
    });
  };
  render() {
    const { checkAll } = this;
    const {
      withDrawIndexSignList,
      withDrawIndexSignListErrMsg,
      tx,
      txErrMsg,
      redeemScript,
      fee,
      feeErrMsg,
    } = this.state;
    const {
      model: {
        normalizedOnChainAllWithdrawList = [],
        dispatch,
        openModal,
        setPrecision,
        commentFee,
        lastPredictTradeLength,
      },
    } = this.props;
    const options = normalizedOnChainAllWithdrawList
      .map((item = {}) => ({
        label: item.id,
        value: item.id,
        status: item.status,
      }))
      .filter((item = {}) => item.status !== 'signing' && item.status !== 'processing');

    const setTxFromIndexOrFee = async () => {
      const { withDrawIndexSignList, fee } = this.state;
      try {
        const tx = await dispatch({
          type: 'sign',
          payload: {
            withdrawList: this.getWithdrawList(withDrawIndexSignList),
            ...(fee ? { bitFee: setPrecision(fee, 8, true) } : {}),
          },
        });
        if (tx) {
          this.setState(
            {
              tx,
            },
            checkAll.checkTx
          );
        }
      } catch (err) {
        this.setState({
          tx: '',
        });
      }
    };

    return (
      <Modal
        title={<FormattedMessage id={'BuildMultiSigWithdrawal'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={async () => {
              if (await checkAll.confirm()) {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [{ name: '操作', value: '构造多签提现' }],
                    callback: () => {
                      return dispatch({
                        type: 'createWithdrawTx',
                        payload: {
                          withdrawList: this.getWithdrawList(withDrawIndexSignList),
                          tx,
                          redeemScript,
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
        <div>
          <Input.Select
            errMsgIsOutside
            errMsg={withDrawIndexSignListErrMsg}
            multi={true}
            label={<FormattedMessage id={'WithdrawalList'} />}
            options={options}
            onChange={value => {
              this.setState(
                {
                  withDrawIndexSignList: value,
                },
                async () => {
                  await setTxFromIndexOrFee();
                }
              );
            }}
            onBlur={checkAll.checkWithDrawIndexSignList}
          />
          <Input.Text errMsgIsOutside value={tx} errMsg={txErrMsg} isTextArea label={'OriginalDataToSigned'} rows={5} />
          <Input.Text
            isDecimal="decimal"
            precision={8}
            errMsgIsOutside
            value={fee}
            suffix={'BTC'}
            errMsg={feeErrMsg}
            onChange={async value => {
              this.setState(
                {
                  fee: value,
                  withDrawIndexSignListErrMsg: '',
                },
                async () => {
                  await setTxFromIndexOrFee();
                }
              );
            }}
            label={
              <div>
                <FormattedMessage id={'BitCoinFee'} />
                <span className={styles.bitcoinfee}>
                  {lastPredictTradeLength ? `(最终交易长度预估:${lastPredictTradeLength})` : null}
                </span>
                {commentFee && <span className={styles.bitcoinfee}>推荐手续费:{commentFee}</span>}
              </div>
            }
            onBlur={() => {
              checkAll.checkFee();
              checkAll.checkWithDrawIndexSignList();
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawConstructModal;
