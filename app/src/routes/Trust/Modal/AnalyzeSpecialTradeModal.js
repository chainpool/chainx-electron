import React, { Component } from 'react';
import { Button, Input, FormattedMessage, Modal } from '../../../components';
import * as styles from './AnalyzeSpecialTradeModal.less';
import { Patterns } from '../../../utils';

class AnalyzeSpecialTradeModal extends Component {
  state = {
    tx:
      '0x0100000001520c5b718bfe24c3ac37557b656192f4428c8273104c07cc9c97eaa3a2ac17a90000000000ffffffff0250c300000000000017a914a9205e9cc33872244b037111238fffe2e2eb95508760e569000000000017a914787847d19f4736f3b7a411d80083a228fc0d77798700000000',
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
        title={'构造特殊交易'}
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
