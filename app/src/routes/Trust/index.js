import React from 'react';
import { Mixin, ButtonGroup, Button, Icon, Clipboard, FormattedMessage, RouterGo, Scroller } from '../../components';
import { HoverTip, TableTitle } from '../components';
import { Inject, classNames } from '../../utils';
import SettingTable from './SettingTable';
import ImportHotPrivateKeyModal from './Modal/ImportHotPrivateKeyModal';
import NodeSettingModal from './Modal/NodeSettingModal';
import WithdrawTable from './WithdrawTable';
import WithdrawConstructModal from './Modal/WithdrawConstructModal';
import WithdrawSignModal from './Modal/WithdrawSignModal';
import TrustSetting from './Modal/TrustSettingModal';
import SignChannelSelectModal from './Modal/SignChannelSelectModal';
import SignResultModal from './Modal/SignResultModal';
import ConstructSpecialTradeModal from './Modal/ConstructSpecialTradeModal';
import AnalyzeSpecialTradeModal from './Modal/AnalyzeSpecialTradeModal';
import ExportHardwarePubKey from './Modal/ExportHardwarePubKey';
import ViewHardwarePubKey from './Modal/ViewHardwarePubKey';
import AfterSelectChannelModal from './Modal/AfterSelectChannelModal';
import { blockChain } from '../../constants';
import * as styles from './index.less';

@Inject(({ trustStore: model, accountStore, assetStore }) => ({ model, accountStore, assetStore }))
class Trust extends Mixin {
  startInit = () => {
    this.fetchPoll(this.getAllWithdrawalList);
    this.fetchPoll(this.getSign);
    this.getSomeOneInfo();
    this.getMinimalWithdrawalValueByToken();
    // this.props.model.openModal({
    //   name: 'ViewHardwarePubKey',
    // });
  };

  getAllWithdrawalList = async () => {
    const {
      model: { dispatch },
    } = this.props;
    this.subscribeAllWithdrawalList$ = await dispatch({ type: 'getAllWithdrawalList' });
  };

