import React, { Component } from 'react';
import { Modal, Button, RouterGo } from '../../../components';
import * as styles from './index.less';

class DownloadWalletWarnModal extends Component {
  render() {
    return (
      <Modal
        title="下载ChainX桌面钱包"
        className={styles.DownloadWalletWarnModal}
        button={
          <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/chainx-wallet/releases/tag/v1.0.0' }}>
            <Button size="full" type="confirm" onClick={() => {}}>
              下载
            </Button>
          </RouterGo>
        }>
        ChainX桌面钱包已经发布，您可以前往{' '}
        <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/chainx-wallet/releases/tag/v1.0.0' }}>
          https://github.com/chainx-org/chainx-wallet/releases/tag/v1.0.0{' '}
        </RouterGo>
        下载使用。相比在线钱包，桌面钱包更加安全。目前的在线钱包在未来将会停止服务。
      </Modal>
    );
  }
}

export default DownloadWalletWarnModal;
