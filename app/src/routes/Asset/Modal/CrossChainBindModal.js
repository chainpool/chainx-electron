import React from 'react';
import { Clipboard, Mixin, Modal, Input, ButtonGroup, Button } from '../../../components';
import { Warn } from '../../components';
import * as styles from './CrossChainBindModal.less';
import { classNames, Inject } from '../../../utils';
import { u8aToHex } from '@polkadot/util/u8a';
import imtoken from '../../../resource/imtoken.png';
import parity from '../../../resource/parity.png';

@Inject(({ assetStore }) => ({ assetStore }))
class CrossChainBindModal extends Mixin {
  state = {
    step: 0,
    recommendChannel: '',
  };
  startInit = () => {
    const {
      assetStore: { dispatch },
    } = this.props;

    dispatch({ type: 'getTrusteeAddress', payload: { chain: 'Bitcoin' } });
  };

  render() {
    const { step, recommendChannel } = this.state;
    const {
      accountStore: { currentAddress, openModal },
      assetStore: { btcTrusteeAddress },
      globalStore: {
        modal: {
          data: { token },
        },
      },
    } = this.props;

    const channel = recommendChannel ? `@${recommendChannel}` : '';
    const chainxAddressHex = u8aToHex(new TextEncoder('utf-8').encode(`${currentAddress}${channel}`));
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
            使用<strong>支持Data</strong>的Ethereum钱包向公共地址发起金额为0的转账交易，并在Data中输入下方信息：
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
          {step === 0 ? (
            <div>
              <Input.Text
                value={recommendChannel}
                placeholder={'输入推荐渠道的节点名称 (选填)'}
                onChange={value => {
                  this.setState({
                    recommendChannel: value,
                  });
                }}
              />
              <ButtonGroup className={styles.recommendChannel}>
                <Button
                  onClick={() => {
                    this.setState({
                      step: 1,
                      recommendChannel: '',
                    });
                  }}>
                  跳过
                </Button>
                <Button
                  type="confirm"
                  onClick={() => {
                    if (recommendChannel) {
                      this.setState({
                        step: 1,
                      });
                    }
                  }}>
                  确定
                </Button>
              </ButtonGroup>
            </div>
          ) : (
            <>
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
              <div className={styles.depositaddress}>
                <span className={styles.label}>{findOne.desc2}</span>
                <Clipboard>{findOne.value2}</Clipboard>
              </div>
              {findOne.warn}
            </>
          )}
        </div>
      </Modal>
    );
  }
}

export default CrossChainBindModal;
