import React, { Component } from 'react';
import { Button, Input, Modal, FormattedMessage } from '../../../components';
import { FreeBalance, InputHorizotalList } from '../../components';
import { Inject, Patterns, setBlankSpace, isElectron, isSimulatedAccount, showAssetName } from '../../../utils';
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
      const errMsg = Patterns.check('required')(address) || Patterns.check('isChainXAddress')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: () => {
      const { amount } = this.state;
      const {
        globalStore: { modal: { data: { freeShow } = {} } = {} },
      } = this.props;
      const errMsg =
        Patterns.check('required')(amount) ||
        //Patterns.check('smaller')(0, amount, '转账数量必须大于0') ||  // 可以为0
        Patterns.check('smallerOrEqual')(amount, freeShow);
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
      model: { dispatch, openModal, getPrecision },
      globalStore: { modal: { data: { token, freeShow } = {} } = {}, nativeAssetName, assets = [] },
      accountStore: { accountsList = [] },
      addressManageStore: { addresses, dispatch: dispatchAddressManage },
    } = this.props;

    const allAccounts = addresses
      .filter(address => address.token === nativeAssetName)
      .map(address => ({
        label: address.label,
        value: address.address,
      }))
      .concat(accountsList);

    return (
      <Modal
        title={
          <>
            <FormattedMessage id={'InnerChainTransfer'} />
            <span>({showAssetName(token)})</span>
          </>
        }
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                const filterOne = allAccounts.filter((item = {}) => item.value === address)[0];
                const target = assets.find(asset => asset.name === nativeAssetName);
                if (!filterOne) {
                  dispatchAddressManage({
                    type: 'addAddress',
                    payload: {
                      token: target.name,
                      chain: target.chain,
                      address: address,
                      label: `${address.slice(0, 5)}...${address.slice(-5)}`,
                    },
                  });
                }

                openModal({
                  name: 'SignModal',
                  data: {
                    token: token,
                    description: [
                      { name: 'operation', value: () => <FormattedMessage id={'Transfer'} /> },
                      {
                        name: () => <FormattedMessage id={'TransferAmount'} />,
                        value: `${setBlankSpace(amount, showAssetName(token))}`,
                      },
                      { name: () => <FormattedMessage id={'ReceiveAddress'} />, value: address, toastShow: false },
                      { name: () => <FormattedMessage id={'Memo'} />, value: remark.trim() },
                    ],

                    ...(token === nativeAssetName
                      ? {
                          checkNativeAsset: (accountNativeAssetFreeBalance, fee, minValue) => {
                            if (minValue === 0) {
                              return accountNativeAssetFreeBalance - fee - amount >= minValue;
                            } else {
                              return accountNativeAssetFreeBalance - fee - amount > minValue;
                            }
                          },
                        }
                      : {}),
                    callback: ({ token }) => {
                      return dispatch({
                        type: 'transfer',
                        payload: {
                          dest: address,
                          token,
                          amount,
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
            prefix="ChainX"
            label={<FormattedMessage id={'ReceiveAddress'} />}
            value={address}
            getOptionLabel={item =>
              !isElectron() && isSimulatedAccount(item.value) ? <FormattedMessage id={item.label} /> : item.label
            }
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
                suffix={showAssetName(token)}
                precision={getPrecision(token)}
                label={<FormattedMessage id={'TransferAmount'} />}
                value={amount}
                errMsg={amountErrMsg}
                onChange={value => {
                  this.setState({ amount: value });
                }}
                onBlur={checkAll.checkAmount}
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

export default TransferModal;
