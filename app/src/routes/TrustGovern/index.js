import React from 'react';
import { Inject } from '../../utils';
import { BreadCrumb, TableTitle } from '../components';
import { Mixin } from '../../components';
import CurrentTrustee from './CurrentTrustee';
import CurrentProposal from './CurrentProposal';
import ProposalSelectModal from './Modal/ProposalSelectModal';
import SelectNodeModal from './Modal/SelectNodeModal';
import TrusteeSwitchModal from './Modal/TrusteeSwitchModal';
import * as styles from './index.less';

@Inject(({ trustGovernStore: model, globalStore }) => ({ model, globalStore }))
class TrustGovern extends Mixin {
  render() {
    const {
      model: {},
      globalStore: {
        modal: { name },
      },
    } = this.props;
    return (
      <div className={styles.trusteeGovern}>
        <BreadCrumb />
        <TableTitle title={'本届信托'} />
        <CurrentTrustee {...this.props} />
        <CurrentProposal {...this.props} />
        {name === 'startProposalModal' && <ProposalSelectModal {...this.props} />}
        {name === 'SelectNodeModal' && <SelectNodeModal {...this.props} />}
        {name === 'TrusteeSwitchModal' && <TrusteeSwitchModal {...this.props} />}
      </div>
    );
  }
}

export default TrustGovern;
