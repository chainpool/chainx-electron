import React, { Component } from 'react';
import { Clipboard, Modal } from '../../../components';
import { Warn } from '../../components';
import * as styles from './CrossChainBindModal.less';
import { classNames, Inject } from '../../../utils';
import { u8aToHex } from '@polkadot/util/u8a';

@Inject(({ accountStore }) => ({ accountStore }))
class CrossChainBindModal extends Component {
  render() {
    const {
      accountStore: { currentAddress, openModal, closeModal },
    } = this.props;

    console.log(openModal);
    console.log(closeModal);
    const opReturnHex = u8aToHex(new TextEncoder('utf-8').encode('ChainX:' + currentAddress));

    const btcModal = (
      <Modal title="跨链绑定">
        <div className={styles.crossChainBind}>
          <div className={styles.desc}>
            <div />
            使用您的BTC钱包向多签地址发起金额为0的转账交易，并在OP_RETURN中写明您的ChainX地址。目前支持的钱包有：
            <a className={styles.anchor} href="https://www.ledger.com/" rel="noopener noreferrer" target="_blank">
              Ledger
            </a>
            <a className={styles.anchor} href="https://trezor.io/" rel="noopener noreferrer" target="_blank">
              Trezor
            </a>
            <a
              onClick={() => {
                // closeModal();
                // setTimeout(() => {
                //   openModal({
                //     name: 'register',
                //     data: {
                //       encodePassword,
                //     },
                //   });
                // });
              }}
              className={styles.anchor}>
              ChainX 跨链注册工具
            </a>
          </div>
          <div className={classNames(styles.grayblock, styles.addressall)}>
            <div>
              <div>
                <div className={styles.address}>
                  <span className={styles.label}>多签托管地址:</span>
                  <Clipboard>3E3ZjvzDuMebxjZyYNyzkM9zZrDNeEVA29u6bA29u6bu6bA29u6bu6bA29u6b</Clipboard>
                </div>
                <div className={styles.address}>
                  <span className={styles.label}>OP_RETURN:</span>
                  <Clipboard>{opReturnHex}</Clipboard>
                </div>
              </div>
            </div>
            <div className={styles.right} />
          </div>
          <Warn>其余钱包交易中的备注字段并不是OP_RETURN，无法发起跨链绑定交易。</Warn>
        </div>
      </Modal>
    );

    return btcModal;
  }
}

export default CrossChainBindModal;
