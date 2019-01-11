import React from 'react';
import { Mixin } from '../../components';
import * as styles from './index.less';
import { TableTitle } from '../components';
import TrustTable from './TrustTable';
import { Inject } from '@utils';

@Inject(({ trustStore: model }) => ({ model }))
class Trust extends Mixin {
  state = {};

  startInit = () => {};

  render() {
    return (
      <div className={styles.trust}>
        <TableTitle title="信托列表">待签原文：5345773718cb9c8d09aa5345773718cb9c8d09aa5345773718cb9c8d09aa</TableTitle>
        <TrustTable {...this.props} />
      </div>
    );
  }
}

export default Trust;
