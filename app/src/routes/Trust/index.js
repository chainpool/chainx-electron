import React from 'react';
import { Mixin, ButtonGroup, Button, Icon, Clipboard, FormattedMessage } from '../../components';
import * as styles from './index.less';
import { TableTitle } from '../components';
import { Inject } from '../../utils';
import SettingTable from './SettingTable';
import ImportHotPrivateKeyModal from './Modal/ImportHotPrivateKeyModal';
import NodeSettingModal from './Modal/NodeSettingModal';
import WithdrawTable from './WithdrawTable';
import WithdrawConstructModal from './Modal/WithdrawConstructModal';
import WithdrawSignModal from './Modal/WithdrawSignModal';
import TrustSetting from './Modal/TrustSettingModal';

@Inject(({ trustStore: model, accountStore, assetStore }) => ({ model, accountStore, assetStore }))
class Trust extends Mixin {
  startInit = () => {
    this.fetchPoll(this.getAllWithdrawalList);
    this.fetchPoll(this.getSign);
    this.getSomeOneInfo();
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
      model: { tx, signTrusteeList = [] },
    } = this.props;

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
      model: { trusts = [], normalizedOnChainAllWithdrawList = [] },
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
      isTrustee &&
      currentTrustNode &&
      currentTrustNode.connected &&
      currentTrustNode.decodedHotPrivateKey &&
      normalizedOnChainAllWithdrawList.length > 0 &&
      !isSelfSign;

    const isShowConstructureWithdraw =
      isTrustee &&
      normalizedOnChainAllWithdrawList.filter((item = {}) => item.status === 'signing' || item.status === 'processing')
        .length === 0 &&
      normalizedOnChainAllWithdrawList.filter((item = {}) => item.status === 'applying').length > 0;

    const renderSignLi = (one, index) => {
      return (
        <li key={index}>
          {one.name}
          {one.isSelf && ' (本人)'}
        </li>
      );
    };

    return (
      <div className={styles.trust}>
        {isValidator && (
          <div className={styles.setting}>
            <TableTitle title={<FormattedMessage id={'TrusteeSettings'} />} className={styles.title}>
              <span className={styles.nodeStyle}>
                (您当前是：
                {isTrustee ? (
                  <FormattedMessage id={'TrusteeNode'} />
                ) : isActiveValidator ? (
                  <FormattedMessage id={'ValidatorNode'} />
                ) : (
                  <FormattedMessage id={'StandbyNode'} />
                )}
                )
              </span>
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
            </TableTitle>
            <SettingTable {...this.props} />
          </div>
        )}
        {signTrusteeList.length && tx ? (
          <div className={styles.signStatus}>
            <TableTitle title={'响应列表'}>
              <div id="copy" style={{ width: 1, height: 1, overflow: 'hidden' }}>
                <span>{tx}</span>
              </div>
              <ButtonGroup>
                <Button>
                  <Clipboard id="copy" outInner={<span className={styles.desc}>复制待签原文</span>} />
                </Button>
                <Button
                  {...(isShowResponseWithdraw ? { type: 'success' } : { type: 'disabeld' })}
                  onClick={() => {
                    openModal({ name: 'WithdrawSignModal' });
                  }}>
                  响应多签提现
                </Button>
              </ButtonGroup>
            </TableTitle>
            <ul>
              <li>
                <Icon name="icon-wancheng" className={'green'} />
                <span>已签名</span>
                <ul>
                  {signTrusteeList
                    .filter((item = {}) => item.trusteeSign)
                    .map((one, index) => renderSignLi(one, index))}
                </ul>
              </li>
              <li>
                <Icon name="icon-cuowu" className={'red'} />
                <span>已否决</span>
                <ul>
                  {signTrusteeList
                    .filter((item = {}) => item.trusteeSign === false)
                    .map((one, index) => renderSignLi(one, index))}
                </ul>
              </li>
              <li>
                <Icon name="weixiangying" className={'yellow'} />
                <span>未响应</span>
                <ul>
                  {signTrusteeList
                    .filter((item = {}) => item.trusteeSign !== false && item.trusteeSign !== true)
                    .map((one, index) => renderSignLi(one, index))}
                </ul>
              </li>
            </ul>
          </div>
        ) : null}

        <div className={styles.withdraw}>
          <TableTitle title={<FormattedMessage id={'WithdrawalList'} />} className={styles.withdrawTitle}>
            <ButtonGroup>
              <Button
                {...(isShowConstructureWithdraw ? {} : { type: 'disabeld' })}
                onClick={() => {
                  openModal({ name: 'WithdrawConstructModal' });
                }}>
                <Icon name="icon-goujiantixian" />
                <FormattedMessage id={'BuildMultiSigWithdrawal'} />
              </Button>
            </ButtonGroup>
          </TableTitle>
          <WithdrawTable {...props} />
        </div>
        {name === 'ImportHotPrivateKeyModal' ? <ImportHotPrivateKeyModal {...props} /> : null}
        {name === 'NodeSettingModal' ? <NodeSettingModal {...props} /> : null}
        {name === 'WithdrawConstructModal' ? <WithdrawConstructModal {...props} /> : null}
        {name === 'WithdrawSignModal' ? <WithdrawSignModal {...props} /> : null}
        {name === 'TrustSetting' ? <TrustSetting {...props} /> : null}
      </div>
    );
  }
}

export default Trust;
