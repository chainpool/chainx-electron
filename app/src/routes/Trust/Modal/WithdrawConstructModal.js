import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';

class WithdrawConstructModal extends Component {
  state = {
    withDrawIndexSignList: [],
    withDrawIndexSignListErrMsg: '',
    password: '',
    tx: '',
  };

  checkAll = {
    checkWithDrawIndexSignList: () => {
      const { withDrawIndexSignList } = this.state;
      const errMsg = Patterns.check('required')(withDrawIndexSignList);
      this.setState({ withDrawIndexSignListErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkHotPrivateKey', 'checkPassword', 'checkConfirmedPassword'].every(item => !this.checkAll[item]());
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
    const { withDrawIndexSignList, password, tx } = this.state;
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
            onClick={() => {
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
                      },
                    });
                  },
                },
              });
            }}>
            确定
          </Button>
        }>
        <div>
          <Input.Select
            multi={true}
            label="选择链"
            options={options}
            onChange={value => {
              this.setState(
                {
                  withDrawIndexSignList: value,
                },
                async () => {
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
                }
              );
            }}
            onBlur={checkAll.checkWithDrawIndexSignList}
          />
          <Input.Text value={tx} isTextArea label="待签原文" rows={5} />
          <Input.Text
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
