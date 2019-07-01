import React, { Component } from 'react';
import { Modal, Button, FormattedMessage, Clipboard } from '../../../components';
import * as styles from './ViewHardwarePubKey.less';

class ViewHardwarePubKey extends Component {
  state = {
    pubKey: '',
    linkStatus: false,
  };
  async componentDidMount() {
    const {
      globalStore: {
        modal: {
          data: { callback },
        },
      },
    } = this.props;
    const res = await callback().catch(err => console.log(err));
    if (res)
      this.setState({
        pubKey: res,
        linkStatus: true,
      });
  }

  render() {
    const { pubKey, linkStatus } = this.state;
    const {
      globalStore: {
        modal: {
          data: { Path },
        },
        closeModal,
      },
    } = this.props;

    return (
      <Modal
        title={'查看公钥'}
        button={
          pubKey ? (
            ''
          ) : (
            <Button
              size="full"
              type="confirm"
              onClick={() => {
                closeModal();
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          )
        }>
        <div className={styles.ViewHardwarePubKey}>
          <ul>
            <li>
              <span>状态：</span>
              <span>{linkStatus ? '已连接' : '未连接'}</span>
            </li>
            <li>
              <span>PATH：</span>
              <span>{Path}</span>
            </li>
          </ul>
          <div className={styles.secret}>
            <span className={styles.label}>公钥</span>：
            <span className={styles.result}>
              <Clipboard>{pubKey}</Clipboard>
            </span>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ViewHardwarePubKey;