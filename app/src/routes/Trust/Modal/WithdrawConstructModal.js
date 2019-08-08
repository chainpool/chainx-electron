import React, { Component } from 'react';
import { Button, FormattedMessage, Input, Modal } from '../../../components';
import { Patterns } from '../../../utils';

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
        model: { dispatch },
      } = this.props;

      let errorMsg = '';
      if ((withDrawIndexSignList || []).length <= 0) {
        errorMsg = '必填';
        this.setState({ withDrawIndexSignListErrMsg: errorMsg });
        return errorMsg;
      }

      const withdrawList = (withDrawIndexSignList || []).map(withdrawal => {
        return {
          addr: withdrawal.addr,
          amount: withdrawal.amount,
        };
      });

      try {
        await dispatch({
          type: 'constructWithdrawTx',
          payload: {
            withdrawList,
            feeRate: fee,
          },
        });
      } catch (err) {
        if (err.message === 'UTXONotEnoughFee') {
          errorMsg = <FormattedMessage id={'UTXONotEnoughFee'} />;
        } else {
          errorMsg = err.message;
        }
      }

      this.setState({ withDrawIndexSignListErrMsg: errorMsg });
      return errorMsg;
    },
    checkTx: () => {
      const { tx } = this.state;
      const errMsg = Patterns.check('required')(tx);
      this.setState({ txErrMsg: errMsg });
      return errMsg;
    },
    checkFee: () => {
      const { fee } = this.state;
      const errMsg =
        Patterns.check('required')(fee) ||
        Patterns.check('smaller')(0, fee, <FormattedMessage id={'AmountBiggerThan'} values={{ one: 0 }} />);
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

  render() {
    const { checkAll } = this;
    const { withDrawIndexSignList, withDrawIndexSignListErrMsg, tx, txErrMsg, fee, feeErrMsg } = this.state;
    const {
      model: { normalizedOnChainAllWithdrawList = [], dispatch, openModal },
    } = this.props;

    const options = normalizedOnChainAllWithdrawList
      .filter((item = {}) => item.status !== 'signing' && item.status !== 'processing')
      .map((item = {}) => ({
        label: item.id,
        value: item.id,
        id: item.id,
        amount: item.balance_primary,
        addr: item.addr,
        status: item.status,
      }));

    const setTxFromIndexOrFee = async () => {
      const { withDrawIndexSignList, fee } = this.state;
      const withdrawList = (withDrawIndexSignList || []).map(withdrawal => {
        return {
          addr: withdrawal.addr,
          amount: withdrawal.amount,
        };
      });

      try {
        const tx = await dispatch({
          type: 'constructWithdrawTx',
          payload: {
            withdrawList: withdrawList,
            feeRate: fee,
          },
        });

        if (tx) {
          this.setState(
            {
              tx,
            },
            () => {
              checkAll.checkTx();
            }
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
                    description: [
                      { name: 'operation', value: () => <FormattedMessage id={'BuildMultiSigWithdrawal'} /> },
                    ],
                    callback: () => {
                      const ids = withDrawIndexSignList.map(item => item.id);

                      return dispatch({
                        type: 'createWithdrawTx',
                        payload: { ids, tx },
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
          <Input.Text
            isDecimal="decimal"
            precision={8}
            errMsgIsOutside
            value={fee}
            suffix={'Satoshis/byte'}
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
                <FormattedMessage id={'BitCoinFeeRate'} />
              </div>
            }
            onBlur={() => {
              checkAll.checkFee();
            }}
          />
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
          <Input.Text
            errMsgIsOutside
            value={tx}
            errMsg={txErrMsg}
            isTextArea
            label={<FormattedMessage id={'OriginalDataToSigned'} />}
            rows={5}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawConstructModal;
