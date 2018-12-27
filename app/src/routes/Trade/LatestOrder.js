import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import { Inject } from '../../utils';
import * as styles from './index.less';

class Trade extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    return <div className={styles.trade}>hahahhah</div>;
  }
}

export default Trade;
