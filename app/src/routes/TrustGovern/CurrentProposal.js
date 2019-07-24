import React, { Component } from 'react';
import * as styles from './index.less';
import { Mixin, Button } from '../../components';
import ProposalSwitchTrustee from './ProposalSwitchTrustee';
import { classNames } from '../../utils';

class CurrentProposal extends Mixin {
  state = {
    active: 'switch',
  };

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getParticularAccounts',
    });
    dispatch({
      type: 'getMultiSigAddrInfo',
    });
    dispatch({
      type: 'getPendingListFor',
    });
  };
  render() {
    const { active } = this.state;
    const {
      model: { name, openModal },
    } = this.props;
    return (
      <div className={styles.CurrentProposal}>
        <div className={styles.title}>
          当前提议
          <Button
            type="confirm"
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
            { name: '信托换届', value: 'switch' },
            { name: '手续费调整' },
            { name: '移除未认领' },
            { name: '撤销用户提现' },
          ].map((item, index) => (
            <li key={index} className={classNames(active === item.value ? styles.active : null)}>
              {item.name}
            </li>
          ))}
        </ul>
        {active === 'switch' && <ProposalSwitchTrustee {...this.props} />}
      </div>
    );
  }
}

export default CurrentProposal;
