import React, { Component } from 'react';
import { Button, Input, FormattedMessage, Modal } from '../../../components';
import * as styles from './AnalyzeSpecialTradeModal.less';
import { Patterns } from '../../../utils';

class AnalyzeSpecialTradeModal extends Component {
  state = {
    tx:
      '010000000195b4544cdc27d80d1c1d70e48fb6ea682f56205600741ef88a3d1a8480f12eee01000000fd1b01004830450221008f3fb738ba5cb86814fd5b4a02d18dfff663a17fd144c14a56ef4b06188b26c302201c90c787bc429d97e361e5f47cac1907c896f35c016a5354f37e5be01153a45a014ccf5421034575d9ef1baf0d85fb2700cea894eb07cd1f5f54a35d0b5dfe9ea1432f2a67d7210227e11054e41c9bcc2d2e9953281de93711727fb75a5e1e9bdfe3a80685e1f4e02102b88736301733df21ea4513bc4ab48b543e4d57d3874845711e77dd77f110389d210284c57fddf6fd20f1a255909fdffc9e5f0eb76be4191d31433b5f1bc990d989812103f11ee283a4e9a8f5e2e68c8b24652a5603a4f50ac9e26a614d9396f7482ff6d22102ef635b7ddea5a26c76aecf4194bfef0e2b22a217d7a0e8eaadce0506d1ed7b2756aeffffffff02803801000000000017a914b8c11dd685779e4762f265bfff4e5fdb3f7e35d887141e21070000000017a914782673c282136cb4896fd47282ab73e2e6038a928700000000',
    txErrMsg: '',
  };

  checkAll = {
    checkTx: () => {
      const { tx } = this.state;
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      const errMsg = Patterns.check('required')(tx) || Patterns.check('isTransactionTx')(tx, isTestBitCoinNetWork());
      this.setState({ txErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkTx'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { tx, txErrMsg } = this.state;
    const {
      model: { dispatch, closeModal },
    } = this.props;

    return (
      <Modal
        title={'解析特殊交易'}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (this.checkAll.confirm()) {
                dispatch({
                  type: 'getInputsAndOutputsFromTx',
                  payload: {
                    tx,
                    isSpecialModel: true,
                  },
                });
                closeModal();
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.AnalyzeSpecialTradeModal}>
          <Input.Text
            errMsg={txErrMsg}
            label="待签原文"
            isTextArea
            rows={10}
            value={tx}
            onChange={value =>
              this.setState({
                tx: value,
              })
            }
            onBlur={this.checkAll.checkTx}
          />
        </div>
      </Modal>
    );
  }
}

export default AnalyzeSpecialTradeModal;
