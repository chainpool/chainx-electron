import React, { Component } from 'react';
import * as styles from './index.less';
import { Mixin } from '../../components';

class ProposalSwitchTrustee extends Mixin {
  render() {
    const {
      model: { name },
    } = this.props;
    return <div className={styles.ProposalSwitchTrustee}>ProposalSwitchTrustee</div>;
  }
}

export default ProposalSwitchTrustee;
