import React, { Component } from 'react';
import { Modal, Button, RouterGo } from '../../../components';
import * as styles from './index.less';

class DownloadWalletWarnModal extends Component {
  render() {
    const {
      accountStore: { closeModal },
    } = this.props;
    return (
      <Modal
        title="ChainX 在线钱包将于两周后停止服务, 桌面钱包将会持续更新"
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
        ChainX 在线钱包 https://wallet.chainx.org
        将于两周后(2019年7月17日)正式停止相关功能服务，届时在线钱包页面将仅提供一个模拟体验账户供新用户对主要的钱包功能进行体验,
        历史已导入账户只能查看和导出，不再能发送交易。我们推荐用户使用ChainX桌面钱包, 大家可在
        https://github.com/chainx-org/chainx-wallet/releases 下载最新版的桌面钱包.
        相比在线钱包，桌面钱包更加安全，未来ChainX
        Core团队将只支持桌面钱包的开发更新，而移动端钱包将由社区进行开发，目前麦子钱包3.0已经正式支持ChainX，用户可以通过麦子钱包参与到ChainX的投票选举和资产挖矿。
      </Modal>
    );
  }
}

export default DownloadWalletWarnModal;
