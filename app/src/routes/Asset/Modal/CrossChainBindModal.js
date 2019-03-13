import React from 'react';
import { Clipboard, Mixin, Modal, Input, ButtonGroup, Button, Toast } from '../../../components';
import { Warn } from '../../components';
import * as styles from './CrossChainBindModal.less';
import { classNames, Inject, fetchFromHttp, _, Patterns } from '../../../utils';
import { u8aToHex } from '@polkadot/util/u8a';
import imtoken from '../../../resource/imtoken.png';
import parity from '../../../resource/parity.png';
import myEtherWallet from '../../../resource/myEtherWallet.png';
import Jaxx from '../../../resource/Jaxx.png';
import myCrypto from '../../../resource/myCrypto.png';
import trust from '../../../resource/trust.png';
import bitpie from '../../../resource/bitpie.png';
import coinomi from '../../../resource/coinomi.png';

@Inject(({ assetStore }) => ({ assetStore }))
class CrossChainBindModal extends Mixin {
  state = {
    step: 0,
    recommendChannel: '',
    tradeId: '',
    tradeIdErrMsg: '',
  };
  checkAll = {
    checkTradeId: () => {
      const { tradeId } = this.state;
      const result = this.getTradeId();
      const errMsg = Patterns.check('required')(tradeId) || (!result ? '交易ID错误' : '');
      this.setState({ tradeIdErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkTradeId'].every(item => !this.checkAll[item]());
    },
  };

  getTradeId = () => {
    const { tradeId } = this.state;
    const regexp = /^(https:\/\/etherscan.io\/tx\/)?(0x)?([\da-f]{64})$/;
    const result = regexp.exec(tradeId);
    if (result && result[3]) {
      return result[3];
    }
  };

  startInit = () => {
    const {
      assetStore: { dispatch },
    } = this.props;

    dispatch({ type: 'getTrusteeAddress', payload: { chain: 'Bitcoin' } });
  };

  render() {
    const { checkAll } = this;
    const { step, recommendChannel, tradeId, tradeIdErrMsg } = this.state;
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
            用户需使用 <strong>支持OP_RETURN</strong> 的BTC钱包向公共多签托管地址充值，并在<strong>OP_RETURN</strong>{' '}
            中输入下方 <strong>十六进制 (Hex)</strong> 信息以完成与ChainX的绑定：
          </span>
        ),
        value1: chainxAddressHex,
        desc2: '公共多签托管地址',
        value2: btcTrusteeAddress,
        warn: (
          <Warn>
            <div>
              <strong>
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
                等,
                <br />
                不添加OP_RETURN信息，充值无法到账
              </strong>
            </div>
          </Warn>
        ),
      },
      SDOT: {
        desc1: (
          <span>
            使用<strong>支持Data</strong>的以太坊钱包，向任意地址发起任意金额 (建议为0) 的转账交易，并在{' '}
            <strong>Data</strong> 中输入下方<strong>十六进制 (Hex)</strong> 信息：：
          </span>
        ),
        value1: chainxAddressHex,
        desc2: '公共地址',
        value2: '0x008C343fcFB7b55430B8520B8d91D92609d2E482',
        warn: (
          <Warn>
            <div className={styles.sdot}>
              目前支持Data的钱包有:{' '}
              {[
                {
                  content: 'imToken',
                  style: { left: -100 },
                  src: imtoken,
                  imgWidth: 244,
                },
                {
                  content: 'Parity',
                  style: { left: -150 },
                  src: parity,
                  imgWidth: 352,
                },
                {
                  content: 'MyEtherWallet',
                  style: { left: -120 },
                  src: myEtherWallet,
                  imgWidth: 352,
                },
                {
                  content: 'Jaxx',
                  style: { left: -100 },
                  src: Jaxx,
                  imgWidth: 244,
                },
                {
                  content: 'MyCrypto',
                  style: { left: -100 },
                  src: myCrypto,
                  imgWidth: 244,
                },
                {
                  content: 'Trust',
                  style: { left: -100 },
                  src: trust,
                  imgWidth: 244,
                },
                {
                  content: 'Bitpie',
                  style: { left: -100 },
                  src: bitpie,
                  imgWidth: 244,
                },
                {
                  content: 'Coinomi',
                  style: { left: -100 },
                  src: coinomi,
                  imgWidth: 244,
                },
              ].map((item, index) => (
                <a key={index} className={styles.anchor} href={''} rel="noopener noreferrer" target="_blank">
                  {item.content}
                  <span className={styles.hoverimg} style={item.style}>
                    <img src={item.src} width={item.imgWidth} />
                  </span>
                  、
                </a>
              ))}{' '}
              等。
            </div>
          </Warn>
        ),
      },
    };

    const findOne = show[token];

    return (
      <Modal title={`跨链${token === 'SDOT' ? '映射' : '充值'}（${token}）`}>
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
              {token === 'BTC' ? (
                <div className={styles.depositaddress}>
                  <span className={styles.label}>{findOne.desc2}</span>
                  <Clipboard>{findOne.value2}</Clipboard>
                </div>
              ) : null}
              {token === 'SDOT' ? (
                <>
                  <div className={styles.desc}>
                    <div />
                    交易打包成功后，在下面输入交易ID <strong>交易ID (Txid/TxHash)</strong>
                    ，交易签名验证无误后，即可完成映射
                  </div>
                  <div className={styles.tradeid}>
                    <Input.Text
                      isTextArea
                      rows={2}
                      value={tradeId}
                      errMsg={tradeIdErrMsg}
                      placeholder={'输入交易ID'}
                      onChange={value => {
                        this.setState({
                          tradeId: value,
                        });
                      }}
                      onBlur={checkAll.checkTradeId}
                    />
                    <Button
                      size="full"
                      type="confirm"
                      onClick={() => {
                        if (checkAll.confirm()) {
                          const params = this.getTradeId();
                          fetchFromHttp({
                            url: 'http://47.99.192.159:8100',
                            methodAlias: 'tx_hash',
                            params: [params],
                          })
                            .then(res => {
                              if (_.get(res, 'error.message')) {
                                Toast.warn('交易ID绑定失败', _.get(res, 'error.message'));
                              } else {
                                Toast.success('交易ID绑定已完成');
                              }
                            })
                            .catch(err => {
                              Toast.warn('交易ID绑定失败', err.message);
                            });
                        }
                      }}>
                      确认
                    </Button>
                  </div>
                </>
              ) : null}

              {findOne.warn}
            </>
          )}
        </div>
      </Modal>
    );
  }
}

export default CrossChainBindModal;
