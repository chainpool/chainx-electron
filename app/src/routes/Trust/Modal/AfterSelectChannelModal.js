import React, { Component } from 'react';
import { Modal, Button, FormattedMessage, Input, Toast } from '../../../components';
import * as styles from './AfterSelectChannelModal.less';
import { _, Patterns } from '../../../utils';

class AfterSelectChannelModal extends Component {
  state = {
    loading: false,
    linkStatus: false,
    signErrMsg: '',
    signWarning: '',
    signResult: '',
    redeemScript: '',
    redeemScriptErrMsg: '',
  };

  componentWillMount() {
    window.trezorConnector && window.trezorConnector.removeAllListeners();
  }

  checkAll = {
    checkRedeemScript: () => {
      const {
        globalStore: { modal: { data: { isSpecialModel, haveSigned } = {} } = {} },
      } = this.props;
      const { redeemScript } = this.state;
      const errMsg = isSpecialModel && !haveSigned ? Patterns.check('required')(redeemScript) : '';
      this.setState({ redeemScriptErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkRedeemScript'].every(item => !this.checkAll[item]());
    },
  };

  signWithHardware = async () => {
    const {
      model: { dispatch },
      globalStore: {
        modal: {
          data: { desc, isSpecialModel, haveSigned },
        },
      },
    } = this.props;
    const { redeemScript } = this.state;
    this.setState({
      loading: true,
      signErrMsg: '',
      signWarning: `请查看${desc}硬件确认`,
    });
    const res = await dispatch({
      type: 'signWithHardware',
      payload: {
        desc,
        isSpecialModel,
        redeemScript: isSpecialModel && !haveSigned ? redeemScript : null,
      },
    }).catch(err => {
      this.setState({
        signErrMsg: err.message,
        loading: false,
        signWarning: '',
      });
    });

    if (res) {
      this.setState({
        signResult: res,
        linkStatus: true,
        loading: false,
        signWarning: '',
        signErrMsg: '',
      });
      return res;
    }
  };

  render() {
    const { signErrMsg, loading, signWarning, redeemScript, redeemScriptErrMsg } = this.state;
    const {
      globalStore: {
        modal: {
          data: { desc, tx, isSpecialModel, haveSigned },
        },
      },
      model: { dispatch, openModal, closeModal },
    } = this.props;

    return (
      <Modal
        title={`签名（${desc}）`}
        button={
          <>
            {signErrMsg && <div className={styles.errmsg}>{signErrMsg}</div>}
            {signWarning && <div className={styles.warning}>{signWarning}</div>}
            {desc === 'Trezor' && !isSpecialModel ? (
              <div className={styles.warning}>{`请查看${desc}硬件确认`}</div>
            ) : (
              <Button
                loading={loading}
                size="full"
                type="confirm"
                onClick={async () => {
                  if (this.checkAll.confirm()) {
                    if (desc === 'Ledger') {
                      this.signWithHardware().then(res => {
                        if (res) {
                          openModal({
                            name: 'SignResultModal',
                            data: {
                              desc,
                              signResult: res,
                              isSpecialModel,
                            },
                          });
                        }
                      });
                    } else if (desc === 'Trezor') {
                      if (!isSpecialModel) {
                        console.log('trezor普通签名');
                      } else if (isSpecialModel) {
                        const trezor = window.trezorConnector;
                        if (trezor.device) {
                          await trezor.device.steal();
                        }
                        trezor.on('pin', (messageType, passwordCheck) => {
                          openModal({
                            name: 'TrezorPasswordModal',
                            data: {
                              callback: async password => passwordCheck(null, password),
                            },
                          });
                        });
                        trezor.on('button', () => {});

                        if (trezor.isConnected()) {
                          const res = await dispatch({
                            type: 'signWithHardware',
                            payload: {
                              desc,
                              isSpecialModel,
                              redeemScript: isSpecialModel && !haveSigned ? redeemScript : null,
                              signCallback: (...payload) => {
                                return trezor.sign(...payload);
                              },
                            },
                          }).catch(err => {
                            Toast.warn('签名错误', _.get(err, 'message'));
                            closeModal();
                          });
                          const result = res || _.get(res, 'message.serialized.serialized_tx');
                          if (result) {
                            openModal({
                              name: 'SignResultModal',
                              data: {
                                desc,
                                signResult: result,
                                isSpecialModel,
                              },
                            });
                          }
                        }
                      }
                    }
                  }
                }}>
                <FormattedMessage id={'Confirm'} />
              </Button>
            )}
          </>
        }>
        <div className={styles.AfterSelectChannelModal}>
          {isSpecialModel && !haveSigned && (
            <div className={styles.redeemScript}>
              <Input.Text
                errMsg={redeemScriptErrMsg}
                isTextArea
                rows={5}
                label="赎回脚本"
                value={redeemScript}
                onChange={value => {
                  this.setState({
                    redeemScript: value,
                  });
                }}
                onBlur={this.checkAll.checkRedeemScript}
              />
            </div>
          )}

          <div className={styles.secret}>
            <div className={styles.label}>待签原文：</div>
            <div className={styles.result}>{tx}</div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default AfterSelectChannelModal;
