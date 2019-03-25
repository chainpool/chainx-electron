import React from 'react';
import { Mixin, ButtonGroup, Button, Icon, Clipboard } from '../../components';
import * as styles from './index.less';
import { TableTitle } from '../components';
import { Inject, toJS } from '../../utils';
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
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getAllWithdrawalList' });
    dispatch({
      type: 'getSomeOneInfo',
    });
    this.getSign();
  };

  getSign = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getWithdrawTx',
    });
  };

  render() {
    const {
      model: { tx, signStatus, signTrusteeList = [] },
    } = this.props;
    const {
      accountStore: {
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

    const isShowWithdraw =
      currentTrustNode &&
      currentTrustNode.connected &&
      currentTrustNode.decodedHotPrivateKey &&
      normalizedOnChainAllWithdrawList.length > 0;

    const isAnyUseableWithdraws = normalizedOnChainAllWithdrawList.filter((item = {}) => item.status === 'applying');
    const isSelfSign = signTrusteeList.filter((item = {}) => item.trusteeSign && item.isSelf)[0];

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
        <TableTitle title={`信托设置`} className={styles.title}>
          <span>{`（您当前是：${isTrustee ? '信托' : isActiveValidator ? '验证' : '候选'}节点）`}</span>
          <Button
            onClick={() => {
              openModal({ name: 'TrustSetting' });
            }}>
            <Icon name="icon-shezhixintuo" />
            <span>设置信托</span>
          </Button>
        </TableTitle>
        <SettingTable {...this.props} />
        <div />
        {signTrusteeList.length ? (
          <div className={styles.signStatus}>
            <TableTitle title={'响应列表'}>
              <div id="copy" style={{ width: 1, height: 1, overflow: 'hidden' }}>
                <span>{tx}</span>
              </div>
              {tx ? (
                <ButtonGroup>
                  <Button>
                    <Clipboard id="copy" outInner={<span className={styles.desc}>复制待签原文</span>} />
                  </Button>
                  {isShowWithdraw && !isSelfSign ? (
                    <Button
                      type="success"
                      onClick={() => {
                        openModal({ name: 'WithdrawSignModal' });
                      }}>
                      响应多签提现
                    </Button>
                  ) : null}
                </ButtonGroup>
              ) : null}
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
          <TableTitle title={'提现列表'} className={styles.withdrawTitle}>
            {isShowWithdraw ? (
              <ButtonGroup>
                {signStatus === false ? null : isAnyUseableWithdraws.length ? (
                  <Button
                    onClick={() => {
                      openModal({ name: 'WithdrawConstructModal' });
                    }}>
                    <Icon name="icon-goujiantixian" />
                    构造多签提现
                  </Button>
                ) : null}
              </ButtonGroup>
            ) : null}
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
