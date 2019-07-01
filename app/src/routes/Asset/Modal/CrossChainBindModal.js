import React from 'react';
import {
  Clipboard,
  Mixin,
  Modal,
  Input,
  Button,
  Toast,
  RouterGo,
  FormattedMessage,
  Icon,
  Popover,
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
import QRious from 'qrious';

@Inject(({ assetStore, electionStore }) => ({ assetStore, electionStore }))
class CrossChainBindModal extends Mixin {
  constructor(props) {
    super(props);
    const {
      globalStore: {
        modal: {
          data: { token },
        },
      },
    } = this.props;
    this.state = {
      step: token === 'BTC' ? -1 : 1,
      recommendChannelSelect: '',
      tradeId: '',
      tradeIdErrMsg: '',
      qr: '',
      isAddChanel: false,
    };
  }

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

    dispatch({ type: 'getTrusteeAddress', payload: { chain: 'Bitcoin' } }).then(res => {
      if (res) {
        const qr = new QRious({
          value: res,
        });
        this.setState({
          qr: qr.toDataURL('image/jpeg'),
        });
      }
    });
  };

  render() {
    const { checkAll } = this;
    const { step, recommendChannelSelect = {}, tradeId, tradeIdErrMsg, qr, isAddChanel } = this.state;
    const recommendChannel = recommendChannelSelect.value;
    const {
      accountStore: { currentAddress, closeModal },
      assetStore: { btcAddresses = [], btcTrusteeAddress, dispatch, loading },

      electionStore: { originIntentions = [] },
      globalStore: {
        language,
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
          <>
            <span>
              <FormattedMessage id={'DepositBTCSupportOP_RETURN'}>
                {msg => {
                  const msgs = msg.split('BTC_replace');
                  return (
                    <>
                      {msgs[0]}
                      <strong>{msgs[1]}</strong>
                      {msgs[2]}
                      <strong>{msgs[3]}</strong>
                      {msgs[4]}
                      <strong>{msgs[5]}</strong>
                      {msgs[6]}
                      <strong className={styles.isolatedWitness}>
                        (<FormattedMessage id={'BTCNotSupportSegWitAddress'} />)
                      </strong>
                    </>
                  );
                }}
              </FormattedMessage>
            </span>
          </>
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
                          {msgs[1]}
                          <strong>{msgs[2]}</strong>
                          {msgs[3]}
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
            <FormattedMessage id={'SDOTStepFirst'}>
              {msg => {
                const msgs = msg.split('SDOT_replace');
                return (
                  <span>
                    {msgs[0]}
                    <strong>{msgs[1]}</strong>
                    {msgs[2]}
                  </span>
                );
              }}
            </FormattedMessage>
          </span>
        ),
        value1: `${chainxAddressHex}`,
        desc2: '公共地址',
        value2: '0x008C343fcFB7b55430B8520B8d91D92609d2E482',
        warn: (
          <Warn>
            <div className={styles.hoverImg}>
              <FormattedMessage id={'WalletCurrentlySupport'}>
                {msg => {
                  const links = [
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
                        <RouterGo isOutSide go={{ pathname: 'https://www.coinomi.com/' }}>
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
                  ));
                  const msgs = msg.split('SDOT_replace');
                  return (
                    <>
                      {msgs[0]}
                      {links} {msgs[1]}
                    </>
                  );
                }}
              </FormattedMessage>
            </div>
          </Warn>
        ),
      },
    };

    const findOne = show[token];

    const OptionalChannel = (
      <div>
        <Input.Checkbox
          value={isAddChanel}
          size="small"
          className={styles.addChannel}
          onClick={() => {
            this.setState({
              isAddChanel: !isAddChanel,
              recommendChannelSelect: '',
            });
          }}>
          <span className={!isAddChanel ? styles.addChanneldesc : null}>
            <FormattedMessage id={'AddOptionalChannel'} />
          </span>
        </Input.Checkbox>
        {isAddChanel && (
          <FormattedMessage id={'NodeName'}>
            {msg => (
              <Input.Select
                maxHeight={150}
                allowCreate={false}
                value={recommendChannelSelect}
                placeholder={msg}
                options={selectNameOptions}
                onChange={value => {
                  this.setState({
                    recommendChannelSelect: value,
                  });
                }}
              />
            )}
          </FormattedMessage>
        )}
      </div>
    );

    const BTC = (
      <>
        <div className={styles.desc}>{findOne.desc1}</div>
        <div className={classNames(styles.grayblock, styles.addressall, styles.btcopreturn)}>
          <div className={styles.address}>
            <div className={styles.OP_RETURNtitle}>
              <strong>
                <FormattedMessage id={'InformationToFilled'} values={{ data: 'OP_RETURN' }} />
              </strong>
              <Clipboard
                id="copy"
                dataText={findOne.value1}
                outInner={
                  <span className={styles.desc}>
                    <FormattedMessage id={'CopyMessage'} />
                  </span>
                }
              />
            </div>
            <div className={styles.OP_RETURNcopy}>
              <span id="copy">{findOne.value1}</span>
              <HoverTip tip={<FormattedMessage id={'BTCMapToChainXAddress'} />}>
                <Icon name={'icon-jieshishuoming'} />
              </HoverTip>
            </div>
          </div>
        </div>
        <div className={classNames(styles.grayblock, styles.depositaddress)}>
          <div className={styles.depositaddresstitle}>
            <span className={styles.label}>
              {findOne.desc2}
              <span>（向该地址充值）</span>
            </span>
            <Button type={'outline'}>
              <Popover body={<img src={qr} />}>
                <span>
                  <Icon name={'erweima'} />
                  地址二维码
                </span>
              </Popover>
            </Button>
          </div>
          <Clipboard>
            <span className={styles.depositaddressvalue}>{findOne.value2}</span>
          </Clipboard>
        </div>
        {btcAddresses.length > 0 && (
          <div className={classNames(styles.grayblock, styles.bitcoinlinks)}>
            <div>
              <strong>与当前账户已建立绑定关系的Bitcoin地址</strong>
              <HoverTip tip={'使用已建立绑定关系的地址进行充值，无需携带OP_RETURN'}>
                <Icon name={'icon-jieshishuoming'} />
              </HoverTip>
            </div>
            <ul>
              {btcAddresses.map((address, index) => {
                return (
                  <li key={index}>
                    <div>{address}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {btcAddresses.length > 0 ? null : OptionalChannel}
      </>
    );

    const SDOT = (
      <>
        <div className={styles.grayblock1}>
          <div>
            <FormattedMessage id={'SDOTICO'}>
              {msg => {
                const msgs = msg.split('SDOT_replace');
                return (
                  <span>
                    <strong>{msgs[0]}</strong>
                    {msgs[1]}
                  </span>
                );
              }}
            </FormattedMessage>
            <RouterGo
              style={{ fontWeight: 'bold' }}
              isOutSide
              go={{
                pathname: 'https://etherscan.io/token/tokenholderchart/0xb59f67a8bff5d8cd03f6ac17265c550ed8f33907',
              }}>
              <FormattedMessage id={'ViewETHList'} />
            </RouterGo>
          </div>
        </div>
        <div className={styles.desc}>
          <span className={styles.step}>
            <FormattedMessage id={'FistStep'} />
          </span>
          {findOne.desc1}
        </div>
        <div className={classNames(styles.grayblock, styles.addressall, styles.sdot, styles[language])}>
          <div className={styles.address}>
            <div className={styles.OP_RETURNtitle}>
              <FormattedMessage id={'InformationToFilled'} values={{ data: 'Data' }} />
              <Clipboard
                id="copy"
                dataText={findOne.value1}
                outInner={
                  <span className={styles.desc}>
                    <FormattedMessage id={'CopyMessage'} />
                  </span>
                }
              />
            </div>
            <div className={styles.OP_RETURNcopy}>
              <div>
                <span id="copy">{findOne.value1}</span>
                <HoverTip tip={<FormattedMessage id={'SDOTMapToChainXAddress'} />}>
                  <Icon name={'icon-jieshishuoming'} />
                </HoverTip>
                <div className={styles.dataerror}>
                  <FormattedMessage id={'IncorrectDataFormat'}>
                    {msg => {
                      const msgs = msg.split('SDOT_replace');
                      return (
                        <>
                          {msgs[0]}
                          <span>{msgs[1]}</span>
                          {msgs[2]}
                        </>
                      );
                    }}
                  </FormattedMessage>
                </div>
              </div>
            </div>
          </div>
        </div>
        {OptionalChannel}
        <div className={styles.desc}>
          <span className={styles.step}>
            <FormattedMessage id={'SecondStep'} />
          </span>
          <FormattedMessage id={'SDOTSent'}>
            {msg => {
              const msgs = msg.split('SDOT_replace');
              return (
                <span>
                  {msgs[0]}
                  <strong>{msgs[1]}</strong>
                  {msgs[2]}
                </span>
              );
            }}
          </FormattedMessage>
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
            loading={loading.bindTxHashLoading}
            onClick={() => {
              if (checkAll.confirm()) {
                const params = this.getTradeId();
                dispatch({
                  type: 'bindTxHash',
                  payload: {
                    params,
                  },
                }).then(res => {
                  if (res) closeModal();
                });
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        </div>
      </>
    );

    const BTCGuide = (
      <div className={styles.userInstructions}>
        <div className={styles.description}>
          <div className={styles.chinxbitoin}>
            ChainX是去中心化跨链交易所，需要将ChainX的地址和Bitcoin的地址建立联系，
            <span>
              <strong>因此需要Bitcoin发送携带OP_RETURN的交易</strong>
            </span>
            。
          </div>
          <div className={styles.supportopreturn}>
            <span>
              <strong>目前支持发送OP_RETURN交易的钱包有：</strong>
              {[
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/BitX/releases' }}>
                      BitX、
                    </RouterGo>
                  ),
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://trezor.io/' }}>
                      Trezor、
                    </RouterGo>
                  ),
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://coinb.in/#newTransaction' }}>
                      Coinb.in。
                    </RouterGo>
                  ),
                },
              ].map((item, index) => (
                <span key={index} className={styles.anchor}>
                  {item.content}
                </span>
              ))}
            </span>
            <div className={styles.notice}>注：类似imToken钱包的memo不是OP_RETURN。</div>
          </div>
          <div className={styles.twosorts}>
            <strong>目前支持发送OP_RETURN的钱包分为两类：</strong>
          </div>
          <div className={styles.sortfirst}>
            <div className={styles.sorttitle}>
              <span>第一类</span>每次充值都需要携带OP_RETURN
            </div>
            <div>
              由于Bitcoin安全策略，一般情况下每次发送交易后地址都会发生变化，因此该类钱包每次充值都需要携带OP_RETURN。
            </div>
            <div className={styles.examplewallet}>
              这类钱包有：{' '}
              {[
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://trezor.io/' }}>
                      Trezor、
                    </RouterGo>
                  ),
                  src: trezor,
                  imgWidth: 352,
                },
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://coinb.in/#newTransaction' }}>
                      Coinb.in。
                    </RouterGo>
                  ),
                  src: coinbin,
                  imgWidth: 652,
                },
              ].map((item, index) => (
                <span key={index} className={styles.anchor}>
                  <HoverTip width tip={<img src={item.src} width={item.imgWidth} />} className={styles.imgtip}>
                    {item.content}
                  </HoverTip>
                </span>
              ))}
            </div>
          </div>
          <div className={styles.sortsecond}>
            <div className={styles.sorttitle}>
              <span>第二类</span>只需要第一次充值携带OP_RETURN
            </div>
            <div>
              支持使用相同地址发送交易的钱包，只需第一次充值携带OP_RETURN，便可与ChainX建立绑定关系，后续充值不需要再携带OP_RETURN。
            </div>
            <div className={styles.examplewallet}>
              这类钱包有：
              {[
                {
                  content: (
                    <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/BitX/releases' }}>
                      BitX。
                    </RouterGo>
                  ),
                  imgWidth: 244,
                  show: true,
                },
              ].map((item, index) => (
                <span key={index} className={styles.anchor}>
                  {/*<HoverTip tip={<img src={item.src} width={item.imgWidth} />} className={styles.imgtip}>*/}
                  {/*{item.content}*/}
                  {/*</HoverTip>*/}
                  {item.content}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Button
          className={styles.agree}
          size="full"
          type="confirm"
          onClick={() => this.setState({ step: btcAddresses.length ? 1 : 1 })}>
          同意
        </Button>
        <Warn className={styles.warning}>
          <div>
            <strong>若充值时未携带OP_RETURN，则充值无法到账，</strong>
            只需使用相同的Bitcoin地址再发送一笔携带OP_RETURN的交易，即可完成该Bitcoin地址下的所有充值。
            <strong>(当前不支持隔离见证地址的充值)</strong>
          </div>
        </Warn>
      </div>
    );

    return (
      <Modal
        scroll={token === 'SDOT'}
        title={
          <>
            {token === 'BTC' && step === -1 ? (
              <FormattedMessage id={'UserInstructions'} />
            ) : (
              <>
                {token === 'SDOT' && <FormattedMessage id={'CrossChainMapping'} />}
                {token === 'BTC' && <FormattedMessage id={'CrossChainDeposit'} />}({token})
              </>
            )}
          </>
        }
        isOverflow>
        <div className={styles.crossChainBind}>
          {step === -1 && BTCGuide}
          {step === 1 && (
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
