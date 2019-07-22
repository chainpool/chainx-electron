import React, { Component } from 'react';
import * as styles from './index.less';
import { Mixin } from '../../components';
import ProposalSwitchTrustee from './ProposalSwitchTrustee';
import { classNames } from '../../utils';

class CurrentProposal extends Mixin {
  state = {
    active: 'switch',
  };
  render() {
    const { active } = this.state;
    const {
      model: { name },
    } = this.props;
    return (
      <div className={styles.CurrentProposal}>
        <div className={styles.title}>当前提议</div>
        <ul>
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
        <ProposalSwitchTrustee />
      </div>
    );
  }
}

export default CurrentProposal;
