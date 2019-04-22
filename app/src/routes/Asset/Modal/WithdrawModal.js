import React from 'react';
import { Modal, Input, Button, Mixin } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { Inject, Patterns, setBlankSpace } from '../../../utils';
import { PlaceHolder } from '../../../constants';
import * as styles from './WithdrawModal.less';

@Inject(({ addressManageStore }) => ({ addressManageStore }))
class WithdrawModal extends Mixin {
  state = {
    address: '',
    addressErrMsg: '',
    amount: '',
    amountErrMsg: '',
    remark: '',
    fee: '',
  };

  startInit = () => {
    const {
      model: { dispatch },
      globalStore: { modal: { data: { token } = {} } = {} },
    } = this.props;
    dispatch({
      type: 'getMinimalWithdrawalValueByToken',
      payload: {
        token,
      },
    }).then(res => {
      if (res) {
        this.changeState({
          fee: res,
        });
      }
    });
  };

  checkAll = {
    checkAddress: async () => {
      const { address } = this.state;
      const {
        model: { dispatch },
        globalStore: { modal: { data: { token } = {} } = {} },
      } = this.props;
      const vertifyAddress = async () => {
        const res = await dispatch({
          type: 'verifyAddressValidity',
          payload: {
            token,
            address,
            remark: '备注',
          },
        });
        if (!!res) return '地址格式错误';
        return '';
      };
      // TODO: 根据token检查地址格式
      const isVertifyAddress = await vertifyAddress();
      const errMsg = Patterns.check('required')(address) || isVertifyAddress;
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: () => {
      const {
        globalStore: { modal: { data: { freeShow, token } = {} } = {} },
      } = this.props;
      const { amount, fee } = this.state;
      const errMsg =
        Patterns.check('required')(amount) ||
        Patterns.check('smaller')(0, amount, '提现数量必须大于0') ||
        Patterns.check('smallerOrEqual')(Number(this.props.model.setPrecision(fee, token)) + Number(amount), freeShow);
      this.setState({ amountErrMsg: errMsg });
      return errMsg;
    },

    confirm: async () => {
      const result1 = await this.checkAll['checkAddress']();
      const result2 = await this.checkAll['checkAmount']();
      return !result1 && !result2;
    },
  };

  render() {
    const { checkAll } = this;
    const { address, addressErrMsg, amount, amountErrMsg, remark, fee } = this.state;
    const {
      model: { openModal, dispatch, getPrecision, setPrecision },
      globalStore: { modal: { data: { token, freeShow, chain } = {} } = {} },
      addressManageStore: { addresses },
    } = this.props;

    const options = addresses
      .filter(address => address.token === token)
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
            onClick={async () => {
              if (await checkAll.confirm()) {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [
                      { name: '操作', value: '提现' },
                      { name: '收款地址', value: address, toastShow: false },
                      { name: '数量', value: setBlankSpace(amount, token) },
                      { name: '备注', value: remark },
                    ],
                    callback: () => {
                      return dispatch({
                        type: 'withdraw',
                        payload: {
                          token, // 注意这里的token不要用callback的参数
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
                precision={getPrecision('BTC')}
                label={
                  <div className={styles.bitcoinfee}>
                    提现数量<span>(收取提现手续费{setPrecision(fee, token)} BTC)</span>
                  </div>
                }
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

export default WithdrawModal;
