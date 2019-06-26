import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Modal } from '../../../components';
import * as styles from './ExportHardwarePubKey.less';
import { _, classNames } from '../../../utils';

class ExportHardwarePubKey extends Component {
  state = {
    selectOne: 'Ledger',
  };
  componentWillMount() {
    window.trezorConnector && window.trezorConnector.removeAllListeners();
  }
  render() {
    const { selectOne } = this.state;
    const {
      model: { openModal, isTestBitCoinNetWork },
    } = this.props;

    return (
      <Modal
        title={'选择钱包'}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={async () => {
              if (selectOne === 'Ledger') {
                openModal({
                  name: 'ViewHardwarePubKey',
                  data: {
                    desc: selectOne,
                    Path: isTestBitCoinNetWork() ? "m/45'/1'/0'/0/0" : "m/45'/0'/0'/0/0",
                    callback: () => {
                      return window.LedgerInterface.getPublicKey(isTestBitCoinNetWork() ? 'testnet' : 'mainnet');
                    },
                  },
                });
              } else if (selectOne === 'Trezor') {
                const trezor = window.trezorConnector;
                if (trezor.device) {
                  await trezor.device.steal();
                }
                trezor.on('pin', (messageType, passwordCheck) => {
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
                });
                if (trezor.isConnected()) {
                  const res = await trezor.getPublicKey(isTestBitCoinNetWork() ? 'testnet' : 'mainnet').catch(err => {
                    console.log(err, '导出pubKey确认错误');
                  });
                  if (res) {
                    openModal({
                      name: 'ViewHardwarePubKey',
                      data: {
                        desc: selectOne,
                        Path: isTestBitCoinNetWork() ? "m/45'/1'/0'/0/0" : "m/45'/0'/0'/0/0",
                        callback: () => {
                          return Promise.resolve(res);
                        },
                      },
                    });
                  }
                }
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.ExportHardwarePubKey}>
          <ul>
            {[{ name: 'Ledger', icon: 'ledger' }, { name: 'Trezor', icon: 'trezor' }].map((item, index) => (
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

export default ExportHardwarePubKey;
