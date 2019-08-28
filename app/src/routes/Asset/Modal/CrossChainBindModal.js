import React, { Component } from 'react';
import {
  Button,
  Clipboard,
  FormattedMessage,
  Icon,
  Input,
  LanguageContent,
  Mixin,
  Modal,
  RouterGo,
  Toast,
} from '../../../components';
import { HoverTip, Warn } from '../../components';
import * as styles from './CrossChainBindModal.less';
import { classNames, Inject, isElectron, observer, Patterns, showAssetName } from '../../../utils';
import { u8aToHex } from '@polkadot/util/u8a';
import imtoken from '../../../resource/imtoken.png';
import parity from '../../../resource/parity.png';
import myEtherWallet from '../../../resource/myEtherWallet.png';
import Jaxx from '../../../resource/Jaxx.png';
import myCrypto from '../../../resource/myCrypto.png';
import trust from '../../../resource/trust.png';
import bitpie from '../../../resource/bitpie.png';
import bitpieOpreturn from '../../../resource/bitPie_Opreturn.png';
import coinomi from '../../../resource/coinomi.png';
import trezor from '../../../resource/trezor.png';
import coinbin from '../../../resource/coinbin.png';
import BitX from '../../../resource/BitX.png';
import MathWallet from '../../../resource/MathWallet.png';
import bitportal from '../../../resource/bitportal.io.png';
import WOOKONG from '../../../resource/WOOKONG.png';
import QRious from 'qrious';

@observer
class OptionalChannelSelect extends Component {
  render() {
    const { recommendChannelSelect = {}, updateRecommendChannelSelect, isAddChanel } = this.props;
    const {
      electionStore: { originIntentions = [] },
    } = this.props;
    const selectNameOptions = originIntentions.map((item = {}) => ({ label: item.name, value: item.name }));
    return (
      <div>
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
                  updateRecommendChannelSelect(value);
                }}
              />
            )}
          </FormattedMessage>
        )}
      </div>
    );
  }
}

