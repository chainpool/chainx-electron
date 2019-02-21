import React from 'react';
import { Clipboard, Mixin, Modal } from '../../../components';
import { Warn } from '../../components';
import * as styles from './CrossChainBindModal.less';
import { classNames, Inject } from '../../../utils';
import { u8aToHex } from '@polkadot/util/u8a';

@Inject(({ assetStore }) => ({ assetStore }))
class CrossChainBindModal extends Mixin {
  startInit = () => {
    // const {
    //   assetStore: { dispatch },
    // } = this.props;
    //
    // dispatch({ type: 'getBTCTrusteeAddress' });
  };

  render() {
    const {
      accountStore: { currentAddress, openModal },
      assetStore: { btcTrusteeAddress },
      globalStore: {
        modal: {
          data: { token },
        },
      },
    } = this.props;

    const opReturnHex = u8aToHex(new TextEncoder('utf-8').encode('ChainX:' + currentAddress));
    const show = {
      BTC: {
        desc1: (
          <span>
            使用<strong>支持OP_Return</strong>
            的BTC钱包向公共多签托管地址发起金额为0的转账交易，并在OP_Return中输入下方信息：
          </span>
        ),
        value1: opReturnHex,
        desc2: '公共多签托管地址',
        value2: btcTrusteeAddress,
        warn: (
          <Warn>
            <div>
              <strong>其他钱包交易中的备注字段并不是OP_RETURN，无法发起跨链绑定交易。</strong>
              <br />
              目前支持的钱包有:{' '}
              <a className={styles.anchor} href="https://trezor.io/" rel="noopener noreferrer" target="_blank">
                Trezor
              </a>
              、
              <a
                className={styles.anchor}
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => {
                  openModal({ name: 'BtcBindModal' });
                }}>
                ChainX离线绑定工具
              </a>
              和
              <a className={styles.anchor} href="https://coinb.in/" rel="noopener noreferrer" target="_blank">
                Coinb.in
              </a>{' '}
              等。
            </div>
          </Warn>
        ),
      },
      SDOT: {
        desc1: (
          <span>
            使用<strong>支持Data</strong>的Ethereum钱包钱包向公共地址发起金额为0的转账交易，并在Data中输入下方信息：
          </span>
        ),
        value1: currentAddress,
        desc2: '公共地址',
        value2: '0x000000000000000000000000000000000000abcd',
        warn: (
          <Warn>
            <div>
              <strong>其他钱包交易中的备注字段并不是Data，无法发起跨链绑定交易。</strong>
              <br />
              目前支持的钱包有:{' '}
              <a className={styles.anchor} href="https://token.im/" rel="noopener noreferrer" target="_blank">
                imToken
              </a>
              、
              <a className={styles.anchor} href="https://www.parity.io/" rel="noopener noreferrer" target="_blank">
                Parity
              </a>{' '}
              等。
            </div>
          </Warn>
        ),
      },
    };

    const findOne = show[token];

    return (
      <Modal title={`跨链绑定（${token}）`}>
        <div className={styles.crossChainBind}>
          <div className={styles.desc}>
            <div />
            {findOne.desc1}
          </div>
          <div className={classNames(styles.grayblock, styles.addressall)}>
            <div>
              <div>
                <div className={styles.address}>
                  <div id="copy">{findOne.value1}</div>
                  <button>
                    <Clipboard
                      id="copy"
                      outInner={
                        <span className={styles.desc}>
                          复制信息
                          <div className={styles.coverclick} />
                        </span>
                      }
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.depositaddress}>
            <span className={styles.label}>{findOne.desc2}</span>
            <Clipboard>{findOne.value2}</Clipboard>
          </div>
          {findOne.warn}
        </div>
      </Modal>
    );
  }
}

export default CrossChainBindModal;
