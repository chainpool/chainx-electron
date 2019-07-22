import React from 'react';
import { Inject } from '../../utils';
import { BreadCrumb, TableTitle } from '../components';
import { Mixin } from '../../components';
import CurrentTrustee from './CurrentTrustee';
import CurrentProposal from './CurrentProposal';
import * as styles from './index.less';

@Inject(({ trustGovernStore: model }) => ({ model }))
class TrustGovern extends Mixin {
  render() {
    const {
      model: {},
    } = this.props;
    return (
      <div className={styles.trusteeGovern}>
        <BreadCrumb />
        <TableTitle title={'本届信托'} />
        <CurrentTrustee {...this.props} />
        <CurrentProposal {...this.props} />
      </div>
    );
  }
}

export default TrustGovern;
