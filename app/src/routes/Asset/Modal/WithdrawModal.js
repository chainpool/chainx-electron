import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { Inject, Patterns } from '../../../utils';
import { PlaceHolder } from '../../../constants';

@Inject(({ addressManageStore }) => ({ addressManageStore }))
class WithdrawModal extends Component {
  state = {
    address: '',
    addressErrMsg: '',
    amount: '',
    amountErrMsg: '',
    remark: '',
  };
  checkAll = {
    checkAddress: () => {
      const { address } = this.state;
      const {
        globalStore: { modal: { data: { token } = {} } = {} },
      } = this.props;
      // TODO: 根据token检查地址格式
      const errMsg = Patterns.check('required')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: () => {
      const { amount } = this.state;
      const errMsg = Patterns.check('required')(amount);
      this.setState({ amountErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkAddress', 'checkAmount'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { address, addressErrMsg, amount, amountErrMsg, remark } = this.state;
    const {
      model: { openModal, dispatch },
      globalStore: { modal: { data: { token, freeShow, chain } = {} } = {} },
      addressManageStore: { addresses },
    } = this.props;

    const options = addresses
      .filter(address => address.chain === token)
      .map(address => {
        return {
          label: address.label,
          value: address.address,
        };
      });

    return (
      <Modal
        title="跨链提现"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [{ name: '操作', value: '提现' }],
                    callback: ({ signer, acceleration }) => {
                      dispatch({
                        type: 'withdraw',
                        payload: {
                          signer,
                          acceleration,
                          token,
                          amount,
                          dest: address,
                          remark,
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
          <Input.Address
            prefix={chain}
            label="收款地址"
            value={address}
            errMsg={addressErrMsg}
            options={options}
            onChange={value => {
              this.setState({ address: value });
              setTimeout(checkAll.checkAddress, 0);
            }}
            onBlur={checkAll.checkAddress}
          />
          <InputHorizotalList
            left={
              <Input.Text
                suffix="BTC"
                label="提现数量"
                value={amount}
                errMsg={amountErrMsg}
                onChange={value => this.setState({ amount: value })}
                onBlur={checkAll.checkAmount}
              />
            }
            right={<FreeBalance value={freeShow} unit={token} />}
          />
          <Input.Text
            isTextArea
            rows={4}
            label="备注"
            placeholder={PlaceHolder.setTextAreaLength}
            value={remark}
            onChange={value => this.setState({ remark: value.slice(0, PlaceHolder.getTextAreaLength) })}
          />
        </div>
      </Modal>
    );
  }
}

export default WithdrawModal;
