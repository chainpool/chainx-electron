import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Modal, Toast } from '../../../components';
import * as styles from './SignChannelSelectModal.less';
import { classNames, _ } from '../../../utils';

class SignChannelSelectModal extends Component {
  state = {
    selectOne: 'Ledger',
    trezorConnectErrMsg: '',
  };
  componentWillMount() {
    window.trezorConnector && window.trezorConnector.removeAllListeners();
  }
  render() {
    const { selectOne, trezorConnectErrMsg } = this.state;
    const {
      model: { dispatch, openModal, closeModal, tx, txSpecial },
      globalStore: {
        modal: {
          data: { isSpecialModel, haveSigned },
        },
      },
    } = this.props;

    const txMatch = isSpecialModel ? txSpecial : tx;

    return (
      <Modal
        style={{ width: 360 }}
        title={<div>签名</div>}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={async () => {
              if (selectOne === 'Ledger') {
                openModal({
                  name: 'AfterSelectChannelModal',
                  data: {
                    desc: selectOne,
                    tx: txMatch,
                    isSpecialModel,
                    haveSigned,
                  },
                });
              } else if (selectOne === 'other') {
                openModal({
                  name: 'SignResultModal',
                  data: {
                    desc: selectOne,
                    signResult: '',
                    isSpecialModel,
                  },
                });
              } else if (selectOne === 'Trezor') {
                if (!isSpecialModel) {
                  const trezor = window.trezorConnector;
                  if (trezor.device) {
                    await trezor.device.steal();
                  }
                  trezor.on('pin', (messageType, passwordCheck) => {
                    openModal({
                      name: 'TrezorPasswordModal',
                      data: {
                        callback: password => passwordCheck(null, password),
                      },
                    });
                  });
                  trezor.on('button', () => {
                    openModal({
                      name: 'AfterSelectChannelModal',
                      data: {
                        desc: selectOne,
                        tx: txMatch,
                        isSpecialModel,
                        haveSigned,
                      },
                    });
                  });

                  if (trezor.isConnected()) {
                    const res = await dispatch({
                      type: 'signWithHardware',
                      payload: {
                        desc: selectOne,
                        isSpecialModel,
                        redeemScript: null,
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
                          desc: selectOne,
                          signResult: result,
                          isSpecialModel,
                        },
                      });
                    }
                  } else {
                    this.setState({
                      trezorConnectErrMsg: '设备连接失败，请拔掉设备后重新接入尝试',
                    });
                  }
                } else if (isSpecialModel) {
                  openModal({
                    name: 'AfterSelectChannelModal',
                    data: {
                      desc: selectOne,
                      tx: txMatch,
                      isSpecialModel,
                      haveSigned,
                    },
                  });
                }
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.SignChannelSelectModal}>
          <ul>
            {[
              { name: 'Ledger', icon: 'ledger' },
              { name: 'Trezor', icon: 'trezor' },
              // { name: '手机冷钱包', icon: 'phone', disabeld: true },
              { name: 'other', icon: 'icon-gengduocaozuo', desc: '其他' },
            ].map((item, index) => (
              <li
                className={classNames(
                  selectOne === item.name || selectOne === item.desc ? styles.active : null,
                  item.disabeld ? styles.disabeld : null
                )}
                key={index}
                onClick={() => {
                  this.setState({
                    selectOne: item.name,
                    trezorConnectErrMsg: '',
                  });
                }}>
                <Icon name={item.icon} />
                <span>{item.desc || item.name}</span>
              </li>
            ))}
          </ul>
          {selectOne === 'Trezor' && trezorConnectErrMsg && (
            <div className={styles.trezorConnectErrMsg}>{trezorConnectErrMsg}</div>
          )}
        </div>
      </Modal>
    );
  }
}

export default SignChannelSelectModal;
