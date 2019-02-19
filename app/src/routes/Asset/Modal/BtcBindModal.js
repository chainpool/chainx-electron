import React from 'react';
import { Mixin, Modal } from '@components';
import * as styles from './BtcBindModal.less';
import { Inject } from '@utils';

@Inject(({ assetStore }) => ({ assetStore }))
class CrossChainAssetTable extends Mixin {
  render() {
    const {
      assetStore: { btcTrusteeAddress },
      accountStore: { currentAddress },
    } = this.props;
    console.log(this.props);
    const registerUrl = process.env.CHAINX_BITCOIN_REGISTER_URL || 'http://wallet.chainx.org/bitcoin-register';

    return (
      <Modal title="ChainX离线绑定工具">
        <div className={styles.register}>
          <iframe
            title="绑定BTC账户"
            src={`${registerUrl}?btc=${btcTrusteeAddress}&chainx=${currentAddress}`}
            frameBorder="0"
          />
        </div>
      </Modal>
    );
  }
}

export default CrossChainAssetTable;
