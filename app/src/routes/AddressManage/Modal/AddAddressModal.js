import React, { Component } from 'react';
import { Button, FormattedMessage, Input, Modal } from '../../../components';
import { InputHorizotalList } from '../../components';
import { Inject, Patterns } from '../../../utils';

@Inject(({ globalStore }) => ({ globalStore }))
class AddAddressModal extends Component {
  state = {
    chain: '',
    chainErrMsg: '',
    address: '',
    addressErrMsg: '',
    label: '',
    labelErrMsg: '',
  };
  checkAll = {
    checkChain: () => {
      const { chain } = this.state;
      const errMsg = Patterns.check('required')(chain);
      this.setState({ chainErrMsg: errMsg });
      return errMsg;
    },
    checkAddress: () => {
      const { address, chain } = this.state;
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      let errMsg = Patterns.check('required')(address);
      if (!errMsg) {
        if (chain.label === 'Bitcoin') {
          errMsg = Patterns.check('isBTCAddress')(address, isTestBitCoinNetWork());
        } else if (chain.label === 'ChainX') {
          errMsg = Patterns.check('isChainXAddress')(address);
        } else if (chain.label === 'Ethereum') {
          errMsg = Patterns.check('isEthereumAddress')(address, isTestBitCoinNetWork());
        }
      }
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkLabel: () => {
      const { label } = this.state;
      const errMsg = Patterns.check('required')(label.trim());
      this.setState({ labelErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkChain', 'checkAddress', 'checkLabel'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { chain, chainErrMsg, address, addressErrMsg, label, labelErrMsg } = this.state;
    const {
      model: { closeModal, dispatch },
      globalStore: { assets = [] },
    } = this.props;

    const options = assets.map(asset => ({ label: asset.chain, value: asset.name }));

    return (
      <Modal
        title={<FormattedMessage id={'AddAddress'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                const target = assets.find(asset => asset.name === chain.value);
                dispatch({
                  type: 'addAddress',
                  payload: {
                    label: this.state.label.trim(),
                    token: target.name,
                    chain: target.chain,
                    address: this.state.address,
                  },
                });
                closeModal();
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div>
          <InputHorizotalList
            left={
              <Input.Select
                label={<FormattedMessage id={'ChooseChain'} />}
                value={chain}
                errMsg={chainErrMsg}
                options={options}
                onChange={value => {
                  this.setState({ chain: value });
                }}
                onBlur={checkAll.checkChain}
              />
            }
            right=""
          />
          <Input.Text
            label={<FormattedMessage id={'AddAddress'} />}
            value={address}
            errMsg={addressErrMsg}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}
          />
          <FormattedMessage id={'CharacterLength'} values={{ length: 12 }}>
            {msg => (
              <Input.Text
                trim={false}
                label={<FormattedMessage id={'Label'} />}
                placeholder={msg}
                value={label}
                errMsg={labelErrMsg}
                onChange={value => this.setState({ label: value.slice(0, 12) })}
                onBlur={checkAll.checkLabel}
              />
            )}
          </FormattedMessage>
        </div>
      </Modal>
    );
  }
}

export default AddAddressModal;
