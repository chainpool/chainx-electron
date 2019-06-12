import React from 'react';
import { Modal, Input, Button, Mixin, FormattedMessage, Toast } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { formatNumber, Inject, Patterns, setBlankSpace } from '../../../utils';
import { PlaceHolder } from '../../../constants';
import * as styles from './WithdrawModal.less';

const withdrawWarnMessage =
  'ChainX建议大额提现使用已绑定地址提现,使用新地址提现会加长审查时间(可至"充提记录"页面取消这笔提现)';

@Inject(({ addressManageStore, assetStore }) => ({ addressManageStore, assetStore }))
class WithdrawModal extends Mixin {
  state = {
    address: '',
    addressErrMsg: '',
    amount: '',
    amountErrMsg: '',
    remark: '',
    fee: '',
    minValue: '',
  };

  startInit = () => {
    Toast.warn(withdrawWarnMessage);
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
          fee: res.fee,
          minValue: res.minimalWithdrawal,
        });
      }
    });
  };

  checkAll = {
    checkAddress: async () => {
      const { address } = this.state;
      const {
        model: { dispatch, isTestBitCoinNetWork },
        globalStore: { modal: { data: { token } = {} } = {} },
      } = this.props;
      const vertifyAddress = async () => {
        const res = await dispatch({
          type: 'verifyAddressValidity',
          payload: {
            token,
            address,
            remark: '',
          },
        });
        if (!!res) return <FormattedMessage id={'AddressFormatError'} />;
        return '';
      };

      let errMsg =
        Patterns.check('required')(address) || Patterns.check('isBTCAddress')(address, isTestBitCoinNetWork());
      if (!errMsg) {
        const isVertifyAddress = await vertifyAddress();
        errMsg = isVertifyAddress;
      }
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: () => {
      const {
        globalStore: { modal: { data: { freeShow, token } = {} } = {} },
      } = this.props;
      const { amount, minValue } = this.state;
      const errMsg =
        Patterns.check('required')(amount) ||
        Patterns.check('smallerOrEqual')(
          Number(this.props.model.setPrecision(minValue, token)),
          amount,
          <FormattedMessage id={'WithdrawAmountMustOverFee'} />
        ) ||
        Patterns.check('smallerOrEqual')(Number(amount), freeShow);
      this.setState({ amountErrMsg: errMsg });
      return errMsg;
    },
    checkSpecial: () => {
      const { amount, address } = this.state;
      const {
        assetStore: { btcAddresses = [] },
      } = this.props;
      if (Number(amount) > 5 && !btcAddresses.includes(address)) {
        Toast.warn(withdrawWarnMessage);
      }
    },
    confirm: async () => {
      const result1 = await this.checkAll['checkAddress']();
      const result2 = await this.checkAll['checkAmount']();
      const result = !result1 && !result2;
      if (result) {
        this.checkAll['checkSpecial']();
      }
      return result;
    },
  };

  render() {
    const { checkAll } = this;
    const { address, addressErrMsg, amount, amountErrMsg, remark, fee, minValue } = this.state;
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

    const feeShow = setPrecision(fee, token);
    const minValueShow = setPrecision(minValue, token);
    const factTransferValue = formatNumber.toFixed(Number(amount) - Number(feeShow), getPrecision(token));

    return (
      <Modal
        title={<FormattedMessage id={'CrossChainWithdraw'} />}
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
                      { name: 'operation', value: () => <FormattedMessage id={'Withdraw'} /> },
                      { name: () => <FormattedMessage id={'ReceiptAddress'} />, value: address, toastShow: false },
                      { name: () => <FormattedMessage id={'Amount'} />, value: setBlankSpace(amount, token) },
                      { name: () => <FormattedMessage id={'Memo'} />, value: remark.trim() },
                    ],
                    checkNativeAsset: (accountNativeAssetFreeBalance, fee, minValue) => {
                      if (minValue === 0) {
                        return accountNativeAssetFreeBalance - fee >= minValue;
                      } else {
                        return accountNativeAssetFreeBalance - fee > minValue;
                      }
                    },
                    callback: () => {
                      return dispatch({
                        type: 'withdraw',
                        payload: {
                          token, // 注意这里的token不要用callback的参数
                          amount,
                          dest: address,
                          remark: remark.trim(),
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
          <Input.Address
            prefix={chain}
            label={
              <>
                <FormattedMessage id={'ReceiptAddress'} />
                <span className={styles.warnaddress}>
                  (<FormattedMessage id={'NotSupport'} />)
                </span>
              </>
            }
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
                    <FormattedMessage id={'WithdrawAmount'} />
                    <span>
                      (<FormattedMessage id={'GetWithdrawFee'} /> {setBlankSpace(feeShow, token)},
                      <FormattedMessage id={'MinWithdrawValue'} /> {setBlankSpace(minValueShow, token)})
                    </span>
                  </div>
                }
                value={amount}
                errMsg={amountErrMsg}
                onChange={value => this.setState({ amount: value })}
                onBlur={checkAll.checkAmount}
                helpContent={
                  !amountErrMsg &&
                  amount && (
                    <span>
                      <FormattedMessage id={'ActualWithDrawAmount'} />:{setBlankSpace(factTransferValue, token)}
                    </span>
                  )
                }
              />
            }
            right={<FreeBalance value={freeShow} unit={token} />}
          />
          <FormattedMessage id={'CharacterLength'} values={{ length: 64 }}>
            {msg => (
              <Input.Text
                trim={false}
                isTextArea
                rows={1}
                label={<FormattedMessage id={'Memo'} />}
                placeholder={msg}
                value={remark}
                onChange={value => this.setState({ remark: value.slice(0, PlaceHolder.getTextAreaLength) })}
              />
            )}
          </FormattedMessage>
        </div>
      </Modal>
    );
  }
}

export default WithdrawModal;
