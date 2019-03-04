import React, { Component } from 'react';
import { Button, Input, Modal } from '../../../../components';
import { InputHorizotalList } from '../../../components';
import { Inject, Patterns } from '../../../../utils';

@Inject(({ globalStore }) => ({ globalStore }))
class TrustSettingModal extends Component {
  state = {
    chain: '',
    chainErrMsg: '',
    hotKey: '',
    hotKeyErrMsg: '',
    coldKey: '',
    coldKeyErrMsg: '',
  };
  checkAll = {
    checkChain: () => {
      const { chain } = this.state;
      const errMsg = Patterns.check('required')(chain);
      this.setState({ chainErrMsg: errMsg });
      return errMsg;
    },
    checkHotKey: () => {
      const { hotKey } = this.state;
      const errMsg = Patterns.check('required')(hotKey);
      this.setState({ hotKeyErrMsg: errMsg });
      return errMsg;
    },
    checkColdKey: () => {
      const { coldKey } = this.state;
      const errMsg = Patterns.check('required')(coldKey);
      this.setState({ coldKeyErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkChain', 'checkHotKey', 'checkColdKey'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { chain, chainErrMsg, hotKey, hotKeyErrMsg, coldKey, coldKeyErrMsg } = this.state;
    const {
      model: { closeModal },
      globalStore: { assets = [] },
    } = this.props;

    const options = assets.map(asset => ({ label: asset.chain, value: asset.name }));

    return (
      <Modal
        title="设置信托"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                closeModal();
              }
            }}>
            确定
          </Button>
        }>
        <div>
          <InputHorizotalList
            left={
              <Input.Select
                label="选择链"
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
            label="热公钥/地址"
            value={hotKey}
            errMsg={hotKeyErrMsg}
            onChange={value => this.setState({ hotKey: value })}
            onBlur={checkAll.checkHotKey}
          />
          <Input.Text
            label="冷公钥/地址"
            value={coldKey}
            errMsg={coldKeyErrMsg}
            onChange={value => this.setState({ coldKey: value })}
            onBlur={checkAll.checkColdKey}
          />
        </div>
      </Modal>
    );
  }
}

export default TrustSettingModal;
