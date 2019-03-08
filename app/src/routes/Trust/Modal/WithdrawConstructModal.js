import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';

class WithdrawConstructModal extends Component {
  state = {
    withDrawIndexSignList: [],
    withDrawIndexSignListErrMsg: '',
    password: '',
    passwordErrMsg: '',
    tx: '',
    txErrMsg: '',
  };

  checkAll = {
    checkWithDrawIndexSignList: async () => {
      const { withDrawIndexSignList } = this.state;
      const {
        model: { dispatch },
      } = this.props;
      let error = '';
      try {
        await dispatch({
          type: 'sign',
          payload: {
            withdrawList: this.getWithdrawList(withDrawIndexSignList),
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
    checkPassword: () => {
      const { password } = this.state;
      const {
        model: { trusts },
        accountStore: {
          currentAccount: { address },
        },
      } = this.props;
      const findOne = trusts.filter((item = {}) => item.chain === 'Bitcoin' && address === item.address)[0] || {};
      const decodedHotPrivateKey = findOne.decodedHotPrivateKey;
      const errMsg =
        Patterns.check('required')(password) ||
        Patterns.check('isHotPrivateKeyPassword')(decodedHotPrivateKey, password);
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    confirm: async () => {
      const result1 = await this.checkAll['checkWithDrawIndexSignList']();
      const result2 = await this.checkAll['checkTx']();
      const result3 = await this.checkAll['checkPassword']();
      return !result1 && !result2 && !result3;
    },
  };

  getWithdrawList = withDrawIndexSignList => {
    const {
      model: { normalizedOnChainAllWithdrawList },
    } = this.props;
    return withDrawIndexSignList.map((item = {}) => {
      const findOne = normalizedOnChainAllWithdrawList.filter((one = {}, index) => item.value === index)[0] || {};
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
      password,
      passwordErrMsg,
      tx,
      txErrMsg,
      redeemScript,
    } = this.state;
    const {
      model: { normalizedOnChainAllWithdrawList, dispatch, openModal },
    } = this.props;
    const options = normalizedOnChainAllWithdrawList.map((item, index) => ({ label: index + 1, value: index }));

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
            label="选择链"
            options={options}
            onChange={value => {
              this.setState(
                {
                  withDrawIndexSignList: value,
                },
                async () => {
                  try {
                    const tx = await dispatch({
                      type: 'sign',
                      payload: {
                        withdrawList: this.getWithdrawList(value),
                      },
                    });
                    if (tx) {
                      this.setState({
                        tx,
                      });
                    }
                  } catch {
                    this.setState({
                      tx: '',
                    });
                  }
                }
              );
            }}
            onBlur={checkAll.checkWithDrawIndexSignList}
          />
          <Input.Text value={tx} errMsg={txErrMsg} isTextArea label="待签原文" rows={5} />
          <Input.Text
            errMsg={passwordErrMsg}
            value={password}
            isPassword
            placeholder="输入热私钥密码"
            onChange={value => {
              this.setState({
                password: value,
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawConstructModal;
