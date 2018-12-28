import React from 'react';
import SwitchPair from './Mixin/SwitchPair';

import * as styles from './PutOrder.less';

class PutOrder extends SwitchPair {
  state = {};

  startInit = () => {};

  render() {
    return <div className={styles.putOrder}>putorder</div>;
  }
}

export default PutOrder;