  getSomeOneInfo = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getSomeOneInfo',
    });
  };

  getMinimalWithdrawalValueByToken = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getMinimalWithdrawalValueByToken',
    });
  };

  getSign = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getWithdrawTx',
    });
  };

  componentWillUnsubscribe = () => {
    this.subscribeAllWithdrawalList$.unsubscribe();
  };

  render() {
    const {
      accountStore: {
        isValidator,
        isTrustee,
        isActiveValidator,
        openModal,
        currentAccount: { address },
      },
      globalStore: {
        modal: { name },
      },
      model: {
        setPrecision,
        dispatch,
        tx,
        redeemScript,
        txOutputList = [],
        txInputList = [],
        signTrusteeList = [],
        trusts = [],
        normalizedOnChainAllWithdrawList = [],
        maxSignCount,
        signHash,
        BitCoinFeeShow,
        isTestBitCoinNetWork,
      },
    } = this.props;
    const currentTrustNode =
      trusts.filter((item = {}) => item.chain === 'Bitcoin' && address === item.address)[0] || {};
    const props = {
      ...this.props,
      currentTrustNode,
    };

    const isSelfSign = signTrusteeList.filter(
      (item = {}) => (item.trusteeSign === true || item.trusteeSign === false) && item.isSelf
    )[0];

    const isShowResponseWithdraw =
      isTrustee && currentTrustNode && normalizedOnChainAllWithdrawList.length > 0 && !isSelfSign;

    const isShowConstructureWithdraw =
      isTrustee &&
      normalizedOnChainAllWithdrawList.filter((item = {}) => {
        return item.status.value.toUpperCase() === 'SIGNING' || item.status.value === 'PROCESSING';
      }).length === 0 &&
      normalizedOnChainAllWithdrawList.filter((item = {}) => item.status.value.toUpperCase() === 'APPLYING').length > 0;

    const haveSignList = signTrusteeList.filter((item = {}) => item.trusteeSign);
    const haveRefuseList = signTrusteeList.filter((item = {}) => item.trusteeSign === false);
    const notResponseList = signTrusteeList.filter(
      (item = {}) => item.trusteeSign !== false && item.trusteeSign !== true
    );

    const totalInputValue = txInputList.reduce((sum, next) => sum + Number(next.satoshi), 0);
    const totalOutputValue = txOutputList.reduce((sum, next) => sum + Number(next.satoshi), 0);

    const renderSignLi = (one, index) => {
      return (
        <li key={index}>
          {one.name}
          {one.isSelf && (
            <>
              {' '}
              (<FormattedMessage id={'Self'} />)
            </>
          )}
        </li>
      );
    };

    const InputOutputList = (
      <div className={styles.inputoutput}>
        <div className={styles.input}>
          <div className={styles.title}>Input</div>
          <ul>
            {txInputList.map((item, index) => (
              <li key={index}>
                <div className={styles.from}>
                  <RouterGo isOutSide go={{ pathname: blockChain.tx(item.hash, isTestBitCoinNetWork()) }}>
                    <span className={styles.hash}>{item.hash}</span>
                  </RouterGo>
                  <span>({item.value})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.output}>
          <div className={styles.title}>Output</div>
          <ul>
            {txOutputList.map((item, index) => (
              <li key={index}>
                <div className={styles.left}>
                  <div className={styles.from}>
                    <RouterGo isOutSide go={{ pathname: blockChain.address(item.address, isTestBitCoinNetWork()) }}>
                      {item.address}
                    </RouterGo>
                    <span>({item.value})</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

    return (
      <div className={styles.trust}>
        {isValidator && (
          <div className={styles.setting}>
            <TableTitle title={<FormattedMessage id={'TrusteeSettings'} />} className={styles.title}>
              <span className={styles.nodeStyle}>
                (<FormattedMessage id={'YouAre'} />：
                {isTrustee ? (
                  <FormattedMessage id={'TrusteeNode'} />
                ) : isActiveValidator ? (
                  <FormattedMessage id={'ValidatorNode'} />
                ) : (
                  <FormattedMessage id={'StandbyNode'} />
                )}
                )
              </span>
              <div className={styles.setListbutton}>
                <Button
                  type="blank"
                  onClick={() => {
                    openModal({ name: 'TrustSetting' });
                  }}>
                  <Icon name="icon-shezhixintuo" />
                  <span>
                    <FormattedMessage id={'SetupTrustee'} />
                  </span>
                </Button>
                <div className={styles.utils}>
                  <Icon name="xintuogongju" />
                  信托工具
                  <div className={styles.utilsContainer}>
                    <ul>
                      <li
                        type="blank"
                        onClick={() => {
                          openModal({ name: 'ExportHardwarePubKey' });
                        }}>
                        <Icon name="daochugongyue" />
                        <span>导出硬件公钥</span>
                      </li>
                      {/*<li*/}
                      {/*type="blank"*/}
                      {/*onClick={() => {*/}
                      {/*openModal({ name: 'ConstructSpecialTradeModal' });*/}
                      {/*}}>*/}
                      {/*<Icon name="gouzaoteshujiaoyi" />*/}
                      {/*<span>构造特殊交易</span>*/}
                      {/*</li>*/}
                      {/*<li*/}
                      {/*type="blank"*/}
                      {/*onClick={() => {*/}
                      {/*openModal({ name: 'AnalyzeSpecialTradeModal' });*/}
                      {/*}}>*/}
                      {/*<Icon name="jiexi" />*/}
                      {/*<span>解析特殊交易</span>*/}
                      {/*</li>*/}
                    </ul>
                  </div>
                </div>
              </div>
            </TableTitle>
            <SettingTable {...this.props} />
          </div>
        )}
        {isTrustee && signTrusteeList.length > 0 && tx ? (
          <div>
            <div className={styles.responsetitle}>
              <FormattedMessage id={'ResponseList'} />
            </div>
            <div className={styles.signStatus}>
              <div className={styles.reslist}>
                <ul className={styles.statusList}>
                  <li>
                    <Icon name="icon-wancheng" className={'green'} />
                    <span>
                      <FormattedMessage id={'HaveSigned'} />
                    </span>
                    <span className={styles.count}>
                      <HoverTip
                        className={styles.hoverTrusteeList}
                        tip={<ul>{haveSignList.map((one, index) => renderSignLi(one, index))}</ul>}>{`${
                        haveSignList.length
                      }/${maxSignCount}`}</HoverTip>
                    </span>
                  </li>
                  <li>
                    <Icon name="weixiangying" className={'yellow'} />
                    <span>
                      <FormattedMessage id={'NoResponseSign'} />
                    </span>
                    <span className={styles.count}>
                      <HoverTip
                        className={styles.hoverTrusteeList}
                        tip={<ul>{notResponseList.map((one, index) => renderSignLi(one, index))}</ul>}>
                        {notResponseList.length}
                      </HoverTip>
                    </span>
                  </li>
                  <li>
                    <Icon name="icon-cuowu" className={'red'} />
                    <span>
                      <FormattedMessage id={'HaveVetoedSign'} />
                    </span>
                    <span className={styles.count}>
                      <HoverTip
                        className={styles.hoverTrusteeList}
                        tip={<ul>{haveRefuseList.map((one, index) => renderSignLi(one, index))}</ul>}>
                        {haveRefuseList.length}
                      </HoverTip>
                    </span>
                  </li>
                </ul>
                {signTrusteeList.filter((item = {}) => item.trusteeSign).length >= maxSignCount ? (
                  <div className={styles.completeSign}>
                    <div className={styles.resok}>
                      <FormattedMessage id={'ResponseOkThenDealing'} />
                    </div>
                    <div className={styles.hash}>
                      <RouterGo isOutSide go={{ pathname: blockChain.tx(signHash) }} className={styles.hashvalue}>
                        {signHash}
                      </RouterGo>
                      <div>
                        <FormattedMessage id={'TransactionHash'} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <ButtonGroup>
                    {/*<Button*/}
                    {/*{...(isShowResponseWithdraw ? { type: 'success' } : { type: 'disabeld' })}*/}
                    {/*onClick={() => {*/}
                    {/*openModal({ name: 'WithdrawSignModal' });*/}
                    {/*}}>*/}
                    {/**/}
                    {/*</Button>*/}
                    <Button
                      className={classNames(styles.signButton, isShowResponseWithdraw ? null : styles.disabeld)}
                      onClick={() => {
                        openModal({
                          name: 'SignChannelSelectModal',
                        });
                      }}>
                      签名
                    </Button>
                    <Button
                      className={classNames(styles.refuseButton, isShowResponseWithdraw ? null : styles.disabeld)}
                      onClick={() => {
                        openModal({
                          name: 'SignModal',
                          data: {
                            description: [
                              { name: 'operation', value: () => <FormattedMessage id={'RespondMultiSigWithdrawal'} /> },
                              {
                                name: () => <FormattedMessage id={'WhetherSignature'} />,
                                value: () => <FormattedMessage id={'FalseSign'} />,
                              },
                            ],
                            callback: () => {
                              return dispatch({
                                type: 'signWithdrawTx',
                                payload: {
                                  tx: null,
                                  redeemScript,
                                },
                              });
                            },
                          },
                        });
                      }}>
                      否决
                    </Button>
                  </ButtonGroup>
                )}
              </div>

              <div className={styles.copytx}>
                <div className={styles.tx}>
                  <span className={styles.txlabel}>待签原文:</span>
                  <Clipboard width={400}>{tx}</Clipboard>
                </div>
                <div className={styles.fees}>
                  <div>收取手续费： {BitCoinFeeShow} BTC</div>
                  <div>实付手续费：{setPrecision(totalInputValue - totalOutputValue, 'BTC')} BTC</div>
                </div>
              </div>
              <div className={styles.inputoutputContainer}>
                {txInputList.length > 4 || txOutputList.length > 4 ? (
                  <Scroller scroll={{ y: 330 }}>InputOutputList</Scroller>
                ) : (
                  InputOutputList
                )}
              </div>
            </div>
          </div>
        ) : null}

        <div className={styles.withdraw}>
          <TableTitle title={<FormattedMessage id={'WithdrawalList'} />} className={styles.withdrawTitle}>
            <ButtonGroup>
              {isTrustee ? (
                <Button
                  {...(isShowConstructureWithdraw ? {} : { type: 'disabeld' })}
                  onClick={() => {
                    openModal({ name: 'WithdrawConstructModal' });
                  }}>
                  <Icon name="icon-goujiantixian" />
                  <FormattedMessage id={'BuildMultiSigWithdrawal'} />
                </Button>
              ) : null}
            </ButtonGroup>
          </TableTitle>
          <WithdrawTable {...props} />
        </div>
        {name === 'ImportHotPrivateKeyModal' ? <ImportHotPrivateKeyModal {...props} /> : null}
        {name === 'NodeSettingModal' ? <NodeSettingModal {...props} /> : null}
        {name === 'WithdrawConstructModal' ? <WithdrawConstructModal {...props} /> : null}
        {name === 'WithdrawSignModal' ? <WithdrawSignModal {...props} /> : null}
        {name === 'TrustSetting' ? <TrustSetting {...props} /> : null}
        {name === 'SignChannelSelectModal' ? <SignChannelSelectModal {...props} /> : null}
        {name === 'SignResultModal' ? <SignResultModal {...props} /> : null}
        {name === 'ConstructSpecialTradeModal' ? <ConstructSpecialTradeModal {...props} /> : null}
        {name === 'AnalyzeSpecialTradeModal' ? <AnalyzeSpecialTradeModal {...props} /> : null}
        {name === 'ExportHardwarePubKey' ? <ExportHardwarePubKey {...props} /> : null}
        {name === 'ViewHardwarePubKey' ? <ViewHardwarePubKey {...props} /> : null}
        {name === 'AfterSelectChannelModal' ? <AfterSelectChannelModal {...props} /> : null}
      </div>
    );
  }
}

export default Trust;
