import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Modal } from '../../../components';
import * as styles from './ExportHardwarePubKey.less';
import { classNames } from '../../../utils';

class ExportHardwarePubKey extends Component {
  state = {
    selectOne: 'Ledger',
  };
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
            onClick={() => {
              if (selectOne === 'Ledger') {
                openModal({
                  name: 'ViewHardwarePubKey',
                  data: {
                    desc: selectOne,
                    Path: isTestBitCoinNetWork() ? "m/45'/1'/0'/0/0" : "m/45'/0'/0'/0/0",
                    callback: () => {
                      if (selectOne === 'Ledger') {
                        return window.LedgerInterface.getPublicKey(isTestBitCoinNetWork() ? 'testnet' : 'mainnet');
                      } else {
                        return Promise.reject('qita');
                      }
                    },
                  },
                });
              } else if (selectOne === 'Trezor') {
                openModal({
                  name: 'TrezorPasswordModal',
                });
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
