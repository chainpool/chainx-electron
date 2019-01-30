import React, { Component } from 'react';
import { Button, Input, Modal } from '../../../components';
import { FreeBalance, InputHorizotalList } from '../../components';
import { Inject, Patterns, RegEx } from '../../../utils';
import { PlaceHolder } from '../../../constants';

@Inject(({ accountStore, addressManageStore }) => ({ accountStore, addressManageStore }))
class TransferModal extends Component {
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
      const errMsg = Patterns.check('required')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: () => {
      const { amount } = this.state;
      const {
        globalStore: { modal: { data: { free } = {} } = {} },
      } = this.props;
      const errMsg = Patterns.check('required')(amount) || Patterns.check('smaller')(amount, free);
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
      model: { dispatch, openModal },
      globalStore: { modal: { data: { token, freeShow } = {} } = {}, nativeAssetName },
      accountStore: { accountsList = [] },
      addressManageStore: { addresses },
    } = this.props;

    let allAccounts = [];
    if (token === nativeAssetName) {
      allAccounts = allAccounts.concat(accountsList);
    }

    allAccounts = allAccounts.concat(
      addresses
        .filter(address => address.chain === token)
        .map(address => ({
          label: address.label,
          value: address.address,
        }))
    );

    return (
      <Modal
        title="链内转账"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                openModal({
                  name: 'SignModal',
                  data: {
                    token: token,
                    description: [
                      { name: '操作', value: '转账' },
                      { name: '转账数量', value: `${amount}${token}` },
                      { name: '接收人地址', value: address },
                    ],
                    callback: ({ signer, acceleration, token }) => {
                      dispatch({
                        type: 'transfer',
                        payload: {
                          signer,
                          dest: address,
                          acceleration,
                          token,
                          amount,
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
            prefix="ChainX"
            label="接收人地址"
            value={address}
            errMsg={addressErrMsg}
            options={allAccounts}
            onChange={value => {
              this.setState({ address: value });
            }}
            onBlur={checkAll.checkAddress}
          />
          <InputHorizotalList
            left={
              <Input.Text
                suffix={token}
                label="转账数量"
                value={amount}
                errMsg={amountErrMsg}
                onChange={value => {
                  if (RegEx.decimalNumber.test(value) || value === '') {
                    this.setState({ amount: value });
                  }
                }}
                onBlur={checkAll.checkAmount}
              />
            }
            right={<FreeBalance value={freeShow} unit={token} />}
          />
          <Input.Text
            isTextArea
            rows={1}
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

export default TransferModal;
