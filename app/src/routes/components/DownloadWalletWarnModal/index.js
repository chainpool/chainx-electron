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
        title={
          <LanguageContent
            zh={'ChainX 在线钱包将于两周后停止服务, 桌面钱包将会持续更新'}
            en={
              'The ChainX online wallet will be out of service two weeks later, but the desktop wallet will continue to update.'
            }
          />
        }
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
              ChainX 在线钱包{' '}
              <RouterGo isOutSide go={{ pathname: 'https://wallet.chainx.org' }}>
                https://wallet.chainx.org
              </RouterGo>{' '}
              将于两周后(2019年7月18日)正式停止相关功能服务，届时在线钱包页面将仅提供一个模拟体验账户供新用户对主要的钱包功能进行体验,
              历史已导入账户只能查看和导出，不再能发送交易。我们推荐用户使用ChainX桌面钱包,
              大家可点击右上角下载按钮下载最新版的桌面钱包. 相比在线钱包，桌面钱包更加安全，未来ChainX
              Core团队将只支持桌面钱包的开发更新，而移动端钱包将由社区进行开发，目前麦子钱包3.0已经正式支持ChainX，用户可以通过麦子钱包参与到ChainX的投票选举和资产挖矿。
            </div>
          }
          en={
            <div>
              The ChainX online wallet{' '}
              <RouterGo isOutSide go={{ pathname: 'https://wallet.chainx.org' }}>
                https://wallet.chainx.org
              </RouterGo>{' '}
              will officially stop its functional services two weeks later (July 18th, 2019),then the online wallet page
              will only provide a simulated account for new users to? experience main functions, as for pre-existing
              accounts set up before the official out-of-service date, assets can only be viewed or withdrawn and cannot
              be transferred through transactions. We recommend users to use the ChainX desktop wallet. You can download
              the latest version of the desktop wallet at the download button in upper right corner ,Compared to online
              wallets, the desktop wallet is more secure. In the future ChainX Core team will only focus on the
              development and update of the desktop wallet, with the mobile wallet developed by the community. At
              present,? MathWallet 3.0 officially supports ChainX, which allows users to participate in elections and
              asset mining of ChainX through the wallet. A wallet once selected and added to ChainX as a channel by a
              user can obtain up to 10% of the user’s inter-chain revenues, and this applies to all inter-chain assets
              on ChainX, including assets of BTC lock-up mining that will be launched in the near future. That’s why we
              hope more wallets support ChainX because as an important entrance channel for inter-chain assets, once
              connected to ChainX, not only can it enjoy preemptive advantages in the current ChainX ecosystem, but also
              is able to lay out the future inter-chain ecosystem.
            </div>
          }
        />
      </Modal>
    );
  }
}

export default DownloadWalletWarnModal;
