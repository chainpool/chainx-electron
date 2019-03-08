import React from 'react';
import { Clipboard, Mixin, Modal, Input, Button } from '../../../components';
import { Warn } from '../../components';
import * as styles from './CrossChainBindModal.less';
import { classNames, Inject } from '../../../utils';
import { u8aToHex } from '@polkadot/util/u8a';
import imtoken from '../../../resource/imtoken.png';
import parity from '../../../resource/parity.png';

@Inject(({ assetStore }) => ({ assetStore }))
class CrossChainBindModal extends Mixin {
  state = {
    txid: '',
    errMsg: '',
  };

  startInit = () => {
    const {
      assetStore: { dispatch },
    } = this.props;

    dispatch({ type: 'getTrusteeAddress', payload: { chain: 'Bitcoin' } });
  };

  checkTxId = value => {
    const regexp = /^(https:\/\/etherscan.io\/tx\/)?(0x)?([\da-f]{64})$/;
    const result = regexp.exec(value);
    const errMsg = !result || !result[3] ? '交易ID错误' : '';
    this.setState({ errMsg });
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

    const { txid } = this.state;

    const chainxAddressHex = u8aToHex(new TextEncoder('utf-8').encode(currentAddress));
    const show = {
      BTC: {
        desc1: (
          <span>
            使用<strong>支持OP_Return</strong>
            的BTC钱包向公共多签托管地址发起金额为0的转账交易，并在OP_Return中输入下方信息：
          </span>
        ),
        value1: chainxAddressHex,
        desc2: '公共多签托管地址',
        value2: btcTrusteeAddress,
        warn: (
          <Warn>
            <div>
              <strong>其他钱包交易中的备注字段并不是OP_RETURN，无法发起跨链绑定交易。</strong>
              <br />
              目前支持的钱包有:{' '}
              <a
                className={styles.anchor}
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => {
                  openModal({ name: 'BtcBindModal' });
                }}>
                ChainX绑定工具
              </a>
              、
              <a className={styles.anchor} href="javascript:;" rel="noopener noreferrer" target="_blank">
                Trezor
              </a>
              、
              <a className={styles.anchor} href="javascript:;" rel="noopener noreferrer" target="_blank">
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
            使用<strong>支持Data</strong>以太坊钱包向自己发起任意金额（建议为0）的转账交易，并在Data中输入下方信息：
          </span>
        ),
        value1: chainxAddressHex,
        desc2: '公共地址',
        value2: '0x008C343fcFB7b55430B8520B8d91D92609d2E482',
        warn: (
          <Warn>
            <div className={styles.sdot}>
              目前支持的钱包有:{' '}
              <a className={styles.anchor} href="https://token.im/" rel="noopener noreferrer" target="_blank">
                imToken
                <span className={styles.hoverimg} style={{ left: -100 }}>
                  <img src={imtoken} width={244} />
                </span>
              </a>
              、
              <a className={styles.anchor} href="https://www.parity.io/" rel="noopener noreferrer" target="_blank">
                Parity
                <span className={styles.hoverimg} style={{ left: -150 }}>
                  <img src={parity} width={352} />
                </span>
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
                    <Clipboard id="copy" outInner={<span className={styles.desc}>复制信息</span>} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {token === 'BTC' ? (
            <div className={styles.depositaddress}>
              <span className={styles.label}>{findOne.desc2}</span>
              <Clipboard>{findOne.value2}</Clipboard>
            </div>
          ) : (
            <div className={styles.ethTx}>
              <div className={styles.desc}>
                <div />
                交易打包成功后，在下面输入交易ID（txid），交易签名验证无误后，即可完成绑定
              </div>
              <Input.Text
                placeholder="输入交易ID"
                label=""
                value={txid}
                errMsg={this.state.errMsg}
                onChange={value => {
                  this.setState({ txid: value });
                }}
                onBlur={this.checkTxId}
              />
              <Button size="full" type="confirm">
                确定
              </Button>
            </div>
          )}
          {findOne.warn}
        </div>
      </Modal>
    );
  }
}

export default CrossChainBindModal;
