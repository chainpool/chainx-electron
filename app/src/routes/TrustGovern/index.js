import React from 'react';
import { Inject } from '../../utils';
import { BreadCrumb } from '../components';
import { Mixin } from '../../components';
import * as styles from './index.less';

class TrustGovern extends Mixin {
  render() {
    return (
      <div className={styles.trusteeGovern}>
        <BreadCrumb />
      </div>
    );
  }
}

export default TrustGovern;
