import React, { Component } from 'react';
import { Button, Input, Modal } from '../../../components';
import { InputHorizotalList } from '../../components';
import { Patterns } from '../../../utils';

class TrustSettingModal extends Component {
  state = {
    chain: '',
    chainErrMsg: '',
    hotPubKey: '',
    hotPubKeyErrMsg: '',
    coldPubKey: '',
    coldPubKeyErrMsg: '',
    options: [{ label: 'Bitcoin', value: 'Bitcoin' }],
  };

  componentDidMount() {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({
      type: 'getSomeOneInfo',
    }).then(res => {
      if (res) {
        const { chain, hotPubKey, coldPubKey } = res;
        this.setState({
          chain: { label: chain, value: chain },
          options: [{ label: chain, value: chain }],
          hotPubKey,
          coldPubKey,
        });
      }
    });
  }

  checkAll = {
    checkChain: () => {
      const { chain } = this.state;
      const errMsg = Patterns.check('required')(chain);
      this.setState({ chainErrMsg: errMsg });
      return errMsg;
    },
    checkHotKey: () => {
      const { hotPubKey } = this.state;
      const errMsg = Patterns.check('required')(hotPubKey) || Patterns.check('isPublicKey')(hotPubKey);
      this.setState({ hotPubKeyErrMsg: errMsg });
      return errMsg;
    },
    checkColdKey: () => {
      const { coldPubKey } = this.state;
      const errMsg = Patterns.check('required')(coldPubKey) || Patterns.check('isPublicKey')(coldPubKey);
      this.setState({ coldPubKeyErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkChain', 'checkHotKey', 'checkColdKey'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { options = [], chain, chainErrMsg, hotPubKey, hotPubKeyErrMsg, coldPubKey, coldPubKeyErrMsg } = this.state;
    const {
      model: { dispatch, openModal },
    } = this.props;

    return (
      <Modal
        title="设置信托"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [{ name: '操作', value: '设置信托' }],
                    callback: () => {
                      return dispatch({
                        type: 'updateTrustToChain',
                        payload: {
                          chain: chain.label,
                          hotPubKey,
                          coldPubKey,
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
            label="热公钥"
            value={hotPubKey}
            errMsg={hotPubKeyErrMsg}
            onChange={value => this.setState({ hotPubKey: value })}
            onBlur={checkAll.checkHotKey}
          />
          <Input.Text
            label="冷公钥"
            value={coldPubKey}
            errMsg={coldPubKeyErrMsg}
            onChange={value => this.setState({ coldPubKey: value })}
            onBlur={checkAll.checkColdKey}
          />
        </div>
      </Modal>
    );
  }
}

export default TrustSettingModal;
