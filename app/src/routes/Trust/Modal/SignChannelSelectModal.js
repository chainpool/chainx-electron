import React, { Component } from 'react';
import { Button, FormattedMessage, Icon, Modal } from '../../../components';
import * as styles from './SignChannelSelectModal.less';
import { classNames } from '../../../utils';

class SignChannelSelectModal extends Component {
  state = {
    selectOne: 'Ledger',
  };
  render() {
    const { selectOne } = this.state;
    const {
      model: { openModal, tx },
    } = this.props;

    return (
      <Modal
        title={
          <div>
            签名
            {/*<span className={styles.supportdesc}>(暂时只支持ledger)</span>*/}
          </div>
        }
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
                    tx,
                  },
                });
              } else if (selectOne === 'other') {
                openModal({
                  name: 'SignResultModal',
                  data: {
                    desc: selectOne,
                    signResult: '',
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
              { name: 'Trezor', icon: 'trezor', disabeld: true },
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
