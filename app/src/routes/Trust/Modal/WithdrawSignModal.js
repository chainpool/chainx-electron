import React, { Component } from 'react';
import * as styles from './WithdrawSignModal.less';
import { ButtonGroup, Button, Modal, Input, Icon, FormattedMessage } from '../../../components';
import wif from 'wif';
import { Patterns } from '../../../utils';

class WithdrawSignModal extends Component {
  state = {
    activeIndex: 0,
    password: '',
    passwordErrMsg: '',
  };

  checkAll = {
    checkPassword: () => {
      const { password } = this.state;
      const { currentTrustNode } = this.props;
      const decodedHotPrivateKey = currentTrustNode.decodedHotPrivateKey;
      const errMsg =
        Patterns.check('required')(decodedHotPrivateKey, <FormattedMessage id={'NotImportHotPrivateEntity'} />) ||
        Patterns.check('required')(password) ||
        Patterns.check('isHotPrivateKeyPassword')(decodedHotPrivateKey, password, decryptedKey => {
          this.decryptedKey = decryptedKey;
        });
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      const { activeIndex } = this.state;
      const result3 = !activeIndex ? this.checkAll['checkPassword']() : '';
      return !result3;
    },
  };

  render() {
    const { checkAll } = this;
    const { activeIndex, password, passwordErrMsg } = this.state;
    const {
      model: { openModal, dispatch, tx, redeemScript, isTestBitCoinNetWork },
      globalStore: { modal: { data: { desc, withdrawList, tx: tx_toBeSigned } = {} } = {} },
    } = this.props;

    const signButtons = desc
      ? [<FormattedMessage id={'Sign'} />]
      : [<FormattedMessage id={'Sign'} />, <FormattedMessage id={'VetoedSign'} />];

    return (
      <Modal
        title={<FormattedMessage id={'RespondMultiSigWithdrawal'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                let privateKey = '';
                if (!activeIndex) {
                  const decryptedKey = this.decryptedKey;
                  privateKey = wif.encode(
                    isTestBitCoinNetWork() ? 0xef : 0x80,
                    decryptedKey.privateKey,
                    decryptedKey.compressed
                  );
                }
                if (desc) {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [
                        { name: 'operation', value: () => <FormattedMessage id={'RespondMultiSigWithdrawal'} /> },
                        {
                          name: () => <FormattedMessage id={'WhetherSignature'} />,
                          value: () => <FormattedMessage id={!activeIndex ? 'TrueSign' : 'FalseSign'} />,
                        },
                      ],
                      callback: () => {
                        return dispatch({
                          type: 'createWithdrawTxAndSign',
                          payload: {
                            withdrawList,
                            tx: !activeIndex ? tx_toBeSigned : null,
                            redeemScript,
                            privateKey,
                          },
                        });
                      },
                    },
                  });
                } else {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [
                        { name: 'operation', value: () => <FormattedMessage id={'RespondMultiSigWithdrawal'} /> },
                        {
                          name: () => <FormattedMessage id={'WhetherSignature'} />,
                          value: () => <FormattedMessage id={!activeIndex ? 'TrueSign' : 'FalseSign'} />,
                        },
                      ],
                      callback: () => {
                        return dispatch({
                          type: 'signWithdrawTx',
                          payload: {
                            tx: !activeIndex ? tx : null,
                            redeemScript,
                            privateKey,
                          },
                        });
                      },
                    },
                  });
                }
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.withdrawSign}>
          <div className={styles.sign}>
            <div className={styles.desc}>
              <FormattedMessage id={'OriginalDataToSigned'} />：
            </div>
            <div className={styles.tx}>
              <div style={{ maxHeight: 300, overflowY: 'scroll' }}>
                {tx || tx_toBeSigned}
                <Icon name="icon-wancheng" className={styles.right} />
                <FormattedMessage id={'Right'} />
              </div>
            </div>
          </div>
          <ButtonGroup className={styles.buttonselect}>
            {signButtons.map((item, index) => (
              <Button
                type="confirm"
                key={index}
                className={activeIndex === index ? styles.active : null}
                onClick={() => {
                  this.setState({
                    activeIndex: index,
                  });
                }}>
                {item}
              </Button>
            ))}
          </ButtonGroup>
          {!activeIndex ? (
            <FormattedMessage id={'HotPrivateEntityPassword'}>
              {msg => (
                <Input.Text
                  isPassword
                  value={password}
                  errMsg={passwordErrMsg}
                  placeholder={msg}
                  onChange={value => {
                    this.setState({
                      password: value,
                    });
                  }}
                  onBlur={checkAll.checkPassword}
                />
              )}
            </FormattedMessage>
          ) : null}
        </div>
      </Modal>
    );
  }
}

export default WithdrawSignModal;
