import React from 'react';
import {
  Clipboard,
  Mixin,
  Modal,
  Input,
  ButtonGroup,
  Button,
  Toast,
  RouterGo,
  FormattedMessage,
  Icon,
} from '../../../components';
import { HoverTip, Warn } from '../../components';
import * as styles from './CrossChainBindModal.less';
import { classNames, Inject, _, Patterns } from '../../../utils';
import { u8aToHex } from '@polkadot/util/u8a';
import imtoken from '../../../resource/imtoken.png';
import parity from '../../../resource/parity.png';
import myEtherWallet from '../../../resource/myEtherWallet.png';
import Jaxx from '../../../resource/Jaxx.png';
import myCrypto from '../../../resource/myCrypto.png';
import trust from '../../../resource/trust.png';
import bitpie from '../../../resource/bitpie.png';
import coinomi from '../../../resource/coinomi.png';
import trezor from '../../../resource/trezor.png';
import coinbin from '../../../resource/coinbin.png';

@Inject(({ assetStore, electionStore }) => ({ assetStore, electionStore }))
class CrossChainBindModal extends Mixin {
  state = {
    step: 0,
    recommendChannelSelect: '',
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
    const { step, recommendChannelSelect = {}, tradeId, tradeIdErrMsg } = this.state;
    const recommendChannel = recommendChannelSelect.value;
    const {
      accountStore: { currentAddress, closeModal },
      assetStore: { btcTrusteeAddress, dispatch },
      electionStore: { originIntentions = [] },
      globalStore: {
        modal: {
          data: { token },
        },
      },
    } = this.props;

    const channel = recommendChannel ? `@${recommendChannel}` : '';
    const chainxAddressHex = u8aToHex(new TextEncoder('utf-8').encode(`${currentAddress}${channel}`)).replace(
      /^0x/,
      ''
    );
    const selectNameOptions = originIntentions.map((item = {}) => ({ label: item.name, value: item.name }));
    const show = {
      BTC: {
        desc1: (
          <span>
            用户需使用<strong>支持OP_RETURN</strong>的BTC钱包向<strong>公共多签托管</strong>地址进行充值，并且在
            <strong>OP_RETURN</strong>中输入下方信息以完成与ChainX的绑定：
          </span>
        ),
        value1: chainxAddressHex,
        desc2: <FormattedMessage id={'PublicMultiSigTrusteeAddress'} />,
        value2: btcTrusteeAddress,
        warn: (
          <Warn>
            <div className={styles.hoverImg}>
              <span>
                {
                  <FormattedMessage id={'BTCWarn'}>
                    {msg => {
                      const link = (
                        <span>
                          {[
                            {
                              content: (
                                <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/BitX/releases' }}>
                                  BitX
                                  <FormattedMessage id={'Wallet'} />
                                </RouterGo>
                              ),
                              style: { left: -100 },
                              imgWidth: 244,
                              show: true,
                            },
                            {
                              content: (
                                <RouterGo isOutSide go={{ pathname: 'https://trezor.io/' }}>
                                  Trezor
                                </RouterGo>
                              ),
                              style: { left: -160 },
                              src: trezor,
                              imgWidth: 352,
                            },
                            {
                              content: (
                                <RouterGo isOutSide go={{ pathname: 'https://coinb.in/#newTransaction' }}>
                                  Coinb.in
                                </RouterGo>
                              ),
                              style: { left: -160 },
                              src: coinbin,
                              imgWidth: 352,
                            },
                          ]
                            .filter(item => item.show)
                            .map((item, index) => (
                              <span key={index} className={styles.anchor}>
                                <HoverTip tip={<img src={item.src} width={item.imgWidth} />} className={styles.imgtip}>
                                  {item.content}
                                </HoverTip>
                              </span>
                            ))}
                        </span>
                      );
                      const msgs = msg.split('BitX_replace');

                      return (
                        <span>
                          {msgs[0]}
                          <strong>{link}</strong>
                          {msgs[1]}
                        </span>
                      );
                    }}
                  </FormattedMessage>
                }
                <RouterGo
                  isOutSide
                  go={{
                    pathname:
                      'https://github.com/chainx-org/ChainX/wiki/%E5%85%85%E5%80%BC%E6%8C%96%E7%9F%BF#%E5%85%85%E5%80%BC%E5%A5%96%E5%8A%B1',
                  }}>
                  查看充值奖励规则
                </RouterGo>
              </span>
            </div>
          </Warn>
        ),
      },
      SDOT: {
        desc1: (
          <span>
            由持有DOT的地址向任意地址 (建议向自己) 发起任意金额 (建议为0) 的转账交易，并在<strong>Data</strong>
            中输入下方信息：
          </span>
        ),
        value1: `${chainxAddressHex}`,
        desc2: '公共地址',
        value2: '0x008C343fcFB7b55430B8520B8d91D92609d2E482',
        warn: (
          <Warn>
            <div className={styles.hoverImg}>
              目前支持Data的钱包有:{' '}
              {[
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://token.im/' }}>
                      ImToken
                    </RouterGo>
                  ),
                  style: { left: -100 },
                  src: imtoken,
                  imgWidth: 244,
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://github.com/paritytech/parity-ethereum/releases' }}>
                      Parity
                    </RouterGo>
                  ),
                  style: { left: -160 },
                  src: parity,
                  imgWidth: 352,
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://www.myetherwallet.com/' }}>
                      MyEtherWallet
                    </RouterGo>
                  ),
                  style: { left: -120 },
                  src: myEtherWallet,
                  imgWidth: 352,
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://jaxx.io/' }}>
                      Jaxx
                    </RouterGo>
                  ),
                  style: { left: -160 },
                  src: Jaxx,
                  imgWidth: 352,
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://mycrypto.com' }}>
                      MyCrypto
                    </RouterGo>
                  ),
                  style: { left: -160 },
                  src: myCrypto,
                  imgWidth: 352,
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://trustwallet.com/' }}>
                      Trust
                    </RouterGo>
                  ),
                  style: { left: -160 },
                  src: trust,
                  imgWidth: 352,
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://bitpie.com/' }}>
                      bitpie
                    </RouterGo>
                  ),
                  style: { left: -100 },
                  src: bitpie,
                  imgWidth: 244,
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'coinomi' }}>
                      coinomi
                    </RouterGo>
                  ),
                  style: { left: -160 },
                  src: coinomi,
                  imgWidth: 352,
                },
              ].map((item, index) => (
                <span key={index} className={styles.anchor}>
                  <HoverTip tip={<img src={item.src} width={item.imgWidth} />} className={styles.imgtip}>
                    {item.content}
                  </HoverTip>
                  {index === 7 ? null : '、'}
                </span>
              ))}{' '}
              等。
            </div>
          </Warn>
        ),
      },
    };

    const findOne = show[token];

    const BTC = (
      <>
        <div className={styles.desc}>{findOne.desc1}</div>
        <div className={classNames(styles.grayblock, styles.addressall)}>
          <div className={styles.address}>
            <div className={styles.OP_RETURNcopy}>
              <span id="copy">{findOne.value1}</span>
              <HoverTip tip="本次BTC跨链充值的ChainX地址(16进制)">
                <Icon name={'icon-jieshishuoming'} />
              </HoverTip>
            </div>
            <div className={styles.OP_RETURNtitle}>
              OP_RETURN中需要输入的信息：
              <Clipboard
                id="copy"
                outInner={
                  <span className={styles.desc}>
                    <FormattedMessage id={'CopyMessage'} />
                  </span>
                }
              />
            </div>
          </div>
        </div>
        <div className={classNames(styles.grayblock, styles.depositaddress)}>
          <span className={styles.label}>{findOne.desc2}</span>
          <Clipboard>
            <span className={styles.depositaddressvalue}>{findOne.value2}</span>
          </Clipboard>
        </div>
      </>
    );

    const SDOT = (
      <>
        <div className={styles.grayblock1}>
          <div>
            <strong>参与了Polkadot第一期ICO的用户</strong>，可以将锁定的DOT
            1：1映射为SDOT，享受在ChainX内永久参与充值挖矿的福利。{' '}
            <RouterGo
              style={{ fontWeight: 'bold' }}
              isOutSide
              go={{
                pathname: 'https://etherscan.io/token/tokenholderchart/0xb59f67a8bff5d8cd03f6ac17265c550ed8f33907',
              }}>
              点击查看参与用户地址列表
            </RouterGo>
          </div>
        </div>
        <div className={styles.desc}>
          <span className={styles.step}>第一步</span>
          {findOne.desc1}
        </div>
        <div className={classNames(styles.grayblock, styles.addressall, styles.sdot)}>
          <div className={styles.address}>
            <div className={styles.OP_RETURNcopy}>
              <div>
                <span id="copy">{findOne.value1}</span>
                <HoverTip tip="本次SDOT跨链映射的ChainX地址(16进制)">
                  <Icon name={'icon-jieshishuoming'} />
                </HoverTip>
                <div className={styles.dataerror}>
                  如果出现<span>“Data格式不正确”</span>的提示，您可以尝试在本条信息前面添加 0x 以解决该问题。
                </div>
              </div>
            </div>
            <div className={styles.OP_RETURNtitle}>
              Data中需要输入的信息：
              <Clipboard
                id="copy"
                outInner={
                  <span className={styles.desc}>
                    <FormattedMessage id={'CopyMessage'} />
                  </span>
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.desc}>
          <span className={styles.step}>第二步</span>
          交易打包成功后，在下方输入<strong>交易ID (Txid/TxHash)</strong>。待交易签名验证无误，即可完成映射,
          SDOT会立即发放。
        </div>
        <div className={styles.tradeid}>
          <Input.Text
            isTextArea
            rows={2}
            value={tradeId}
            errMsg={tradeIdErrMsg}
            placeholder={'0x002a3bfcf910ed48c3837c7293062caee146bb72ca1cfd0bd398315e3a07ce79'}
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
                dispatch({
                  type: 'bindTxHash',
                  payload: {
                    params,
                  },
                })
                  .then(res => {
                    if (_.get(res, 'error.message')) {
                      Toast.warn('交易ID绑定失败', _.get(res, 'error.message'));
                    } else {
                      Toast.success('交易ID绑定已完成');
                      closeModal();
                    }
                  })
                  .catch(err => {
                    Toast.warn('交易ID绑定失败', err.message);
                  });
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        </div>
      </>
    );

    return (
      <Modal
        scroll={step !== 0}
        title={
          <>
            {token === 'SDOT' ? (
              <FormattedMessage id={'CrossChainMapping'} />
            ) : (
              <FormattedMessage id={'CrossChainDeposit'} />
            )}
            ({token})
          </>
        }
        isOverflow>
        <div className={styles.crossChainBind}>
          {step === 0 ? (
            <div>
              <Input.Select
                allowCreate={false}
                value={recommendChannelSelect}
                placeholder={<FormattedMessage id={'RecommendedChannelNode'} />}
                options={selectNameOptions}
                onChange={value => {
                  this.setState({
                    recommendChannelSelect: value,
                  });
                }}
              />
              <ButtonGroup className={styles.recommendChannel}>
                <Button
                  onClick={() => {
                    this.setState({
                      step: 1,
                      recommendChannelSelect: {},
                    });
                  }}>
                  <FormattedMessage id={'Skip'} />
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
                  <FormattedMessage id={'Confirm'} />
                </Button>
              </ButtonGroup>
            </div>
          ) : (
            <>
              {token === 'BTC' && BTC}
              {token === 'SDOT' && SDOT}
              <div className={styles.warn}>{findOne.warn}</div>
            </>
          )}
        </div>
      </Modal>
    );
  }
}

export default CrossChainBindModal;
