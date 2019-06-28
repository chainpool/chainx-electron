import React, { Component } from 'react';
import { ButtonGroup, Button, Icon, Clipboard, FormattedMessage, RouterGo, Scroller } from '../../components';
import { HoverTip } from '../components';
import { classNames, observer, getAllPubsFromRedeemScript } from '../../utils';
import SignChannelSelectModal from './Modal/SignChannelSelectModal';
import { blockChain } from '../../constants';
import * as styles from './index.less';

@observer
class ResponseList extends Component {
  render() {
    const {
      accountStore: {
        isTrustee,
        openModal,
        currentAccount: { address },
      },
      model: {
        setPrecision,
        dispatch,
        tx,
        txSpecial,
        redeemScript,
        redeemScriptSpecial,
        txOutputList = [],
        txInputList = [],
        txSpecialOutputList = [],
        txSpecialInputList = [],
        signTrusteeList = [],
        txSpecialSignTrusteeList = [],
        trusts = [],
        normalizedOnChainAllWithdrawList = [],
        maxSignCount,
        totalSignCount,
        signHash,
        BitCoinFeeShow,
        isTestBitCoinNetWork,
      },
      isSpecialModel,
    } = this.props;
    const inputList = isSpecialModel ? txSpecialInputList : txInputList;
    const outputList = isSpecialModel ? txSpecialOutputList : txOutputList;
    const txMatchOne = isSpecialModel ? txSpecial : tx;
    const signTrusteeListMatch = isSpecialModel ? txSpecialSignTrusteeList : signTrusteeList;
    const totalSignCountMath = isSpecialModel
      ? txSpecialSignTrusteeList.length ||
        (redeemScriptSpecial && getAllPubsFromRedeemScript(redeemScriptSpecial).length)
      : totalSignCount;

    const currentTrustNode =
      trusts.filter((item = {}) => item.chain === 'Bitcoin' && address === item.address)[0] || {};

    const isSelfSign = signTrusteeListMatch.filter(
      (item = {}) => (item.trusteeSign === true || item.trusteeSign === false) && item.isSelf
    )[0];

    const isShowResponseWithdraw = isSpecialModel
      ? true
      : isTrustee && currentTrustNode && normalizedOnChainAllWithdrawList.length > 0 && !isSelfSign;

    const haveSignList = signTrusteeListMatch.filter((item = {}) => item.trusteeSign);
    const haveRefuseList = signTrusteeListMatch.filter((item = {}) => item.trusteeSign === false);
    const notResponseList = signTrusteeListMatch.filter(
      (item = {}) => item.trusteeSign !== false && item.trusteeSign !== true
    );
    const haveBroadcast = signTrusteeListMatch.filter((item = {}) => item.trusteeSign).length >= maxSignCount;

    const totalInputValue = inputList.reduce((sum, next) => sum + Number(next.satoshi), 0);
    const totalOutputValue = outputList.reduce((sum, next) => sum + Number(next.satoshi), 0);

    const showSpecialModel = isTrustee && txSpecial;
    const showNormalModel = isTrustee && signTrusteeListMatch.length > 0 && txMatchOne;

    const renderSignLi = (one, index) => {
      return (
        <li key={index}>
          {one.name}
          {one.isHotEntity ? <span>(热)</span> : one.isColdEntity ? <span>(冷)</span> : null}
          {one.isSelf && (
            <>
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
            {inputList.map((item, index) => (
              <li key={index}>
                <div className={styles.from}>
                  <RouterGo isOutSide go={{ pathname: blockChain.tx(item.hash, isTestBitCoinNetWork()) }}>
                    <span className={styles.hash}>{`0x${item.hash}`}</span>
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
            {outputList.map((item, index) => (
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

    const content = (
      <div>
        <div className={styles.responsetitle}>{isSpecialModel ? '特殊交易' : '多签提现'}</div>
        <div className={styles.signStatus}>
          <div className={styles.reslist}>
            <ul className={styles.statusList}>
              <li className={styles.notdealwith}>
                <Icon name="weixiangying" className={'yellow'} />
                <span>
                  <FormattedMessage id={'NoResponseSign'} />
                </span>
                <span className={styles.count}>
                  <HoverTip
                    width={550}
                    className={styles.hoverTrusteeList}
                    tip={
                      <ul className={styles.account}>
                        {notResponseList.map((one, index) => renderSignLi(one, index))}
                      </ul>
                    }>
                    {notResponseList.length}/{totalSignCountMath}
                  </HoverTip>
                </span>
              </li>
              <li>
                <Icon name="icon-wancheng" className={'green'} />
                <span>
                  <FormattedMessage id={'HaveSigned'} />
                </span>
                <span className={styles.count}>
                  <HoverTip
                    width={550}
                    className={styles.hoverTrusteeList}
                    tip={
                      <ul className={styles.account}>{haveSignList.map((one, index) => renderSignLi(one, index))}</ul>
                    }>
                    {isSpecialModel ? haveSignList.length : `${haveSignList.length}/${maxSignCount}`}
                  </HoverTip>
                </span>
              </li>
              {!isSpecialModel && (
                <li>
                  <Icon name="icon-cuowu" className={'red'} />
                  <span>
                    <FormattedMessage id={'HaveVetoedSign'} />
                  </span>
                  <span className={styles.count}>
                    <HoverTip
                      className={styles.hoverTrusteeList}
                      tip={
                        <ul className={styles.account}>
                          {haveRefuseList.map((one, index) => renderSignLi(one, index))}
                        </ul>
                      }>
                      {`${haveRefuseList.length}/${totalSignCountMath - maxSignCount + 1}`}
                    </HoverTip>
                  </span>
                </li>
              )}
            </ul>
            {haveBroadcast ? (
              <div className={styles.completeSign}>
                <div className={styles.resok}>
                  <FormattedMessage id={'ResponseOkThenDealing'} />
                </div>
                <div className={styles.hash}>
                  <RouterGo
                    isOutSide
                    go={{ pathname: blockChain.tx(signHash, isTestBitCoinNetWork()) }}
                    className={styles.hashvalue}>
                    {`0x${signHash}`}
                  </RouterGo>
                </div>
              </div>
            ) : (
              <ButtonGroup>
                <Button
                  className={classNames(styles.signButton, isShowResponseWithdraw ? null : styles.disabeld)}
                  onClick={() => {
                    openModal({
                      name: 'SignChannelSelectModal',
                      data: {
                        isSpecialModel,
                        haveSigned: haveSignList.length > 0,
                      },
                    });
                  }}>
                  签名
                </Button>
                {isSpecialModel ? (
                  <Button
                    className={classNames(
                      styles.refuseButton,
                      isShowResponseWithdraw ? null : styles.disabeld,
                      styles.gray
                    )}
                    onClick={() => {
                      dispatch({
                        type: 'updateTxSpecial',
                        payload: {
                          txSpecial: null,
                        },
                      });
                    }}>
                    取消
                  </Button>
                ) : (
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
                )}
              </ButtonGroup>
            )}
          </div>

          <div className={styles.copytx}>
            <div className={styles.tx}>
              <span className={styles.txlabel}>待签原文:</span>
              <Clipboard width={400}>{txMatchOne}</Clipboard>
            </div>
            <div className={styles.fees}>
              {!isSpecialModel && <div>收取手续费： {BitCoinFeeShow} BTC</div>}
              <div>实付手续费：{setPrecision(totalInputValue - totalOutputValue, 'BTC')} BTC</div>
            </div>
          </div>
          <div className={styles.inputoutputContainer}>
            {inputList.length > 4 || outputList.length > 4 ? (
              <Scroller scroll={{ y: 330 }}>InputOutputList</Scroller>
            ) : (
              InputOutputList
            )}
          </div>
        </div>
      </div>
    );

    return (isSpecialModel ? showSpecialModel : showNormalModel) ? content : null;
  }
}

export default ResponseList;
