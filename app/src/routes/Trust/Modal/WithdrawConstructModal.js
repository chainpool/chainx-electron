import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
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
        error = err;
      }

      const errMsg = Patterns.check('required')(withDrawIndexSignList) || error.message;
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
      model: { normalizedOnChainAllWithdrawList = [], dispatch, openModal, setPrecision },
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
        title="构造多签提现"
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
            确定
          </Button>
        }>
        <div>
          <Input.Select
            errMsgIsOutside
            errMsg={withDrawIndexSignListErrMsg}
            multi={true}
            label="提现列表"
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
          <Input.Text errMsgIsOutside value={tx} errMsg={txErrMsg} isTextArea label="待签原文" rows={5} />
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
                Bitcoin手续费<span className={styles.bitcoinfee}>{tx.length ? `(交易长度:${tx.length})` : null}</span>
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
