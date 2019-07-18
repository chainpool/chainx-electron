import React, { Component } from 'react';
import { Modal, Button, RouterGo, LanguageContent } from '../../../components';
import * as styles from './index.less';

class DownloadWalletWarnModal extends Component {
  render() {
    const {
      accountStore: { closeModal },
    } = this.props;
    return (
      <Modal
        title={<LanguageContent zh={'请下载ChainX桌面钱包'} en={'请下载ChainX桌面钱包'} />}
        className={styles.DownloadWalletWarnModal}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              closeModal();
            }}>
            确定
          </Button>
        }>
        <LanguageContent
          zh={
            <div>
              ChainX在线钱包仅提供一个模拟账户供新用户体验,
              历史已导入账户只保留忘记账户、导出私钥和keystore功能。用户可以下载ChainX桌面钱包继续体验.
              相比在线钱包，桌面钱包更加安全。
            </div>
          }
          en={
            <div>
              ChainX在线钱包仅提供一个模拟账户供新用户体验,
              历史已导入账户只保留忘记账户、导出私钥和keystore功能。用户可以下载ChainX桌面钱包继续体验.
              相比在线钱包，桌面钱包更加安全。
            </div>
          }
        />
      </Modal>
    );
  }
}

export default DownloadWalletWarnModal;
