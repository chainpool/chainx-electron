import React from 'react';
import { Clipboard, Mixin, Modal } from '../../../components';
import { Warn } from '../../components';
import * as styles from './DepositModal.less';
import { Inject } from '@utils';

@Inject(({ assetStore }) => ({ assetStore }))
class DepositModal extends Mixin {
  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({ type: 'getAccountBTCAddresses' });
  };

  render() {
    const {
      model: { openModal },
      globalStore: { modal: { data: { trusteeAddr } = {} } = {} },
      assetStore: { btcAddresses = [] },
    } = this.props;

    return (
      <Modal title="跨链充值">
        <div className={styles.bindAddress}>
          <div>
            已绑定地址：
            <button
              onClick={() => {
                openModal({
                  name: 'CrossChainBindModal',
                });
              }}>
              绑定新地址
            </button>
          </div>
          <ul>
            {btcAddresses.map((address, index) => {
              return (
                <li key={index}>
                  <span>Bitcoin:</span>
                  <div>{address}</div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.publicAddress}>
          <div>
            <div className={styles.title}>公共多签托管地址</div>
            <div className={styles.address}>
              <span className={styles.token}>Bitcoin:</span>
              <Clipboard>{trusteeAddr}</Clipboard>
            </div>
            <Warn>请使用已绑定地址之一向公共多签托管地址转账，使用其他未绑定地址无法到账</Warn>
          </div>
          <div className={styles.back} />
        </div>
      </Modal>
    );
  }
}

export default DepositModal;
