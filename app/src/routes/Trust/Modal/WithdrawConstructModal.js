import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';
import bip38 from 'bip38';
import wif from 'wif';

class WithdrawConstructModal extends Component {
  state = {
    withDrawIndexSignList: [],
    withDrawIndexSignListErrMsg: '',
    password: '',
    tx: '',
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
    checkPassword: () => {
      const {
        model: { trusts },
        password,
      } = this.props;
      const findOne = trusts.filter((item = {}) => item.chain === 'Bitcoin')[0] || {};
      const decodedHotPrivateKey = findOne.decodedHotPrivateKey;
      try {
        const decryptedKey = bip38.decrypt(decodedHotPrivateKey, password);
        wif.encode(0x80, decryptedKey.privateKey, decryptedKey.compressed);
      } catch (err) {
        console.log(err, '--------------解析报错');
      }

      console.log(findOne, '---------------findOne');
    },
    confirm: () => {
      return ['checkWithDrawIndexSignList'].every(item => !this.checkAll[item]());
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
    const { withDrawIndexSignList, withDrawIndexSignListErrMsg, password, tx } = this.state;
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
            onBlur={checkAll.checkPassword}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawConstructModal;
