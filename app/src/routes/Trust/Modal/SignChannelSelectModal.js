import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Modal } from '../../../components';
import * as styles from './SignChannelSelectModal.less';
import { classNames, _ } from '../../../utils';

class SignChannelSelectModal extends Component {
  state = {
    selectOne: 'Ledger',
  };
  render() {
    const { selectOne } = this.state;
    const {
      model: { dispatch, openModal, tx, txSpecial },
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
            onClick={() => {
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
              } else if (selectOne === 'Trezor' && !isSpecialModel) {
                const trezor = new window.TrezorConnector(
                  (messageType, passwordCheck) => {
                    openModal({
                      name: 'TrezorPasswordModal',
                      data: {
                        callback: async password => {
                          try {
                            await passwordCheck(null, password);
                          } catch (err) {
                            console.log('密码错误', err);
                          }
                        },
                      },
                    });
                  },
                  () => {
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
                );

                trezor.on('connect', async () => {
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
                    console.log(err, 'trezor签名错误');
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
                });
              } else if (selectOne === 'Trezor' && isSpecialModel) {
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
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.SignChannelSelectModal}>
          <ul>
            {[
              { name: 'Ledger', icon: 'ledger' },
              { name: 'Trezor', icon: 'trezor' },
              { name: '手机冷钱包', icon: 'phone', disabeld: true },
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
                  });
                }}>
                <Icon name={item.icon} />
                <span>{item.desc || item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    );
  }
}

export default SignChannelSelectModal;
