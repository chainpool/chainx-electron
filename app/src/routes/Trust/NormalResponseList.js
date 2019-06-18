import React, { Component } from 'react';
import { ButtonGroup, Button, Icon, Clipboard, FormattedMessage, RouterGo, Scroller } from '../../components';
import { HoverTip } from '../components';
import { classNames } from '../../utils';
import SignChannelSelectModal from './Modal/SignChannelSelectModal';
import { blockChain } from '../../constants';
import * as styles from './index.less';

class NormalResponseList extends Component {
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
        redeemScript,
        txOutputList = [],
        txInputList = [],
        signTrusteeList = [],
        trusts = [],
        normalizedOnChainAllWithdrawList = [],
        maxSignCount,
        totalSignCount,
        signHash,
        BitCoinFeeShow,
        isTestBitCoinNetWork,
      },
    } = this.props;
    const currentTrustNode =
      trusts.filter((item = {}) => item.chain === 'Bitcoin' && address === item.address)[0] || {};

    const isSelfSign = signTrusteeList.filter(
      (item = {}) => (item.trusteeSign === true || item.trusteeSign === false) && item.isSelf
    )[0];

    const isShowResponseWithdraw =
      isTrustee && currentTrustNode && normalizedOnChainAllWithdrawList.length > 0 && !isSelfSign;

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

    return isTrustee && signTrusteeList.length > 0 && tx ? (
      <div>
        <div className={styles.responsetitle}>多签提现</div>
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
                    className={styles.hoverTrusteeList}
                    tip={
                      <ul className={styles.account}>
                        {notResponseList.map((one, index) => renderSignLi(one, index))}
                      </ul>
                    }>
                    {notResponseList.length}/{totalSignCount}
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
                    className={styles.hoverTrusteeList}
                    tip={
                      <ul className={styles.account}>{haveSignList.map((one, index) => renderSignLi(one, index))}</ul>
                    }>{`${haveSignList.length}/${maxSignCount}`}</HoverTip>
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
                    tip={
                      <ul className={styles.account}>{haveRefuseList.map((one, index) => renderSignLi(one, index))}</ul>
                    }>
                    {`${haveRefuseList.length}/${totalSignCount - maxSignCount + 1}`}
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
                  <RouterGo
                    isOutSide
                    go={{ pathname: blockChain.tx(signHash, isTestBitCoinNetWork()) }}
                    className={styles.hashvalue}>
                    {signHash}
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
    ) : null;
  }
}

export default NormalResponseList;
