import React, { Component } from 'react';
import * as styles from './index.less';
import { Mixin, Button } from '../../components';
import ProposalSwitchTrustee from './ProposalSwitchTrustee';
import { classNames, observer } from '../../utils';

@observer
class CurrentProposal extends Mixin {
  state = {
    active: '',
  };

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getParticularAccounts',
    });
    this.fetchPoll(() =>
      dispatch({
        type: 'getMultiSigAddrInfo',
      })
    );
    this.fetchPoll(() =>
      dispatch({
        type: 'getPendingListFor',
      })
    );
  };
  render() {
    const { active } = this.state;
    const {
      model: { openModal, trusteeProposal, getCurrentAccount },
      electionStore: { trustIntentions: trustIntentions_prev },
    } = this.props;
    const trustIntentions = trustIntentions_prev.slice();

    const canStartProposal = () => {
      const currentAccount = getCurrentAccount();
      return trustIntentions.find(item => item.address === currentAccount.address);
    };

    return (
      <div className={styles.CurrentProposal}>
        <div className={styles.title}>
          当前提议
          <Button
            type={canStartProposal() ? 'confirm' : 'disabled'}
            onClick={() => {
              openModal({
                name: 'startProposalModal',
              });
            }}>
            发起提议
          </Button>
        </div>
        <ul className={styles.operation}>
          {[
            { name: '信托换届', value: 'switch', disabled: !trusteeProposal },
            { name: '手续费调整', value: 'fee', disabled: true },
            { name: '移除未认领', value: 'removeUnclaimed', disabled: true },
            { name: '撤销用户提现', value: 'cancelWithdraw', disabled: true },
          ].map((item, index) => (
            <li
              key={index}
              className={classNames(
                active === item.value ? styles.active : null,
                item.disabled ? styles.disabled : null
              )}
              onClick={() => {
                if (!item.disabled) {
                  this.setState({
                    active: item.value,
                  });
                }
              }}>
              {item.name}
            </li>
          ))}
        </ul>
        {active === 'switch' && trusteeProposal && <ProposalSwitchTrustee {...this.props} />}
      </div>
    );
  }
}

export default CurrentProposal;
