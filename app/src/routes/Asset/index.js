import React from 'react';
import { Mixin } from '../../components';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ assetStore: model }) => ({ model }))
class Asset extends Mixin {
  state = {};

  startInit = () => {};

  render() {
    return <div className={styles.asset}>资产</div>;
  }
}

export default Asset;
