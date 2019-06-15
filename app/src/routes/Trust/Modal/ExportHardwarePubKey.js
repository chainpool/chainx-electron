import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Modal } from '../../../components';
import * as styles from './ExportHardwarePubKey.less';

class ExportHardwarePubKey extends Component {
  state = {
    selectOne: 'Ledger',
  };
  render() {
    const { selectOne } = this.state;
    const {
      model: { openModal },
    } = this.props;

    return (
      <Modal
        title={'选择钱包'}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              openModal({
                name: 'ViewHardwarePubKey',
                data: {
                  desc: selectOne,
                },
              });
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.ExportHardwarePubKey}>
          <ul>
            {[{ name: 'Ledger', icon: 'ledger' }, { name: 'Trezor', icon: 'trezor' }].map((item, index) => (
              <li
                className={selectOne === item.name || selectOne === item.desc ? styles.active : null}
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
