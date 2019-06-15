import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Modal } from '../../../components';
import * as styles from './SignChannelSelectModal.less';

class SignChannelSelectModal extends Component {
  state = {
    selectOne: 'Ledger',
  };
  render() {
    const { selectOne } = this.state;
    const {
      model: { dispatch, openModal, closeModal },
    } = this.props;

    return (
      <Modal
        title={'签名'}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (selectOne === 'Ledger') {
                dispatch({
                  type: 'signWithHardware',
                });
                // openModal({
                //   name: 'SignResultModal',
                //   data: {
                //     desc: selectOne,
                //   },
                // });
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
              { name: '手机冷钱包', icon: 'phone' },
              { name: 'other', icon: 'icon-gengduocaozuo', desc: '其他' },
            ].map((item, index) => (
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

export default SignChannelSelectModal;
