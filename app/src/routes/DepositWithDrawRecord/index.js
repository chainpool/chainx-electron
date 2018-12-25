import React from 'react';
import { Mixin } from '../../components';
import { BreadCrumb } from '../components';
import * as styles from './index.less';

class DepositWithDrawRecord extends Mixin {
  state = {};

  startInit = () => {};

  render() {
    return (
      <div className={styles.depositWithDrawRecord}>
        <BreadCrumb />
      </div>
    );
  }
}

export default DepositWithDrawRecord;