@observer
class X_BTC extends Mixin {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      isAddChanel: '',
      recommendChannelSelect: '',
      tradeIdErrMsg: '',
      qr: '',
    };
  }

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
    const { step, recommendChannelSelect = {}, isAddChanel } = this.state;
    const recommendChannel = recommendChannelSelect.value;
    const {
      accountStore: { currentAddress },
      assetStore: { btcAddresses = [], btcTrusteeAddress },
      globalStore: {
        closeModal,
        modal: {
          data: { token },
        },
      },
      getChainXAddressHex,
    } = this.props;

    const chainxAddressHex = getChainXAddressHex(recommendChannel, currentAddress);

    const findOne = {
      desc1: '',
      value1: chainxAddressHex,
      desc2: <FormattedMessage id="TrustHotMultiSignatureAddress" />,
      value2: btcTrusteeAddress,
      warn: (
        <Warn>
          <div className={styles.hoverImg}>
            <FormattedMessage id={'WalletOpreturnSupport'}>
              {msg => {
                const links = [
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://bitpie.com/' }}>
                        Bitpie
                      </RouterGo>
                    ),
                    style: { left: -100 },
                    src: bitpieOpreturn,
                    imgWidth: 244,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'http://www.mathwallet.org/' }}>
                        MathWallet
                      </RouterGo>
                    ),
                    src: MathWallet,
                    imgWidth: 244,
                    show: true,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://www.bitportal.io/zh/' }}>
                        BitPortal
                      </RouterGo>
                    ),
                    src: bitportal,
                    imgWidth: 244,
                    show: true,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://wookong.nbltrust.com/' }}>
                        WOOKONG
                      </RouterGo>
                    ),
                    src: WOOKONG,
                    imgWidth: 506,
                    show: true,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/BitX/releases' }}>
                        BitX
                      </RouterGo>
                    ),
                    src: BitX,
                    imgWidth: 244,
                    show: true,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://trezor.io/' }}>
                        Trezor
                      </RouterGo>
                    ),
                    src: trezor,
                    imgWidth: 352,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://coinb.in/#newTransaction' }}>
                        Coinb.in
                      </RouterGo>
                    ),
                    src: coinbin,
                    imgWidth: 650,
                  },
                ].map((item, index) => (
                  <span key={index} className={styles.anchor}>
                    <HoverTip
                      width={item.imgWidth}
                      tip={<img src={item.src} width={item.imgWidth} />}
                      className={styles.imgtip}>
                      {item.content}
                    </HoverTip>
                    {index === 6 ? null : ', '}
                  </span>
                ));
                const msgs = msg.split('OP_RETURN_replace');
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
    };

    const BTC = (
      <>
        {/*<div className={styles.desc}>{findOne.desc1}</div>*/}

        <div className={styles.desc}>
          <span className={styles.step}>
            <FormattedMessage id={'FistStep'} />
          </span>
          <span className={styles.bold}>
            <LanguageContent zh={'获取OP_RETURN'} en={'Get OP_RETURN'} />
          </span>
          <div>
            <LanguageContent
              zh={'获取含有16进制ChainX地址的OP_RETURN信息。'}
              en={'Get OP_RETURN information with a hexadecimal ChainX address'}
            />
          </div>
        </div>

        {btcAddresses.length > 0 ? null : (
          <OptionalChannelSelect
            {...this.props}
            recommendChannelSelect={recommendChannelSelect}
            updateRecommendChannelSelect={value => {
              this.setState({
                recommendChannelSelect: value,
              });
            }}
          />
        )}
        <div className={classNames(styles.grayblock, styles.addressall, styles.btcopreturn)}>
          <div className={styles.address}>
            <div className={styles.OP_RETURNtitle}>
              <strong>
                <FormattedMessage id={'InformationToFilled'} values={{ data: 'OP_RETURN' }} />
              </strong>
              {btcAddresses.length > 0 ? null : (
                <Input.Checkbox
                  value={isAddChanel}
                  size="small"
                  className={styles.addChannel}
                  onClick={() => {
                    this.setState(
                      {
                        isAddChanel: !isAddChanel,
                      },
                      () => {
                        this.setState({
                          recommendChannelSelect: '',
                        });
                      }
                    );
                  }}>
                  <span className={!isAddChanel ? styles.addChanneldesc : null}>
                    <FormattedMessage id={'AddOptionalChannel'} />
                  </span>
                </Input.Checkbox>
              )}

              {/*<Clipboard*/}
              {/*id="copy"*/}
              {/*dataText={findOne.value1}*/}
              {/*outInner={*/}
              {/*<span className={styles.desc}>*/}
              {/*<FormattedMessage id={'CopyMessage'} />*/}
              {/*</span>*/}
              {/*}*/}
              {/*/>*/}
            </div>
            <div className={styles.OP_RETURNcopy}>
              <div className={styles.select}>
                <OptionalChannelSelect
                  isAddChanel={isAddChanel}
                  {...this.props}
                  recommendChannelSelect={recommendChannelSelect}
                  updateRecommendChannelSelect={value => {
                    this.setState({
                      recommendChannelSelect: value,
                    });
                  }}
                />
              </div>
              <Clipboard>{findOne.value1}</Clipboard>
              {/*<span id="copy">{findOne.value1}</span>*/}
              {/*<HoverTip tip={<FormattedMessage id={'BTCMapToChainXAddress'} />}>*/}
              {/*<Icon name={'icon-jieshishuoming'} />*/}
              {/*</HoverTip>*/}
            </div>
          </div>
        </div>
        <div className={styles.desc}>
          <span className={styles.step}>
            <FormattedMessage id={'SecondStep'} />
          </span>
          <span className={styles.bold}>
            <LanguageContent zh={'发起跨链充值'} en={'Initiate cross-chain recharge'} />
          </span>
          <div>
            <LanguageContent
              zh={
                <span>
                  使用支持OP_RETURN的钱包向信托热多签地址充值
                  <span className={styles.depositCount}>（充值金额必须 >=0.001 BTC）</span>
                  并输入OP_RETURN信息。注意：类似imToken钱包的memo不是OP_RETURN；目前仅支持1和3开头的BTC地址发起的跨链充值。
                </span>
              }
              en={
                <span>
                  Use a wallet that supports OP_RETURN to recharge the hot multi-signature address of the trust{' '}
                  <span className={styles.depositCount}>(the amount of recharge must be >= 0.001 BTC)</span> and enter
                  OP_RETURN information. Note: Memo similar to imToken wallet is not OP_RETURN; at present, it only
                  supports cross-chain recharge initiated by BTC addresses at the beginning of 1 and 3.
                </span>
              }
            />
          </div>
        </div>
        <div className={classNames(styles.grayblock, styles.depositaddress)}>
          <div className={styles.depositaddresstitle}>
            <span className={styles.label}>{findOne.desc2}</span>
            {/*<Clipboard*/}
            {/*id="copy2"*/}
            {/*dataText={findOne.value2}*/}
            {/*outInner={*/}
            {/*<span className={styles.desc}>*/}
            {/*<FormattedMessage id={'CopyMessage'} />*/}
            {/*</span>*/}
            {/*}*/}
            {/*/>*/}
            {/*<Button type={'outline'}>*/}
            {/*<Popover body={<img src={qr} />}>*/}
            {/*<span>*/}
            {/*<Icon name={'erweima'} />*/}
            {/*地址二维码*/}
            {/*</span>*/}
            {/*</Popover>*/}
            {/*</Button>*/}
          </div>
          <span className={styles.depositaddressvalue}>
            <Clipboard>{findOne.value2}</Clipboard>
          </span>
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
          onClick={() => this.setState({ step: btcAddresses.length > 0 ? 1 : 1 })}>
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
        title={
          <div className={styles.title}>
            {step === -1 ? (
              <FormattedMessage id={'UserInstructions'} />
            ) : (
              <>
                {<FormattedMessage id={'CrossChainDeposit'} />}({showAssetName(token)})
                <div className={styles.lock}>
                  <RouterGo
                    isOutSide
                    go={{
                      pathname:
                        'https://chainx.org/help?title=%E5%A6%82%E4%BD%95%E8%B7%A8%E9%93%BE%E5%85%85%E5%80%BCBTC',
                    }}>
                    <Icon name={'help'} />
                    <FormattedMessage id={'DepositCourse'} />
                  </RouterGo>
                  {isElectron() ? null : (
                    <span className={styles.warntitle}>
                      <FormattedMessage id={'DoNotDepositDemoAccount'} />
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        }
        isOverflow>
        <div className={styles.crossChainBind}>
          {step === -1 && BTCGuide}
          {step === 1 && (
            <div className={styles.btccontent}>
              {BTC}
              <Button
                size="full"
                type="confirm"
                onClick={() => {
                  closeModal();
                }}>
                <FormattedMessage id={'Confirm'} />
              </Button>
              <div className={styles.warn}>{findOne.warn}</div>
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

@observer
class L_BTC extends Mixin {
  constructor(props) {
    super(props);
    this.state = {
      isAddChanel: '',
      lockLocationPosition: '',
      lockLocationPositionErrMsg: '',
      recommendChannelSelect: '',
    };
  }

  checkAll = {
    checkLockLocationPosition: () => {
      const { lockLocationPosition } = this.state;
      const {
        model: { isTestBitCoinNetWork },
      } = this.props;
      const errMsg =
        Patterns.check('required')(lockLocationPosition) ||
        Patterns.check('isBTCAddress')(lockLocationPosition, isTestBitCoinNetWork());
      this.setState({ lockLocationPositionErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkLockLocationPosition'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const {
      recommendChannelSelect = {},
      lockLocationPosition = '',
      lockLocationPositionErrMsg,
      isAddChanel,
    } = this.state;
    const recommendChannel = recommendChannelSelect.value;
    const {
      model: { isTestBitCoinNetWork },
      accountStore: { currentAddress },
      assetStore: { btcAddresses = [], btcTrusteeAddress },
      globalStore: {
        modal: {
          data: { token },
        },
        closeModal,
      },
    } = this.props;

    const getChainXAddressHex = () => {
      if (!lockLocationPosition) return '';
      if (Patterns.check('isBTCAddress')(lockLocationPosition, isTestBitCoinNetWork())) return '';
      //ChainX:用户ChainX地址[@channel]:用户BTC锁仓地址[0..4]
      const channel = recommendChannel ? `@${recommendChannel}` : '';
      const positionSlice = lockLocationPosition ? `:${lockLocationPosition.slice(0, 4)}` : '';
      return u8aToHex(new TextEncoder('utf-8').encode(`ChainX:${currentAddress}${channel}${positionSlice}`)).replace(
        /^0x/,
        ''
      );
    };

    const chainxAddressHex = getChainXAddressHex(recommendChannel, lockLocationPosition);

    const findOne = {
      desc1: '',
      value1: chainxAddressHex,
      desc2: <FormattedMessage id={'PublicMultiSigTrusteeAddress'} />,
      value2: btcTrusteeAddress,
      warn: (
        <Warn>
          <div className={styles.hoverImg}>
            <FormattedMessage id={'WalletOpreturnSupport'}>
              {msg => {
                const links = [
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://bitpie.com/' }}>
                        Bitpie
                      </RouterGo>
                    ),
                    style: { left: -100 },
                    src: bitpieOpreturn,
                    imgWidth: 244,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'http://www.mathwallet.org/' }}>
                        MathWallet
                      </RouterGo>
                    ),
                    src: MathWallet,
                    imgWidth: 244,
                    show: true,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://www.bitportal.io/zh/' }}>
                        BitPortal
                      </RouterGo>
                    ),
                    src: bitportal,
                    imgWidth: 244,
                    show: true,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://wookong.nbltrust.com/' }}>
                        WOOKONG
                      </RouterGo>
                    ),
                    src: WOOKONG,
                    imgWidth: 506,
                    show: true,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/BitX/releases' }}>
                        BitX
                      </RouterGo>
                    ),
                    src: BitX,
                    imgWidth: 244,
                    show: true,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://trezor.io/' }}>
                        Trezor
                      </RouterGo>
                    ),
                    src: trezor,
                    imgWidth: 352,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://coinb.in/#newTransaction' }}>
                        Coinb.in
                      </RouterGo>
                    ),
                    src: coinbin,
                    imgWidth: 650,
                  },
                ].map((item, index) => (
                  <span key={index} className={styles.anchor}>
                    <HoverTip
                      width={item.imgWidth}
                      tip={<img src={item.src} width={item.imgWidth} />}
                      className={styles.imgtip}>
                      {item.content}
                    </HoverTip>
                    {index === 6 ? null : ', '}
                  </span>
                ));
                const msgs = msg.split('OP_RETURN_replace');
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
    };

    const BTC = (
      <>
        <div className={styles.desc}>
          <span className={styles.step}>
            <FormattedMessage id={'FistStep'} />
          </span>
          <span className={styles.bold}>
            <LanguageContent zh={'创建锁仓地址'} en={'Create Lock-up Address'} />
          </span>
          <div>
            <LanguageContent
              zh={
                '使用任意BTC钱包创建1或3开头的BTC地址用于锁仓。但请注意使用该新钱包的任意转出操作都可能花费锁仓金额，而导致锁仓挖矿停止。'
              }
              en={
                'Create a new BTC adress starting at 1 or 3 with any BTC wallet,which will be used to lock-up.However, please note that any arbitrary roll-out operation of the new wallet will results in the stopping of lock-up mining.'
              }
            />
          </div>
        </div>

        <div className={styles.desc}>
          <span className={styles.step}>
            <FormattedMessage id={'SecondStep'} />
          </span>
          <span className={styles.bold}>
            <LanguageContent zh={'生成OP_RETURN'} en={'Generate OP_RETURN'} />
          </span>
          <div>
            <LanguageContent
              zh={'输入你创建的BTC锁仓地址。'}
              en={'Enter the BTC lock-up address you created in the previous step.'}
            />

            <div className={styles.lockpositionaddress}>
              <FormattedMessage id={'BTCLockPosition'}>
                {msg => (
                  <Input.Text
                    errMsg={lockLocationPositionErrMsg}
                    placeholder={msg}
                    value={lockLocationPosition}
                    onChange={value => {
                      this.setState({
                        lockLocationPosition: value,
                      });
                    }}
                    onBlur={this.checkAll.checkLockLocationPosition}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        </div>

        <div className={classNames(styles.grayblock, styles.addressall, styles.btcopreturn)}>
          <div className={styles.address}>
            <div className={styles.OP_RETURNtitle}>
              <strong>
                <FormattedMessage id={'InformationToFilled'} values={{ data: 'OP_RETURN' }} />
              </strong>
              {chainxAddressHex ? (
                <>
                  <Input.Checkbox
                    value={isAddChanel}
                    size="small"
                    className={styles.addChannel}
                    onClick={() => {
                      this.setState(
                        {
                          isAddChanel: !isAddChanel,
                        },
                        () => {
                          this.setState({
                            recommendChannelSelect: '',
                          });
                        }
                      );
                    }}>
                    <span className={!isAddChanel ? styles.addChanneldesc : null}>
                      <FormattedMessage id={'AddOptionalChannel'} />
                    </span>
                  </Input.Checkbox>
                  {/*<Clipboard*/}
                  {/*id="copy"*/}
                  {/*dataText={findOne.value1}*/}
                  {/*outInner={*/}
                  {/*<span className={styles.desc}>*/}
                  {/*<FormattedMessage id={'CopyMessage'} />*/}
                  {/*</span>*/}
                  {/*}*/}
                  {/*/>*/}
                </>
              ) : (
                <span className={styles.warnwritebtc}>
                  <LanguageContent zh={'请先输入BTC锁仓地址'} en={'Enter the BTC Lock-up address'} />
                </span>
              )}
            </div>
            {chainxAddressHex && (
              <div className={styles.OP_RETURNcopy}>
                <div className={styles.select}>
                  <OptionalChannelSelect
                    isAddChanel={isAddChanel}
                    {...this.props}
                    recommendChannelSelect={recommendChannelSelect}
                    updateRecommendChannelSelect={value => {
                      this.setState({
                        recommendChannelSelect: value,
                      });
                    }}
                  />
                </div>
                <Clipboard>{findOne.value1}</Clipboard>
                {/*<span id="copy"></span>*/}

                {/*<HoverTip tip={<FormattedMessage id={'BTCMapToChainXAddress'} />}>*/}
                {/*<Icon name={'icon-jieshishuoming'} />*/}
                {/*</HoverTip>*/}
              </div>
            )}
          </div>
        </div>
        <div className={styles.desc}>
          <span className={styles.step}>
            <FormattedMessage id={'ThirdStep'} />
          </span>
          <span className={styles.bold}>
            <LanguageContent zh={'发起锁仓交易'} en={'Launching Lock-in Trading'} />
          </span>
          <div>
            <LanguageContent
              zh={
                '使用支持OP_RETURN的钱包向锁仓地址转账（转账金额即锁仓金额），并输入OP_RETURN信息。注意：单笔BTC锁仓金额必须 >=0.01 BTC；单个BTC锁仓地址总额必须 <=10 BTC；单个ChainX地址锁仓总额不限。'
              }
              en={
                'Transfer BTC to the lock-up address that supports OP_RETURN,( transfer amount is lockup amount),and enter OP_RETUREN information. Please note that the amount of single BTC lock-up must be >=0.01BTC,the total amount of single BTC lock-up must be<=10BTC, the amount of single ChainX lock-up is unlimited.'
              }
            />
          </div>
        </div>
      </>
    );

    return (
      <Modal
        scroll={true}
        title={
          <div className={styles.title}>
            {<FormattedMessage id={'CrossChainLock'} />}({token})
            <div className={styles.lock}>
              <RouterGo
                isOutSide
                go={{
                  pathname: 'https://chainx.org/help?title=%E5%A6%82%E4%BD%95%E8%B7%A8%E9%93%BE%E9%94%81%E4%BB%93BTC',
                }}>
                <Icon name={'help'} />
                <FormattedMessage id={'LockCourse'} />
              </RouterGo>
              {isElectron() ? null : (
                <span className={styles.warntitle}>
                  <FormattedMessage id={'DoNotLockDemoAccount'} />
                </span>
              )}
            </div>
          </div>
        }
        isOverflow>
        <div className={styles.crossChainBind}>
          <div className={styles.btccontent}>
            {BTC}
            <Button
              size="full"
              type="confirm"
              onClick={() => {
                closeModal();
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
            <div className={styles.warn}>{findOne.warn}</div>
          </div>
        </div>
      </Modal>
    );
  }
}

@observer
class S_DOT extends Mixin {
  constructor(props) {
    super(props);
    this.state = {
      isAddChanel: '',
      recommendChannelSelect: '',
      tradeId: '',
      tradeIdErrMsg: '',
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
      return `0x${result[3]}`;
    }
  };

  render() {
    const { checkAll } = this;
    const { recommendChannelSelect = {}, tradeId, tradeIdErrMsg, isAddChanel } = this.state;
    const recommendChannel = recommendChannelSelect.value;
    const {
      accountStore: { currentAddress },
      assetStore: { dispatch, bindTxHashLoading },
      globalStore: {
        language,
        modal: {
          data: { token },
        },
      },
      getChainXAddressHex,
      showButton,
    } = this.props;

    const chainxAddressHex = getChainXAddressHex(recommendChannel, currentAddress);

    const findOne = {
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
                        imToken
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
                        Bitpie
                      </RouterGo>
                    ),
                    style: { left: -100 },
                    src: bitpie,
                    imgWidth: 244,
                  },
                  {
                    content: (
                      <RouterGo isOutSide go={{ pathname: 'https://www.coinomi.com/' }}>
                        Coinomi
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
                    {index === 7 ? null : ', '}
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
    };

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
              <Input.Checkbox
                value={isAddChanel}
                size="small"
                className={styles.addChannel}
                onClick={() => {
                  this.setState(
                    {
                      isAddChanel: !isAddChanel,
                    },
                    () => {
                      this.setState({
                        recommendChannelSelect: '',
                      });
                    }
                  );
                }}>
                <span className={!isAddChanel ? styles.addChanneldesc : null}>
                  <FormattedMessage id={'AddOptionalChannel'} />
                </span>
              </Input.Checkbox>
            </div>

            <div className={styles.OP_RETURNcopy}>
              {isAddChanel && (
                <div className={styles.select}>
                  <OptionalChannelSelect
                    isAddChanel={isAddChanel}
                    {...this.props}
                    recommendChannelSelect={recommendChannelSelect}
                    updateRecommendChannelSelect={value => {
                      this.setState({
                        recommendChannelSelect: value,
                      });
                    }}
                  />
                </div>
              )}

              <div>
                <Clipboard>{findOne.value1}</Clipboard>
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
          {showButton && (
            <Button
              size="full"
              type="confirm"
              loading={bindTxHashLoading}
              onClick={() => {
                if (checkAll.confirm()) {
                  const ethHash = this.getTradeId();
                  dispatch({
                    type: 'bindTxHash',
                    payload: ethHash,
                  })
                    .then(resp => {
                      const res = resp.res;
                      const reloadAssetData = resp.success;
                      if (res && res.hash) {
                        const url = 'https://scan.chainx.org/txs/' + res.hash;
                        const option = {
                          autoClose: 6000,
                          needLink: true,
                          link: url,
                        };
                        Toast.success(<FormattedMessage id="MapToastSuccess" />, res.hash, option);
                        reloadAssetData();
                      } else if (res && res.error_code) {
                        Toast.warn(<FormattedMessage id="MapToastFail" />, res.error_msg);
                      }
                    })
                    .catch(err => {
                      Toast.warn(<FormattedMessage id="MapToastFail" />, err.message);
                    });
                }
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          )}
        </div>
      </>
    );

    return (
      <Modal
        scroll={true}
        title={
          <div className={styles.title}>
            <FormattedMessage id={'CrossChainMapping'} />({showAssetName(token)})
            <div className={styles.sdotmap}>
              <RouterGo
                isOutSide
                go={{
                  pathname: 'https://chainx.org/help?title=%E5%A6%82%E4%BD%95%E8%B7%A8%E9%93%BE%E6%98%A0%E5%B0%84SDOT',
                }}>
                <Icon name={'help'} />
                <FormattedMessage id={'MappingCourse'} />
              </RouterGo>
              {isElectron() ? null : (
                <span className={styles.warntitle}>
                  <FormattedMessage id={'DoNotMapDemoAccount'} />
                </span>
              )}
            </div>
          </div>
        }
        isOverflow>
        <div className={styles.crossChainBind}>
          {SDOT}
          <div className={styles.warn}>{findOne.warn}</div>
        </div>
      </Modal>
    );
  }
}

@Inject(({ assetStore, electionStore }) => ({ assetStore, electionStore }))
class CrossChainBindModal extends Mixin {
  getChainXAddressHex = (recommendChannel, currentAddress) => {
    const channel = recommendChannel ? `@${recommendChannel}` : '';
    return u8aToHex(new TextEncoder('utf-8').encode(`${currentAddress}${channel}`)).replace(/^0x/, '');
  };

  render() {
    const {
      globalStore: {
        modal: {
          data: { token },
        },
      },
    } = this.props;

    const props = {
      ...this.props,
      getChainXAddressHex: this.getChainXAddressHex,
      showButton: isElectron() || process.env.NODE_ENV === 'development',
    };

    return (
      <>
        {token === 'SDOT' && <S_DOT {...props} />}
        {token === 'BTC' && <X_BTC {...props} />}
        {token === 'L-BTC' && <L_BTC {...props} />}
      </>
    );
  }
}

export default CrossChainBindModal;
