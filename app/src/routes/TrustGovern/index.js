import React from 'react';
import { Inject } from '../../utils';
import { BreadCrumb, TableTitle } from '../components';
import { Mixin } from '../../components';
import * as styles from './index.less';

@Inject(({ trustGovernStore: model }) => ({ model }))
class TrustGovern extends Mixin {
  render() {
    const {
      model: { name },
    } = this.props;
    return (
      <div className={styles.trusteeGovern}>
        <BreadCrumb />
        <TableTitle title={'本届信托'} />
        <div>{name}</div>
      </div>
    );
  }
}

export default TrustGovern;
