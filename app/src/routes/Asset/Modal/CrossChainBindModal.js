import React, { Component } from 'react';
import { Clipboard, Modal } from '../../../components';
import { Warn } from '../../components';
import * as styles from './CrossChainBindModal.less';
import { classNames, observer } from '../../../utils';
import { u8aToHex } from '@polkadot/util/u8a';

@observer
class CrossChainBindModal extends Component {
  render() {
    const {
      accountStore: { currentAddress },
      globalStore: {
        modal: {
          data: { token },
        },
      },
    } = this.props;

    const opReturnHex = u8aToHex(new TextEncoder('utf-8').encode('ChainX:' + currentAddress));

    const btcModal = (
      <Modal title={`跨链绑定（${token}）`}>
        <div className={styles.crossChainBind}>
          <div className={styles.desc}>
            <div />
            使用支持OP_Return的BTC钱包向公共多签托管地址发起金额为0的转账交易，并在OP_Return中输入下方信息：
          </div>
          <div className={classNames(styles.grayblock, styles.addressall)}>
            <div>
              <div>
                <div className={styles.address}>
                  <div id="copy">{opReturnHex}</div>
                  <button>
                    <Clipboard id="copy" />
                    <span className={styles.desc}>复制信息</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.depositaddress}>
            <span className={styles.label}>多签托管地址:</span>
            <Clipboard>3E3ZjvzDuMebxjZyYNyzkM9zZrDNeEVA29u6bA29u6bu6bA29u6bu6bA29u6b</Clipboard>
          </div>
          <Warn>
            <div>
              <strong>其他钱包交易中的备注字段并不是OP_RETURN，无法发起跨链绑定交易。</strong>
              <br />
              目前支持的钱包有:{' '}
              <a className={styles.anchor} rel="noopener noreferrer" target="_blank">
                Trezor
              </a>
              <a className={styles.anchor} rel="noopener noreferrer" target="_blank">
                ChainX离线绑定工具
              </a>
              <a className={styles.anchor} rel="noopener noreferrer" target="_blank">
                Coinb.in
              </a>{' '}
              等。
            </div>
          </Warn>
        </div>
      </Modal>
    );

    const ethModal = (
      <Modal title={`跨链绑定（${token}）`}>
        <div className={styles.crossChainBind}>
          <div className={styles.desc}>
            <div />
            使用您的Ethereum钱包向公共地址发起金额为0的转账交易，并在高级选项的Data中写明您的ChainX地址。
          </div>
          <div className={classNames(styles.grayblock, styles.addressall)}>
            <div>
              <div>
                <div className={styles.address}>
                  <span className={styles.label}>公共地址:</span>
                  <Clipboard>0x00C5f23c64C9FFb9301834e6A2eC7f16c1624b3f</Clipboard>
                </div>
                <div className={styles.address}>
                  <span className={styles.label}>Data:</span>
                  <Clipboard>{currentAddress}</Clipboard>
                </div>
              </div>
            </div>
            <div className={styles.right} />
          </div>
        </div>
      </Modal>
    );

    switch (token) {
      case 'BTC':
        return btcModal;
      case 'XDOT':
      case 'DOT':
        return ethModal;
      default:
        throw Error('unknow token');
    }
  }
}

export default CrossChainBindModal;
